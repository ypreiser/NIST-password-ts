// vite.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    outDir: 'dist', // Output folder for built files
  },
  test: {
    include: [
      "src/tests/**/*.test.ts",
      "src/tests/**/*.spec.ts",
    ],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
      all: true,
    },
  },
});
