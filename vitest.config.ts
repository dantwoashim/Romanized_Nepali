import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/tests/setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 2
      }
    },
    testTimeout: 20_000,
    hookTimeout: 20_000,
    teardownTimeout: 10_000,
    coverage: {
      provider: "v8"
    }
  }
});
