// nist-password-validator\src\tests\validators\lengthValidator.test.ts
import { describe, expect, it } from "vitest";
import { lengthValidator } from "../../validators/lengthValidator";
import type { ValidationResult } from "../../types";

describe("Length Validator", () => {
  // Test utilities
  const createValidationResult = (
    isValid: boolean,
    errors: string[] = []
  ): ValidationResult => ({
    isValid,
    errors,
  });

  describe("Happy Path", () => {
    it("should validate password within custom length bounds", () => {
      const result = lengthValidator("ValidPassword123", 8, 64);
      expect(result).toEqual(createValidationResult(true));
    });

    it("should validate password with default length bounds", () => {
      const result = lengthValidator(
        "ThisIsAValidPasswordWithinDefaultBounds123"
      );
      expect(result).toEqual(createValidationResult(true));
    });

    it("should validate password at minimum length", () => {
      const minLength = 8;
      const password = "A".repeat(minLength);
      const result = lengthValidator(password, minLength, 64);
      expect(result).toEqual(createValidationResult(true));
    });

    it("should validate password at maximum length", () => {
      const maxLength = 64;
      const password = "A".repeat(maxLength);
      const result = lengthValidator(password, 8, maxLength);
      expect(result).toEqual(createValidationResult(true));
    });
  });

  describe("Unicode Handling", () => {
    it("should correctly validate unicode emoji characters", () => {
      const password = "🎉🎊🎈🎂🎁";
      const result = lengthValidator(password, 5, 10);
      expect(result).toEqual(createValidationResult(true));
    });

    it("should correctly validate mixed ascii and unicode characters", () => {
      const result = lengthValidator("Hello👋World🌍", 8, 64);
      expect(result).toEqual(createValidationResult(true));
    });

    it("should correctly count surrogate pairs", () => {
      // Using characters that require surrogate pairs
      const password = "Hello🌍🎉";
      const result = lengthValidator(password, 7, 64);
      expect(result).toEqual(createValidationResult(true));
    });
  });

  describe("Minimum Length Validation", () => {
    it("should reject password shorter than custom minimum", () => {
      const result = lengthValidator("short", 8, 64);
      expect(result).toEqual(
        createValidationResult(false, [
          "Password must be at least 8 characters.",
        ])
      );
    });

    it("should reject password shorter than default minimum", () => {
      const result = lengthValidator("TooShort");
      expect(result).toEqual(
        createValidationResult(false, [
          "Password must be at least 15 characters.",
        ])
      );
    });

    it("should reject empty password", () => {
      const result = lengthValidator("", 8, 64);
      expect(result).toEqual(
        createValidationResult(false, [
          "Password must be at least 8 characters.",
        ])
      );
    });
  });

  describe("Maximum Length Validation", () => {
    it("should reject password longer than custom maximum", () => {
      const result = lengthValidator("A".repeat(65), 8, 64);
      expect(result).toEqual(
        createValidationResult(false, [
          "Password must not exceed 64 characters.",
        ])
      );
    });

    it("should reject password longer than default maximum", () => {
      const result = lengthValidator("A".repeat(100001));
      expect(result).toEqual(
        createValidationResult(false, [
          "Password must not exceed 100000 characters.",
        ])
      );
    });

    it("should reject long unicode password", () => {
      const result = lengthValidator("😁".repeat(65), 8, 64);
      expect(result).toEqual(
        createValidationResult(false, [
          "Password must not exceed 64 characters.",
        ])
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle whitespace-only passwords", () => {
      const result = lengthValidator("   ", 8, 64);
      expect(result).toEqual(
        createValidationResult(false, [
          "Password must be at least 8 characters.",
        ])
      );
    });

    it("should handle passwords at boundary conditions", () => {
      const minLength = 8;
      const maxLength = 64;

      // Test exactly at minimum - 1
      expect(
        lengthValidator("A".repeat(minLength - 1), minLength, maxLength)
      ).toEqual(
        createValidationResult(false, [
          "Password must be at least 8 characters.",
        ])
      );

      // Test exactly at maximum + 1
      expect(
        lengthValidator("A".repeat(maxLength + 1), minLength, maxLength)
      ).toEqual(
        createValidationResult(false, [
          "Password must not exceed 64 characters.",
        ])
      );
    });

    it("should handle special Unicode characters correctly", () => {
      // Test with zero-width joiners and other special Unicode characters
      const password = "👨‍👩‍👧‍👦👨‍👨‍👧‍👦"; // Family emojis with ZWJ sequences
      const result = lengthValidator(password, 2, 15);
      expect(result).toEqual(createValidationResult(true));
    });

    it("should handle combining diacritical marks", () => {
      // Test with combining characters
      const password = "e\u0301e\u0301e\u0301"; // é using combining acute accent
      const result = lengthValidator(password, 3, 10);
      expect(result).toEqual(createValidationResult(true));
    });
  });
});
