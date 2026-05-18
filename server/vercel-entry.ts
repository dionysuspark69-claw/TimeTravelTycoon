// Vercel serverless entrypoint. Bundled by esbuild during `vercel-build`
// into api/server.mjs — Vercel auto-registers that file as a serverless
// function and routes traffic to it per vercel.json rewrites.

import type { IncomingMessage, ServerResponse } from "http";

// Dump env-var presence at module load. With this we can confirm from runtime
// logs whether the secrets actually reached the function's process.
console.log("ENV DATABASE_URL set:", !!process.env.DATABASE_URL);
console.log("ENV SESSION_SECRET set:", !!process.env.SESSION_SECRET);
console.log("ENV GOOGLE_CLIENT_ID set:", !!process.env.GOOGLE_CLIENT_ID);
console.log("ENV GOOGLE_CLIENT_SECRET set:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("ENV GOOGLE_CALLBACK_URL set:", !!process.env.GOOGLE_CALLBACK_URL);
console.log("ENV NODE_ENV:", process.env.NODE_ENV);

import { buildApp } from "./app";

let app: unknown;
let bootError: Error | null = null;

const appPromise: Promise<unknown> = (async () => {
  try {
    const a = await buildApp();
    app = a;
    return a;
  } catch (e) {
    bootError = e instanceof Error ? e : new Error(String(e));
    console.error("✗ buildApp() failed:", bootError);
    console.error(bootError.stack);
    throw bootError;
  }
})();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const a = app ?? (await appPromise);
    return (a as any)(req, res);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("✗ handler failed:", err);
    console.error(err.stack);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "function_boot_failed",
        message: err.message,
        stack: err.stack?.split("\n").slice(0, 8).join("\n"),
        bootError: bootError ? { message: bootError.message, stack: bootError.stack?.split("\n").slice(0, 8).join("\n") } : null,
      }),
    );
  }
}
