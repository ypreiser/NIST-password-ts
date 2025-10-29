// vite.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    outDir: "dist",
  },
  test: {
    include: ["src/tests/**/*.test.ts", "src/tests/**/*.spec.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
    },
  },
});
