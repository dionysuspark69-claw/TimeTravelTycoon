import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { eq, desc, or, sql } from "drizzle-orm";
import passport from "./passport-config";
import { getUserInfo } from "@replit/repl-auth";
import bcrypt from "bcrypt";
import { db } from "./db";
import { gameSaves, users, type User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      googleId: string | null;
      replitUserId: string | null;
      email: string | null;
      username: string;
      createdAt: Date;
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      console.log("🔑 OAuth callback - User authenticated:", req.user ? `${req.user.username} (ID: ${req.user.id})` : "NO USER");
      console.log("🔑 Session ID:", req.sessionID);
      
      if (!req.user) {
        console.error("✗ No user in session after OAuth callback!");
        return res.status(500).send("Authentication failed: No user in session");
      }
      
      // Explicitly save session before redirecting to ensure it's persisted to PostgreSQL
      req.session.save((err) => {
        if (err) {
          console.error("✗ Session save error:", err, err.stack);
          return res.status(500).send("Authentication failed: Could not save session");
        }
        
        // Verify user is authenticated after session save
        if (!req.isAuthenticated()) {
          console.error("✗ User not authenticated after session save!");
          return res.status(500).send("Authentication failed: Session not persisted");
        }
        
        console.log("✓ Session saved successfully, redirecting to game");
        res.redirect("/");
      });
    }
  );

  app.post("/auth/username", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || typeof username !== "string" || username.trim().length === 0) {
        return res.status(400).json({ message: "Username is required" });
      }

      if (!password || typeof password !== "string" || password.length === 0) {
        return res.status(400).json({ message: "Password is required" });
      }

      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 2 || trimmedUsername.length > 50) {
        return res.status(400).json({ message: "Username must be between 2 and 50 characters" });
      }

      if (password.length < 4) {
        return res.status(400).json({ message: "Password must be at least 4 characters" });
      }

      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.username, trimmedUsername))
        .limit(1);

      let user: User;
      if (existingUsers.length > 0) {
        user = existingUsers[0];
        
        if (!user.password) {
          return res.status(400).json({ message: "This account was created without a password. Please contact support." });
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          console.log("✗ Invalid password for user:", user.username);
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        console.log("✓ Existing user authenticated:", user.username);
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUsers = await db
          .insert(users)
          .values({
            username: trimmedUsername,
            password: hashedPassword,
            email: null,
            googleId: null,
            replitUserId: null,
          })
          .returning();
        user = newUsers[0];
        console.log("✓ New user created:", user.username);
      }

      req.login(user, (err) => {
        if (err) {
          console.error("✗ Username login error:", err);
          return res.status(500).json({ message: "Failed to log in" });
        }
        
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("✗ Session save error:", saveErr);
            return res.status(500).json({ message: "Failed to save session" });
          }
          
          console.log("✓ User logged in successfully:", user.username);
          res.json({ 
            success: true, 
            user: { 
              id: user.id, 
              username: user.username, 
              replitUserId: user.replitUserId, 
              googleId: user.googleId 
            } 
          });
        });
      });
    } catch (error) {
      console.error("✗ Username auth error:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });

  app.post("/auth/replit", async (req, res) => {
    try {
      const replitUserInfo = getUserInfo(req);

      if (!replitUserInfo || !replitUserInfo.id) {
        return res.status(401).json({ message: "Not authenticated with Replit" });
      }

      const replitUserId = replitUserInfo.id;
      const replitUserName = replitUserInfo.name || "Replit User";

      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.replitUserId, replitUserId))
        .limit(1);

      let user: User;
      if (existingUsers.length > 0) {
        user = existingUsers[0];
      } else {
        const newUsers = await db
          .insert(users)
          .values({
            replitUserId,
            username: replitUserName,
            email: null,
            googleId: null,
          })
          .returning();
        user = newUsers[0];
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Replit Auth login error:", err);
          return res.status(500).json({ message: "Failed to log in" });
        }
        res.json({ success: true, user: { id: user.id, username: user.username, replitUserId: user.replitUserId, googleId: user.googleId } });
      });
    } catch (error) {
      console.error("Replit Auth error:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      console.log("👤 /api/auth/user - Session ID:", req.sessionID);
      console.log("👤 /api/auth/user - Authenticated:", req.isAuthenticated());
      console.log("👤 /api/auth/user - User:", req.user ? `${req.user.username} (ID: ${req.user.id})` : "NO USER");
      
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      res.json({
        id: req.user.id,
        username: req.user.username,
        googleId: req.user.googleId,
        replitUserId: req.user.replitUserId,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  app.get("/api/db/test", async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT NOW()`);
      res.json({ ok: true, result });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Database connection failed" });
    }
  });

  app.post("/api/save", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { gameState } = req.body;

      const existingSaves = await db
        .select()
        .from(gameSaves)
        .where(eq(gameSaves.userId, req.user.id))
        .limit(1);

      if (existingSaves.length > 0) {
        await db
          .update(gameSaves)
          .set({
            gameState,
            lastUpdated: new Date(),
          })
          .where(eq(gameSaves.userId, req.user.id));
      } else {
        await db.insert(gameSaves).values({
          userId: req.user.id,
          gameState,
        });
      }

      res.set("Cache-Control", "no-store");
      res.json({ success: true });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  app.get("/api/load", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const saves = await db
        .select()
        .from(gameSaves)
        .where(eq(gameSaves.userId, req.user.id))
        .orderBy(desc(gameSaves.lastUpdated))
        .limit(1);

      res.set("Cache-Control", "no-store");
      res.json({ gameState: saves.length > 0 ? saves[0].gameState : null });
    } catch (error) {
      console.error("Load error:", error);
      res.status(500).json({ message: "Failed to load progress" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
