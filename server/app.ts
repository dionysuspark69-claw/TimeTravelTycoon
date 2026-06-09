// Builds the Express app without binding to a port. Used by:
//  - server/index.ts (non-Vercel local/Render deploy: app.listen)
//  - api/server.ts (Vercel serverless function: re-exports this app)

// CRITICAL: bootstrap-db must run first to configure the WebSocket constructor
// that @neondatabase/serverless uses to talk to Neon.
import "./bootstrap-db";

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool, neonConfig } from "@neondatabase/serverless";
import createMemoryStore from "memorystore";
import helmet from "helmet";
import passport from "./passport-config";
import { registerRoutes } from "./routes";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  console.warn("WARNING: SESSION_SECRET env var is not set in production. Using insecure default.");
}

export async function buildApp() {
  const app = express();
  app.set("trust proxy", 1);

  // The game moved to Vercel. If this code is still serving the old Render
  // domain (stale bookmarks, PWA shortcuts, search results), send players to
  // the live deployment instead of a stale build.
  app.use((req, res, next) => {
    if (req.hostname && req.hostname.endsWith(".onrender.com")) {
      return res.redirect(301, `https://time-travel-tycoon.vercel.app${req.originalUrl}`);
    }
    next();
  });
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false, limit: "10mb" }));

  console.log("✓ neonConfig.webSocketConstructor type:", typeof neonConfig.webSocketConstructor);
  console.log("✓ globalThis.WebSocket type:", typeof globalThis.WebSocket);

  const MemoryStore = createMemoryStore(session);
  let sessionStore: session.Store = new MemoryStore({ checkPeriod: 86400000 });
  if (process.env.DATABASE_URL) {
    const PgSession = connectPgSimple(session);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    sessionStore = new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    });
  }

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "chronotransit-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      },
      proxy: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, _res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`🍪 ${req.method} ${req.path} - Authenticated: ${req.isAuthenticated()}, User: ${req.user ? (req.user as any).username : "NONE"}`);
    }
    next();
  });

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Request error:", err);
    res.status(status).json({ message });
  });

  return app;
}
