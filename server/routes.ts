import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { eq, desc, or, sql, asc } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import passport from "./passport-config";
import { getUserInfo } from "@replit/repl-auth";
import bcrypt from "bcrypt";
import { db } from "./db";
import { gameSaves, users, leaderboardEntries, type User } from "@shared/schema";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const saveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Save rate limit exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});

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
  app.get("/auth/google", authLimiter, passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      console.log("🔑 OAuth callback - User authenticated:", req.user ? req.user.username : "NO USER");
      
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

  app.post("/auth/username", authLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || typeof username !== "string" || username.trim().length === 0) {
        return res.status(400).json({ message: "Username is required" });
      }

      if (!password || typeof password !== "string" || password.length === 0) {
        return res.status(400).json({ message: "Password is required" });
      }

      const trimmedUsername = username.trim();
      const sanitizedUsername = trimmedUsername.replace(/[<>&"'`]/g, '');
      if (sanitizedUsername.length < 2) {
        return res.status(400).json({ message: "Username contains invalid characters" });
      }
      if (sanitizedUsername.length > 50) {
        return res.status(400).json({ message: "Username must be between 2 and 50 characters" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      if (password.length > 128) {
        return res.status(400).json({ message: "Password too long" });
      }

      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.username, sanitizedUsername))
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
            username: sanitizedUsername,
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
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Replit Auth session save error:", saveErr);
            return res.status(500).json({ message: "Failed to persist session" });
          }
          res.json({ success: true, user: { id: user.id, username: user.username, replitUserId: user.replitUserId, googleId: user.googleId } });
        });
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

  app.get("/api/db/test", async (req, res) => {
    try {
      const result = await db.execute(sql`SELECT NOW()`);
      res.json({ ok: true, result });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Database connection failed" });
    }
  });

  app.post("/api/save", requireAuth, saveLimiter, async (req, res) => {
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
        // Preserve _profile so saveGame doesn't overwrite what saveProfile wrote
        const existing = existingSaves[0].gameState as any;
        const merged = { ...gameState, _profile: existing?._profile };
        await db
          .update(gameSaves)
          .set({
            gameState: merged,
            lastUpdated: new Date(),
          })
          .where(eq(gameSaves.userId, req.user.id));
      } else {
        await db.insert(gameSaves).values({
          userId: req.user.id,
          gameState,
        });
      }

      // Update leaderboard entry (upsert)
      try {
        const gs = gameState as any;
        const leaderboardData = {
          userId: req.user.id,
          username: req.user.username,
          totalEarned: String(gs.totalEarned || 0),
          totalTripsCompleted: Number(gs.totalTripsCompleted || 0),
          totalCustomersServed: Number(gs.totalCustomersServed || 0),
          prestigeLevel: Number(gs.prestigeLevel || 0),
          timeMachineCount: Number(gs.timeMachineCount || 1),
          unlockedDestinationsCount: Number((gs.unlockedDestinations || []).length || 1),
          updatedAt: new Date(),
        };

        const existingEntry = await db
          .select()
          .from(leaderboardEntries)
          .where(eq(leaderboardEntries.userId, req.user.id))
          .limit(1);

        if (existingEntry.length > 0) {
          const prev = existingEntry[0];
          // Keep best values across prestiges - don't let a reset overwrite highs
          const mergedData = {
            ...leaderboardData,
            totalEarned: String(Math.max(parseFloat(String(prev.totalEarned || 0)), parseFloat(String(gs.totalEarned || 0)))),
            totalTripsCompleted: Math.max(Number(prev.totalTripsCompleted || 0), Number(gs.totalTripsCompleted || 0)),
            totalCustomersServed: Math.max(Number(prev.totalCustomersServed || 0), Number(gs.totalCustomersServed || 0)),
            timeMachineCount: Math.max(Number(prev.timeMachineCount || 1), Number(gs.timeMachineCount || 1)),
            unlockedDestinationsCount: Math.max(Number(prev.unlockedDestinationsCount || 1), Number((gs.unlockedDestinations || []).length || 1)),
            // prestigeLevel always keeps current (it only goes up)
            prestigeLevel: Number(gs.prestigeLevel || 0),
          };
          await db
            .update(leaderboardEntries)
            .set(mergedData)
            .where(eq(leaderboardEntries.userId, req.user.id));
        } else {
          await db.insert(leaderboardEntries).values(leaderboardData);
        }
      } catch (lbErr) {
        console.error("Leaderboard update error (non-fatal):", lbErr);
      }

      res.set("Cache-Control", "no-store");
      res.json({ success: true });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  // Leaderboard routes
  const VALID_CATEGORIES = ["totalEarned", "totalTripsCompleted", "totalCustomersServed", "prestigeLevel", "timeMachineCount", "unlockedDestinationsCount"] as const;
  type LeaderboardCategory = typeof VALID_CATEGORIES[number];

  const categoryColumn: Record<LeaderboardCategory, any> = {
    totalEarned: leaderboardEntries.totalEarned,
    totalTripsCompleted: leaderboardEntries.totalTripsCompleted,
    totalCustomersServed: leaderboardEntries.totalCustomersServed,
    prestigeLevel: leaderboardEntries.prestigeLevel,
    timeMachineCount: leaderboardEntries.timeMachineCount,
    unlockedDestinationsCount: leaderboardEntries.unlockedDestinationsCount,
  };

  app.get("/api/leaderboard/:category", async (req, res) => {
    try {
      const category = req.params.category as LeaderboardCategory;
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }

      // totalEarned is stored as text -- cast to numeric for correct sort
      const orderExpr = category === "totalEarned"
        ? desc(sql`CAST(${leaderboardEntries.totalEarned} AS NUMERIC)`)
        : desc(categoryColumn[category]);

      const rows = await db
        .select({
          userId: leaderboardEntries.userId,
          username: leaderboardEntries.username,
          totalEarned: leaderboardEntries.totalEarned,
          totalTripsCompleted: leaderboardEntries.totalTripsCompleted,
          totalCustomersServed: leaderboardEntries.totalCustomersServed,
          prestigeLevel: leaderboardEntries.prestigeLevel,
          timeMachineCount: leaderboardEntries.timeMachineCount,
          unlockedDestinationsCount: leaderboardEntries.unlockedDestinationsCount,
          updatedAt: leaderboardEntries.updatedAt,
        })
        .from(leaderboardEntries)
        .orderBy(orderExpr)
        .limit(50);

      // Add rank
      const ranked = rows.map((row, i) => ({ ...row, rank: i + 1 }));

      // If authenticated, find current user's rank if outside top 50
      let myEntry = null;
      if (req.user) {
        const myRank = ranked.find(r => r.userId === req.user!.id);
        if (!myRank) {
          const allRows = await db
            .select({ userId: leaderboardEntries.userId })
            .from(leaderboardEntries)
            .orderBy(orderExpr);
          const myIndex = allRows.findIndex(r => r.userId === req.user!.id);
          if (myIndex >= 0) {
            const myFull = await db
              .select()
              .from(leaderboardEntries)
              .where(eq(leaderboardEntries.userId, req.user.id))
              .limit(1);
            if (myFull.length > 0) {
              myEntry = { ...myFull[0], rank: myIndex + 1 };
            }
          }
        }
      }

      res.json({ entries: ranked, myEntry });
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/leaderboard-ranks/me", requireAuth, async (req, res) => {
    try {
      const ranks: Record<string, number | null> = {};
      for (const category of VALID_CATEGORIES) {
        const rankOrder = category === "totalEarned"
          ? desc(sql`CAST(${leaderboardEntries.totalEarned} AS NUMERIC)`)
          : desc(categoryColumn[category]);
        const allRows = await db
          .select({ userId: leaderboardEntries.userId })
          .from(leaderboardEntries)
          .orderBy(rankOrder);
        const idx = allRows.findIndex(r => r.userId === req.user!.id);
        ranks[category] = idx >= 0 ? idx + 1 : null;
      }
      res.json({ ranks });
    } catch (error) {
      console.error("My ranks error:", error);
      res.status(500).json({ message: "Failed to fetch your ranks" });
    }
  });

  app.get("/api/load", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        console.warn(`[LOAD] Unauthorized request`);
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`[LOAD] Request from user ${req.user.username} (${req.user.id})`);
      const saves = await db
        .select()
        .from(gameSaves)
        .where(eq(gameSaves.userId, req.user.id))
        .orderBy(desc(gameSaves.lastUpdated))
        .limit(1);

      const gameState = saves.length > 0 ? saves[0].gameState : null;
      console.log(`[LOAD] Returning save for user ${req.user.id}:`, {
        hasSave: !!gameState,
        keys: gameState ? Object.keys(gameState) : [],
        rawSize: JSON.stringify(gameState).length,
      });

      res.set("Cache-Control", "no-store");
      res.json({ gameState });
    } catch (error) {
      console.error("[LOAD] Error:", error);
      res.status(500).json({ message: "Failed to load progress" });
    }
  });

  // Profile save/load - separate endpoint for managers, achievements, artifacts, missions, perks
  // Stored as profileState inside the same gameSaves row
  app.post("/api/save-profile", requireAuth, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { profileState } = req.body;

      const existing = await db.select().from(gameSaves).where(eq(gameSaves.userId, req.user.id)).limit(1);
      if (existing.length > 0) {
        const current = (existing[0].gameState as any) || {};
        await db.update(gameSaves).set({
          gameState: { ...current, _profile: profileState },
          lastUpdated: new Date(),
        }).where(eq(gameSaves.userId, req.user.id));
      } else {
        await db.insert(gameSaves).values({ userId: req.user.id, gameState: { _profile: profileState } });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error("Profile save error:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  app.get("/api/load-profile", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        console.warn(`[LOAD-PROFILE] Unauthorized request`);
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`[LOAD-PROFILE] Request from user ${req.user.username} (${req.user.id})`);
      const saves = await db.select().from(gameSaves).where(eq(gameSaves.userId, req.user.id)).limit(1);
      if (saves.length === 0) {
        console.log(`[LOAD-PROFILE] No save found for user ${req.user.id}`);
        return res.json({ profileState: null });
      }

      const gs = saves[0].gameState as any;
      const profileState = gs?._profile || null;
      console.log(`[LOAD-PROFILE] Returning profile for user ${req.user.id}:`, {
        hasProfile: !!profileState,
        keys: profileState ? Object.keys(profileState) : [],
      });

      res.set("Cache-Control", "no-store");
      res.json({ profileState });
    } catch (error) {
      console.error("[LOAD-PROFILE] Error:", error);
      res.status(500).json({ message: "Failed to load profile" });
    }
  });

  // Sitemap for SEO/AdSense content crawling
  app.get("/sitemap.xml", (_req, res) => {
    res.set("Content-Type", "application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://timetraveltycoon.onrender.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://timetraveltycoon.onrender.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  });

  // Robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: https://timetraveltycoon.onrender.com/sitemap.xml`);
  });

  const httpServer = createServer(app);

  return httpServer;
}
