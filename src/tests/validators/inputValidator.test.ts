// nist-password-validator\src\tests\validators\inputValidator.test.ts
import { describe, expect, it } from "vitest";
import { validateInput } from "../../validators/inputValidator";
import type { ValidationOptions } from "../../types";

describe("Input Validator", () => {
  // Test utilities
  const createOptions = (
    overrides?: Partial<ValidationOptions>
  ): ValidationOptions => ({
    minLength: 8,
    maxLength: 64,
    blocklist: [],
    maxEditDistance: 4,
    matchingSensitivity: 0.3,
    errorLimit: 1,
    ...overrides,
  });

  describe("Happy Path", () => {
    it("should accept valid input with default options", () => {
      const result = validateInput("validPassword", {});
      expect(result).toEqual([]);
    });

    it("should accept valid input with all options specified", () => {
      const options = createOptions();
      const result = validateInput("validPassword", options);
      expect(result).toEqual([]);
    });

    it("should handle trimmed whitespace when enabled", () => {
      const options = createOptions({ trimWhitespace: true });
      const result = validateInput("  validPassword  ", options);
      expect(result).toEqual([]);
    });

    it("should preserve whitespace when trimming is disabled", () => {
      const options = createOptions({ trimWhitespace: false });
      const result = validateInput("  validPassword  ", options);
      expect(result).toEqual([]);
    });
  });

  describe("Password Input Validation", () => {
    it("should reject empty password", () => {
      const result = validateInput("", {});
      expect(result).toEqual(["Password cannot be empty."]);
    });

    it("should reject non-string password", () => {
      const result = validateInput(123 as any, {});
      expect(result).toEqual(["Password must be a string."]);
    });

    it("should reject null password", () => {
      const result = validateInput(null as any, {});
      expect(result).toEqual(["Password must be a string."]);
    });

    it("should reject undefined password", () => {
      const result = validateInput(undefined as any, {});
      expect(result).toEqual(["Password must be a string."]);
    });
  });

  describe("Length Validation", () => {
    it("should reject invalid minLength type", () => {
      const options = createOptions({ minLength: "15" as any });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Minimum length must be a positive number."]);
    });

    it("should reject invalid maxLength type", () => {
      const options = createOptions({ maxLength: "64" as any });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Maximum length must be a positive number."]);
    });
    it("should reject negative minLength", () => {
      const options = createOptions({ minLength: -5 });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Minimum length must be a positive number."]);
    });
    it("should reject negative maxLength", () => {
      const options = createOptions({ maxLength: -5, minLength: -10 });
      const result = validateInput("validPassword", options);
      expect(result).toEqual([
        "Minimum length must be a positive number.",
        "Maximum length must be a positive number.",
      ]);
    });
    it("should reject minLength greater than maxLength", () => {
      const options = createOptions({ minLength: 10, maxLength: 5 });
      const result = validateInput("validPassword", options);
      expect(result).toEqual([
        "Minimum length cannot be greater than maximum length.",
      ]);
    });
  });

  describe("Blocklist Validation", () => {
    it("should reject invalid blocklist type", () => {
      const options = createOptions({ blocklist: "notAnArray" as any });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Blocklist must be an array."]);
    });

    it("should handle empty blocklist", () => {
      const options = createOptions({ blocklist: [] });
      const result = validateInput("validPassword", options);
      expect(result).toEqual([]);
    });

    it("should trim blocklist items when trimming is enabled", () => {
      const options = createOptions({
        blocklist: [" password ", " admin "],
        trimWhitespace: true,
      });
      const result = validateInput("validPassword", options);
      expect(result).toEqual([]);
    });
  });

  describe("Matching Sensitivity Validation", () => {
    it("should reject invalid matchingSensitivity type", () => {
      const options = createOptions({ matchingSensitivity: "0.5" as any });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Matching sensitivity must be a number."]);
    });

    it("should reject matchingSensitivity below range", () => {
      const options = createOptions({ matchingSensitivity: -0.1 });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Matching sensitivity must be between 0 and 1."]);
    });

    it("should reject matchingSensitivity above range", () => {
      const options = createOptions({ matchingSensitivity: 1.1 });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Matching sensitivity must be between 0 and 1."]);
    });
  });

  describe("Edit Distance Validation", () => {
    

    it("should reject invalid maxEditDistance type", () => {
      const options = createOptions({ maxEditDistance: "5" as any });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Max tolerance must be a number."]);
    });

   

    it("should reject negative maxEditDistance", () => {
      const options = createOptions({ maxEditDistance: -1 });
      const result = validateInput("validPassword", options);
      expect(result).toEqual([
        "Max tolerance must be greater than or equal to 0.",
      ]);
    });

  });

  describe("Error Limit Validation", () => {
    it("should reject invalid errorLimit type", () => {
      const options = createOptions({ errorLimit: "5" as any });
      const result = validateInput("validPassword", options);
      expect(result).toEqual(["Error limit must be a number."]);
    });

    it("should reject errorLimit less than 1", () => {
      const options = createOptions({ errorLimit: 0 });
      const result = validateInput("validPassword", options);
      expect(result).toEqual([
        "Error limit must be greater than or equal to 1.",
      ]);
    });

    it("should accept valid errorLimit", () => {
      const options = createOptions({ errorLimit: 5 });
      const result = validateInput("validPassword", options);
      expect(result).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle all options being undefined", () => {
      const result = validateInput("validPassword", {});
      expect(result).toEqual([]);
    });

    it("should handle password with only whitespace", () => {
      const result = validateInput("   ", {});
      expect(result).toEqual(["Password cannot be empty."]);
    });

    it("should handle empty options object", () => {
      const result = validateInput("validPassword", {});
      expect(result).toEqual([]);
    });

    it("should handle multiple validation errors simultaneously", () => {
      const options = createOptions({
        maxEditDistance: "invalid" as any,
        matchingSensitivity: 1.5,
      });
      const result = validateInput("validPassword", options);
      expect(result).toContain("Max tolerance must be a number.");
      expect(result).toContain("Matching sensitivity must be between 0 and 1.");
    });
  });
});
