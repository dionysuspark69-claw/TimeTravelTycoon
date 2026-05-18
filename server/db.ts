import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Don't throw at module evaluation — that would prevent the Vercel function
// from exporting its handler, and any runtime diagnostic would never run.
// Surface the misconfiguration when queries actually try to fire.
if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set — every DB query will fail");
}

neonConfig.fetchConnectionCache = true;
const sql = neon(process.env.DATABASE_URL || "postgres://invalid/invalid");
export const db = drizzle(sql, { schema });
