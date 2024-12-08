import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul', // or 'c8'
      reporter: ['text', 'html'], // Generate reports
      all: true, // Include uncovered files
    },
  },
});
