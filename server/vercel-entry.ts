// Vercel serverless entrypoint. Bundled by esbuild during `vercel-build`
// into api/server.mjs — Vercel auto-registers that file as a serverless
// function and routes traffic to it per vercel.json rewrites.

import type { IncomingMessage, ServerResponse } from "http";
import { buildApp } from "./app";

const appPromise = buildApp();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await appPromise;
  return (app as any)(req, res);
}
