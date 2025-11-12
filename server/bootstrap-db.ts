import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// CRITICAL: This must run before any Pool is created
// The Neon driver needs a WebSocket constructor in Node.js before
// any Pool or Client instance is created
neonConfig.webSocketConstructor = ws as any;

console.log("✓ Neon WebSocket constructor configured");
