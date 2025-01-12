// nist-password-validator\src\tests\validators\blocklistValidator.test.ts
import { describe, it, expect, vi } from "vitest";
import { blocklistValidator } from "../../validators/blocklistValidator";
import * as levenshteinModule from "../../utils/levenshteinDistance";

describe("blocklistValidator", () => {
  // Test setup
  const standardBlocklist = ["password", "123456", "qwerty"];

  describe("Happy Path", () => {
    it("should accept valid passwords not in blocklist", () => {
      const validPasswords = [
        "secureP@ssphrase123!",
        "ComplexP@ss2024",
        "UniqueStr0ng",
      ];

      validPasswords.forEach((password) => {
        const result = blocklistValidator(password, standardBlocklist);
        expect(result).toEqual({ isValid: true, errors: [] });
      });
    });

    it("should handle empty inputs gracefully", () => {
      const cases = [
        { password: "", blocklist: standardBlocklist },
        { password: "securepass", blocklist: [] },
        { password: "securepass", blocklist: [""] },
        { password: "securepass", blocklist: null },
        { password: "securepass", blocklist: undefined },
        { password: "securepass", blocklist: ["b"] },
      ];

      cases.forEach(({ password, blocklist }) => {
        const result = blocklistValidator(password, blocklist);
        expect(result).toEqual({ isValid: true, errors: [] });
      });
    });

    it("should respect custom distance calculator", () => {
      const customDistanceCalculator = (term: string) =>
        Math.floor(term.length / 6);
      const result = blocklistValidator("ComplexPass", ["Complete"], {
        customDistanceCalculator,
      });
      console.log(result);

      expect(result.isValid).toBe(true);
    });
  });

  describe("Sad Path", () => {
    describe("Basic Validation", () => {
      it("should reject passwords containing exact blocklist terms", () => {
        const cases = [
          {
            password: "mypassword123",
            blocklist: ["password"],
            expectedError: "password",
          },
          {
            password: "secure_pass",
            blocklist: ["secure_pass"],
            expectedError: "secure_pass",
          },
          {
            password: "mypassword😊",
            blocklist: ["password😊"],
            expectedError: "password😊",
          },
        ];

        cases.forEach(({ password, blocklist, expectedError }) => {
          const result = blocklistValidator(password, blocklist);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            `Password contains a substring too similar to: "${expectedError}".`
          );
        });
      });

      it("should detect multiple violations with proper error limit", () => {
        const password = "mypassword123";
        const blocklist = ["password", "123", "myp"];

        // Test with default error limit (Infinity)
        const fullResult = blocklistValidator(password, blocklist);
        expect(fullResult.isValid).toBe(false);
        expect(fullResult.errors.length).toBe(3);

        // Test with custom error limit
        const limitedResult = blocklistValidator(password, blocklist, {
          errorLimit: 2,
        });
        expect(limitedResult.isValid).toBe(false);
        expect(limitedResult.errors.length).toBe(2);
      });
    });

    describe("Fuzzy Matching", () => {
      it("should detect similar passwords using fuzzy matching", () => {
        const cases = [
          { password: "password123", blocklist: ["password"] },
          { password: "mypassword", blocklist: ["password"] },
          { password: "p@ssword", blocklist: ["password"] },
        ];

        cases.forEach(({ password, blocklist }) => {
          const result = blocklistValidator(password, blocklist, {
            matchingSensitivity: 0.5, // Increase sensitivity for fuzzy matching
          });
          expect(result.isValid).toBe(false);
          expect(result.errors[0]).toContain("password");
        });
      });
    });

    describe("Whitespace Handling", () => {
      it("should handle whitespace according to options", () => {
        const password = "mypassword";
        const blocklistTerm = "   password   ";

        // With trimWhitespace enabled (default)
        const trimmedResult = blocklistValidator(password, [blocklistTerm], {
          trimWhitespace: true,
        });
        expect(trimmedResult.isValid).toBe(false);

        // With trimWhitespace disabled
        const untrimmedResult = blocklistValidator(password, [blocklistTerm], {
          trimWhitespace: false,
        });
        expect(untrimmedResult.isValid).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should bypass fuzzy matching for short terms", () => {
      const levenshteinSpy = vi.spyOn(levenshteinModule, "default");

      const password = "testab";
      const shortTerm = "ab";

      blocklistValidator(password, [shortTerm], {
        matchingSensitivity: 1,
      });

      expect(levenshteinSpy).not.toHaveBeenCalled();
    });

    it("should use fuzzy matching for longer terms", () => {
      const levenshteinSpy = vi.spyOn(levenshteinModule, "default");

      const password = "testlongerterm";
      const longTerm = "longerterm";

      blocklistValidator(password, [longTerm], {
        matchingSensitivity: 0.25,
      });

      expect(levenshteinSpy).toHaveBeenCalled();
    });

    it("should handle UTF-8 characters properly", () => {
      const cases = [
        { password: "パスワード123", blocklist: ["パスワード"] },
        { password: "пароль123", blocklist: ["пароль"] },
        { password: "password🔑", blocklist: ["password🔑"] },
      ];

      cases.forEach(({ password, blocklist }) => {
        const result = blocklistValidator(password, blocklist);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(1);
      });
    });

    it("should handle extremely long passwords and blocklist terms", () => {
      const longPassword = "a".repeat(1000);
      const longBlocklistTerm = "a".repeat(500);

      const result = blocklistValidator(longPassword, [longBlocklistTerm]);
      expect(result.isValid).toBe(false);
    });

    it("should handle special characters in blocklist terms", () => {
      const specialCharsBlocklist = ["pass!@#$%", "pass^&*()", "pass<>?{}"];

      specialCharsBlocklist.forEach((term) => {
        const result = blocklistValidator(term, [term]);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain(term);
      });
    });
  });
});
