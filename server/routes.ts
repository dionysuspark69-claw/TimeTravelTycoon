import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { gameSaves } from "@shared/schema";
import { requireAuth, getUserFromHeader } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/auth/user", async (req, res) => {
    try {
      const user = await getUserFromHeader(req);
      
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      res.json({
        id: user.id,
        username: user.username,
        replitUserId: user.replitUserId,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ message: "Failed to logout" });
          }
          res.json({ success: true });
        });
      } else {
        res.json({ success: true });
      }
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
