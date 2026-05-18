// Local-dev / non-Vercel entrypoint. Vercel uses api/server.ts instead, which
// re-exports the same buildApp() from ./app.

import { createServer } from "http";
import { buildApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  try {
    const app = await buildApp();
    const httpServer = createServer(app);

    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }

    const port = Number(process.env.PORT) || 5000;
    httpServer.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
