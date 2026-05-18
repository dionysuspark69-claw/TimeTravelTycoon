import{createRequire}from'module';const require=createRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/bootstrap-db.ts
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
console.log("\u2713 Neon WebSocket constructor configured");

// server/app.ts
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool, neonConfig as neonConfig3 } from "@neondatabase/serverless";
import createMemoryStore from "memorystore";
import helmet from "helmet";

// server/passport-config.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { eq } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig as neonConfig2 } from "@neondatabase/serverless";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  gameSaves: () => gameSaves,
  insertGameSaveSchema: () => insertGameSaveSchema,
  insertLeaderboardEntrySchema: () => insertLeaderboardEntrySchema,
  insertUserSchema: () => insertUserSchema,
  leaderboardEntries: () => leaderboardEntries,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").unique(),
  replitUserId: text("replit_user_id").unique(),
  email: text("email"),
  username: text("username").notNull().unique(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var gameSaves = pgTable("game_saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameState: jsonb("game_state").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  username: text("username").notNull(),
  totalEarned: text("total_earned").notNull().default("0"),
  totalTripsCompleted: integer("total_trips_completed").notNull().default(0),
  totalCustomersServed: integer("total_customers_served").notNull().default(0),
  prestigeLevel: integer("prestige_level").notNull().default(0),
  timeMachineCount: integer("time_machine_count").notNull().default(1),
  unlockedDestinationsCount: integer("unlocked_destinations_count").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).pick({
  userId: true,
  username: true,
  totalEarned: true,
  totalTripsCompleted: true,
  totalCustomersServed: true,
  prestigeLevel: true,
  timeMachineCount: true,
  unlockedDestinationsCount: true
});
var insertUserSchema = createInsertSchema(users).pick({
  googleId: true,
  replitUserId: true,
  email: true,
  username: true
});
var insertGameSaveSchema = createInsertSchema(gameSaves).pick({
  userId: true,
  gameState: true
});

// server/db.ts
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}
neonConfig2.fetchConnectionCache = true;
var sql = neon(process.env.DATABASE_URL);
var db = drizzle(sql, { schema: schema_exports });

// server/passport-config.ts
var callbackURL = process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === "production" ? "https://timetraveltycoon.onrender.com/auth/google/callback" : "http://localhost:5000/auth/google/callback");
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value || null;
          const username = (profile.displayName || "User").replace(/[<>&"'`]/g, "").slice(0, 50) || "User";
          const existingUsers = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
          if (existingUsers.length > 0) {
            return done(null, existingUsers[0]);
          }
          const newUsers = await db.insert(users).values({
            googleId,
            email,
            username
          }).returning();
          return done(null, newUsers[0]);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error);
        }
      }
    )
  );
} else {
  console.warn("\u26A0\uFE0F  Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google sign-in.");
}
passport.serializeUser((user, done) => {
  const userId = user.id;
  console.log("\u{1F510} Serializing user:", userId);
  done(null, userId);
});
passport.deserializeUser(async (id, done) => {
  console.log("\u{1F513} Deserializing user:", id);
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length > 0) {
      console.log("\u2713 User found:", result[0].username);
      done(null, result[0]);
    } else {
      console.error("\u2717 User not found in database:", id);
      done(new Error("User not found"));
    }
  } catch (error) {
    console.error("\u2717 Deserialize error:", error);
    done(error);
  }
});
var passport_config_default = passport;

// server/routes.ts
import { createServer } from "http";
import { eq as eq2, desc, sql as sql2 } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { getUserInfo } from "@replit/repl-auth";
import bcrypt from "bcryptjs";
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 20,
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});
var saveLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 30,
  message: { message: "Save rate limit exceeded" },
  standardHeaders: true,
  legacyHeaders: false
});
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
async function registerRoutes(app2) {
  app2.get("/auth/google", authLimiter, passport_config_default.authenticate("google", { scope: ["profile", "email"] }));
  app2.get(
    "/auth/google/callback",
    passport_config_default.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      console.log("\u{1F511} OAuth callback - User authenticated:", req.user ? req.user.username : "NO USER");
      if (!req.user) {
        console.error("\u2717 No user in session after OAuth callback!");
        return res.status(500).send("Authentication failed: No user in session");
      }
      req.session.save((err) => {
        if (err) {
          console.error("\u2717 Session save error:", err, err.stack);
          return res.status(500).send("Authentication failed: Could not save session");
        }
        if (!req.isAuthenticated()) {
          console.error("\u2717 User not authenticated after session save!");
          return res.status(500).send("Authentication failed: Session not persisted");
        }
        console.log("\u2713 Session saved successfully, redirecting to game");
        res.redirect("/");
      });
    }
  );
  app2.post("/auth/username", authLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || typeof username !== "string" || username.trim().length === 0) {
        return res.status(400).json({ message: "Username is required" });
      }
      if (!password || typeof password !== "string" || password.length === 0) {
        return res.status(400).json({ message: "Password is required" });
      }
      const trimmedUsername = username.trim();
      const sanitizedUsername = trimmedUsername.replace(/[<>&"'`]/g, "");
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
      const existingUsers = await db.select().from(users).where(eq2(users.username, sanitizedUsername)).limit(1);
      let user;
      if (existingUsers.length > 0) {
        user = existingUsers[0];
        if (!user.password) {
          return res.status(400).json({ message: "This account was created without a password. Please contact support." });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          console.log("\u2717 Invalid password for user:", user.username);
          return res.status(401).json({ message: "Invalid username or password" });
        }
        console.log("\u2713 Existing user authenticated:", user.username);
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUsers = await db.insert(users).values({
          username: sanitizedUsername,
          password: hashedPassword,
          email: null,
          googleId: null,
          replitUserId: null
        }).returning();
        user = newUsers[0];
        console.log("\u2713 New user created:", user.username);
      }
      req.login(user, (err) => {
        if (err) {
          console.error("\u2717 Username login error:", err);
          return res.status(500).json({ message: "Failed to log in" });
        }
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("\u2717 Session save error:", saveErr);
            return res.status(500).json({ message: "Failed to save session" });
          }
          console.log("\u2713 User logged in successfully:", user.username);
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
      console.error("\u2717 Username auth error:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });
  app2.post("/auth/replit", async (req, res) => {
    try {
      const replitUserInfo = getUserInfo(req);
      if (!replitUserInfo || !replitUserInfo.id) {
        return res.status(401).json({ message: "Not authenticated with Replit" });
      }
      const replitUserId = replitUserInfo.id;
      const replitUserName = replitUserInfo.name || "Replit User";
      const existingUsers = await db.select().from(users).where(eq2(users.replitUserId, replitUserId)).limit(1);
      let user;
      if (existingUsers.length > 0) {
        user = existingUsers[0];
      } else {
        const newUsers = await db.insert(users).values({
          replitUserId,
          username: replitUserName,
          email: null,
          googleId: null
        }).returning();
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
  app2.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      res.json({
        id: req.user.id,
        username: req.user.username,
        googleId: req.user.googleId,
        replitUserId: req.user.replitUserId
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user info" });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
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
  app2.get("/api/db/test", async (req, res) => {
    try {
      const result = await db.execute(sql2`SELECT NOW()`);
      res.json({ ok: true, result });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Database connection failed" });
    }
  });
  app2.post("/api/save", requireAuth, saveLimiter, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { gameState } = req.body;
      const existingSaves = await db.select().from(gameSaves).where(eq2(gameSaves.userId, req.user.id)).limit(1);
      if (existingSaves.length > 0) {
        const existing = existingSaves[0].gameState;
        const merged = { ...gameState, _profile: existing?._profile };
        await db.update(gameSaves).set({
          gameState: merged,
          lastUpdated: /* @__PURE__ */ new Date()
        }).where(eq2(gameSaves.userId, req.user.id));
      } else {
        await db.insert(gameSaves).values({
          userId: req.user.id,
          gameState
        });
      }
      try {
        const gs = gameState;
        const leaderboardData = {
          userId: req.user.id,
          username: req.user.username,
          totalEarned: String(gs.totalEarned || 0),
          totalTripsCompleted: Number(gs.totalTripsCompleted || 0),
          totalCustomersServed: Number(gs.totalCustomersServed || 0),
          prestigeLevel: Number(gs.prestigeLevel || 0),
          timeMachineCount: Number(gs.timeMachineCount || 1),
          unlockedDestinationsCount: Number((gs.unlockedDestinations || []).length || 1),
          updatedAt: /* @__PURE__ */ new Date()
        };
        const existingEntry = await db.select().from(leaderboardEntries).where(eq2(leaderboardEntries.userId, req.user.id)).limit(1);
        if (existingEntry.length > 0) {
          const prev = existingEntry[0];
          const mergedData = {
            ...leaderboardData,
            totalEarned: String(Math.max(parseFloat(String(prev.totalEarned || 0)), parseFloat(String(gs.totalEarned || 0)))),
            totalTripsCompleted: Math.max(Number(prev.totalTripsCompleted || 0), Number(gs.totalTripsCompleted || 0)),
            totalCustomersServed: Math.max(Number(prev.totalCustomersServed || 0), Number(gs.totalCustomersServed || 0)),
            timeMachineCount: Math.max(Number(prev.timeMachineCount || 1), Number(gs.timeMachineCount || 1)),
            unlockedDestinationsCount: Math.max(Number(prev.unlockedDestinationsCount || 1), Number((gs.unlockedDestinations || []).length || 1)),
            // prestigeLevel always keeps current (it only goes up)
            prestigeLevel: Number(gs.prestigeLevel || 0)
          };
          await db.update(leaderboardEntries).set(mergedData).where(eq2(leaderboardEntries.userId, req.user.id));
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
  const VALID_CATEGORIES = ["totalEarned", "totalTripsCompleted", "totalCustomersServed", "prestigeLevel", "timeMachineCount", "unlockedDestinationsCount"];
  const categoryColumn = {
    totalEarned: leaderboardEntries.totalEarned,
    totalTripsCompleted: leaderboardEntries.totalTripsCompleted,
    totalCustomersServed: leaderboardEntries.totalCustomersServed,
    prestigeLevel: leaderboardEntries.prestigeLevel,
    timeMachineCount: leaderboardEntries.timeMachineCount,
    unlockedDestinationsCount: leaderboardEntries.unlockedDestinationsCount
  };
  app2.get("/api/leaderboard/:category", async (req, res) => {
    try {
      const category = req.params.category;
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      const orderExpr = category === "totalEarned" ? desc(sql2`CAST(${leaderboardEntries.totalEarned} AS NUMERIC)`) : desc(categoryColumn[category]);
      const rows = await db.select({
        userId: leaderboardEntries.userId,
        username: leaderboardEntries.username,
        totalEarned: leaderboardEntries.totalEarned,
        totalTripsCompleted: leaderboardEntries.totalTripsCompleted,
        totalCustomersServed: leaderboardEntries.totalCustomersServed,
        prestigeLevel: leaderboardEntries.prestigeLevel,
        timeMachineCount: leaderboardEntries.timeMachineCount,
        unlockedDestinationsCount: leaderboardEntries.unlockedDestinationsCount,
        updatedAt: leaderboardEntries.updatedAt
      }).from(leaderboardEntries).orderBy(orderExpr).limit(50);
      const ranked = rows.map((row, i) => ({ ...row, rank: i + 1 }));
      let myEntry = null;
      if (req.user) {
        const myRank = ranked.find((r) => r.userId === req.user.id);
        if (!myRank) {
          const allRows = await db.select({ userId: leaderboardEntries.userId }).from(leaderboardEntries).orderBy(orderExpr);
          const myIndex = allRows.findIndex((r) => r.userId === req.user.id);
          if (myIndex >= 0) {
            const myFull = await db.select().from(leaderboardEntries).where(eq2(leaderboardEntries.userId, req.user.id)).limit(1);
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
  app2.get("/api/leaderboard-ranks/me", requireAuth, async (req, res) => {
    try {
      const ranks = {};
      for (const category of VALID_CATEGORIES) {
        const rankOrder = category === "totalEarned" ? desc(sql2`CAST(${leaderboardEntries.totalEarned} AS NUMERIC)`) : desc(categoryColumn[category]);
        const allRows = await db.select({ userId: leaderboardEntries.userId }).from(leaderboardEntries).orderBy(rankOrder);
        const idx = allRows.findIndex((r) => r.userId === req.user.id);
        ranks[category] = idx >= 0 ? idx + 1 : null;
      }
      res.json({ ranks });
    } catch (error) {
      console.error("My ranks error:", error);
      res.status(500).json({ message: "Failed to fetch your ranks" });
    }
  });
  app2.get("/api/load", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        console.warn(`[LOAD] Unauthorized request`);
        return res.status(401).json({ message: "Unauthorized" });
      }
      console.log(`[LOAD] Request from user ${req.user.username} (${req.user.id})`);
      const saves = await db.select().from(gameSaves).where(eq2(gameSaves.userId, req.user.id)).orderBy(desc(gameSaves.lastUpdated)).limit(1);
      if (saves.length === 0) {
        console.log(`[LOAD] No save found for user ${req.user.id}`);
        return res.status(404).json({ message: "No save found" });
      }
      const gameState = saves[0].gameState;
      console.log(`[LOAD] Returning save for user ${req.user.id}, keys: ${gameState ? Object.keys(gameState).length : 0}`);
      res.set("Cache-Control", "no-store");
      res.json({ gameState });
    } catch (error) {
      console.error("[LOAD] Error:", error);
      res.status(500).json({ message: "Failed to load progress" });
    }
  });
  app2.post("/api/save-profile", requireAuth, async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { profileState } = req.body;
      const existing = await db.select().from(gameSaves).where(eq2(gameSaves.userId, req.user.id)).limit(1);
      if (existing.length > 0) {
        const current = existing[0].gameState || {};
        await db.update(gameSaves).set({
          gameState: { ...current, _profile: profileState },
          lastUpdated: /* @__PURE__ */ new Date()
        }).where(eq2(gameSaves.userId, req.user.id));
      } else {
        await db.insert(gameSaves).values({ userId: req.user.id, gameState: { _profile: profileState } });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error("Profile save error:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });
  app2.get("/api/load-profile", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        console.warn(`[LOAD-PROFILE] Unauthorized request`);
        return res.status(401).json({ message: "Unauthorized" });
      }
      console.log(`[LOAD-PROFILE] Request from user ${req.user.username} (${req.user.id})`);
      const saves = await db.select().from(gameSaves).where(eq2(gameSaves.userId, req.user.id)).limit(1);
      if (saves.length === 0) {
        console.log(`[LOAD-PROFILE] No save found for user ${req.user.id}`);
        return res.json({ profileState: null });
      }
      const gs = saves[0].gameState;
      const profileState = gs?._profile || null;
      console.log(`[LOAD-PROFILE] Returning profile for user ${req.user.id}:`, {
        hasProfile: !!profileState,
        keys: profileState ? Object.keys(profileState) : []
      });
      res.set("Cache-Control", "no-store");
      res.json({ profileState });
    } catch (error) {
      console.error("[LOAD-PROFILE] Error:", error);
      res.status(500).json({ message: "Failed to load profile" });
    }
  });
  app2.get("/sitemap.xml", (_req, res) => {
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
  app2.get("/robots.txt", (_req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /
Sitemap: https://timetraveltycoon.onrender.com/sitemap.xml`);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/app.ts
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  console.warn("WARNING: SESSION_SECRET env var is not set in production. Using insecure default.");
}
async function buildApp() {
  const app2 = express();
  app2.set("trust proxy", 1);
  app2.use(helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false
  }));
  app2.use(express.json({ limit: "10mb" }));
  app2.use(express.urlencoded({ extended: false, limit: "10mb" }));
  console.log("\u2713 neonConfig.webSocketConstructor type:", typeof neonConfig3.webSocketConstructor);
  console.log("\u2713 globalThis.WebSocket type:", typeof globalThis.WebSocket);
  const MemoryStore = createMemoryStore(session);
  let sessionStore = new MemoryStore({ checkPeriod: 864e5 });
  if (process.env.DATABASE_URL) {
    const PgSession = connectPgSimple(session);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    sessionStore = new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true
    });
  }
  app2.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "chronotransit-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
      },
      proxy: true
    })
  );
  app2.use(passport_config_default.initialize());
  app2.use(passport_config_default.session());
  app2.use((req, _res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`\u{1F36A} ${req.method} ${req.path} - Authenticated: ${req.isAuthenticated()}, User: ${req.user ? req.user.username : "NONE"}`);
    }
    next();
  });
  await registerRoutes(app2);
  app2.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Request error:", err);
    res.status(status).json({ message });
  });
  return app2;
}

// server/vercel-entry.ts
var app;
var bootError = null;
var appPromise = (async () => {
  try {
    const a = await buildApp();
    app = a;
    return a;
  } catch (e) {
    bootError = e instanceof Error ? e : new Error(String(e));
    console.error("\u2717 buildApp() failed:", bootError);
    console.error(bootError.stack);
    throw bootError;
  }
})();
async function handler(req, res) {
  try {
    const a = app ?? await appPromise;
    return a(req, res);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("\u2717 handler failed:", err);
    console.error(err.stack);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "function_boot_failed",
        message: err.message,
        stack: err.stack?.split("\n").slice(0, 8).join("\n"),
        bootError: bootError ? { message: bootError.message, stack: bootError.stack?.split("\n").slice(0, 8).join("\n") } : null
      })
    );
  }
}
export {
  handler as default
};
