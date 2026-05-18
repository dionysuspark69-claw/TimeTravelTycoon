import{createRequire}from'module';const require=createRequire(import.meta.url);

// server/vercel-entry.ts
console.log("MINIMAL HANDLER MODULE LOADED");
console.log("ENV DATABASE_URL set:", !!process.env.DATABASE_URL);
console.log("ENV SESSION_SECRET set:", !!process.env.SESSION_SECRET);
console.log("ENV GOOGLE_CLIENT_ID set:", !!process.env.GOOGLE_CLIENT_ID);
console.log("ENV NODE_ENV:", process.env.NODE_ENV);
console.log("Node version:", process.version);
function handler(req, res) {
  console.log("HANDLER CALLED:", req.method, req.url);
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({
    ok: true,
    method: req.method,
    url: req.url,
    nodeVersion: process.version,
    env: {
      DATABASE_URL_set: !!process.env.DATABASE_URL,
      SESSION_SECRET_set: !!process.env.SESSION_SECRET,
      GOOGLE_CLIENT_ID_set: !!process.env.GOOGLE_CLIENT_ID,
      NODE_ENV: process.env.NODE_ENV
    }
  }));
}
export {
  handler as default
};
