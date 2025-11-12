import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { eq, desc, or } from "drizzle-orm";
import passport from "./passport-config";
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
      res.redirect("/");
    }
  );

  app.post("/auth/replit", async (req, res) => {
    try {
      const replitUserId = req.headers['x-replit-user-id'] as string;
      const replitUserName = req.headers['x-replit-user-name'] as string;

      if (!replitUserId || !replitUserName) {
        return res.status(401).json({ message: "Not authenticated with Replit" });
      }

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
        res.json({ success: true, user: { id: user.id, username: user.username } });
      });
    } catch (error) {
      console.error("Replit Auth error:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
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

      res.json({ gameState: saves.length > 0 ? saves[0].gameState : null });
    } catch (error) {
      console.error("Load error:", error);
      res.status(500).json({ message: "Failed to load progress" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
