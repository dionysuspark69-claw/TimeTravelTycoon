// Vercel serverless entrypoint. vercel.json rewrites /api/*, /auth/*, and any
// non-static path to this function. Static assets (the Vite build output in
// dist/public) are served directly by Vercel's CDN.

import type { IncomingMessage, ServerResponse } from "http";
import { buildApp } from "../server/app";

const appPromise = buildApp();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await appPromise;
  return (app as any)(req, res);
}
