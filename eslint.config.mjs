// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Base configuration for all TypeScript files
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  // Overrides for test files
  {
    files: ["**/*.test.{js,ts}", "**/*.spec.{js,ts}"],
    rules: {
      "no-unused-expressions": "off", // Common in assertions
      "max-lines-per-function": "off", // Tests may be lengthy
      "@typescript-eslint/no-non-null-assertion": "off", // Allow assertions with !
      "@typescript-eslint/no-empty-function": "off", // Allow empty functions in test files
      "@typescript-eslint/no-explicit-any": "off", // Allow any in test files
      "no-console": "off", // Allow console.logs in test files
    },
  },
];
