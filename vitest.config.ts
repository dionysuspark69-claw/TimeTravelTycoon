import { defineConfig } from "vitest/config";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Tests run in jsdom (the game stores touch localStorage / browser globals).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["client/src/**/*.test.{ts,tsx}"],
  },
});
