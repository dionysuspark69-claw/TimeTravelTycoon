import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const gameStates = new Map<string, any>();
const leaderboard: Array<{ playerId: string; playerName: string; score: number }> = [];

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/google-play/auth", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }

      const mockPlayerData = {
        playerId: "mock_player_" + Date.now(),
        playerName: "Player " + Math.floor(Math.random() * 1000),
        playerAvatar: null,
        accessToken: "mock_token_" + Date.now(),
      };

      res.json(mockPlayerData);
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/google-play/save", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { gameState } = req.body;
      
      gameStates.set(token, gameState);

      res.json({ success: true });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  app.get("/api/google-play/load", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const gameState = gameStates.get(token);

      res.json({ gameState: gameState || null });
    } catch (error) {
      console.error("Load error:", error);
      res.status(500).json({ message: "Failed to load progress" });
    }
  });

  app.post("/api/google-play/leaderboard/submit", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { score, playerName } = req.body;
      
      const existingEntry = leaderboard.find(entry => entry.playerId === token);
      
      if (existingEntry) {
        if (score > existingEntry.score) {
          existingEntry.score = score;
        }
      } else {
        leaderboard.push({
          playerId: token,
          playerName: playerName || "Player " + Math.floor(Math.random() * 1000),
          score,
        });
      }

      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard.splice(10);

      res.json({ success: true });
    } catch (error) {
      console.error("Submit score error:", error);
      res.status(500).json({ message: "Failed to submit score" });
    }
  });

  app.get("/api/google-play/leaderboard", async (req, res) => {
    try {
      res.json({ entries: leaderboard.slice(0, 10) });
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
