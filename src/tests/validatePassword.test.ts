// nist-password-validator\src\tests\validatePassword.test.ts
import { describe, it, expect } from "vitest";
import { validatePassword } from "../validatePassword";
import { ValidationOptions } from "../types";

describe("Password Validation", () => {
  describe("Happy Path", () => {
    interface ValidPasswordCase {
      description: string;
      password: string;
      options?: ValidationOptions;
    }

    const validPasswords: ValidPasswordCase[] = [
      {
        description: "standard password",
        password: "validPassword123",
      },
      {
        description: "special characters",
        password: "$$$+=+=P@ssw0rd!",
      },
      {
        description: "Unicode characters",
        password: "🐲👇❤️👍🦁👍🏾🙈🐱🔓🎉😁",
      },
      {
        description: "with spaces",
        password: "   validPassword123   ",
        options: { trimWhitespace: true },
      },
      {
        description: "minimum length",
        password: "12345678",
        options: { minLength: 8, hibpCheck: false },
      },
      {
        description: "with known password but HIBP check disabled",
        password: "password",
        options: { hibpCheck: false },
      },
    ];

    it.each(validPasswords)(
      "should validate $description successfully",
      async ({ password, options = {} }) => {
        const result = await validatePassword(password, {
          minLength: 8,
          maxLength: 64,
          blocklist: [],
          ...options,
        });
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      }
    );

    it("should use default options when none are provided", async () => {
      const result = await validatePassword("validPassword123");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("Sad Path - Input Validation", () => {
    interface InvalidInputCase {
      description: string;
      password: string;
      options: ValidationOptions;
      expectedError?: string;
    }

    const invalidInputs: InvalidInputCase[] = [
      {
        description: "empty password",
        password: "",
        options: {},
        expectedError: "Password cannot be empty.",
      },
      {
        description: "invalid minLength type",
        password: "validPassword",
        options: { minLength: "10" as any },
        expectedError: "Minimum length must be a positive number.",
      },
      {
        description: "invalid maxLength type",
        password: "validPassword",
        options: { maxLength: "20" as any },
      },
      {
        description: "invalid blocklist type",
        password: "validPassword",
        options: { blocklist: "notAnArray" as any },
        expectedError: "Blocklist must be an array.",
      },
      {
        description: "invalid matchingSensitivity",
        password: "validPassword",
        options: { matchingSensitivity: "0.25" as any },
        expectedError: "Matching sensitivity must be a number.",
      },
    ];

    it.each(invalidInputs)(
      "should return an error for $description",
      async ({ password, options, expectedError }) => {
        const result = await validatePassword(password, options);
        expect(result.isValid).toBe(false);
        if (expectedError) {
          expect(result.errors).toContain(expectedError);
        }
      }
    );
  });

  describe("Sad Path - Length Validation", () => {
    interface LengthTestCase {
      description: string;
      password: string;
      options: ValidationOptions;
      expectedError: string;
    }

    const lengthTests: LengthTestCase[] = [
      {
        description: "too short",
        password: "1234",
        options: { minLength: 8 },
        expectedError: "Password must be at least 8 characters.",
      },
      {
        description: "too long",
        password: "thispasswordiswaytoolong",
        options: { maxLength: 15 },
        expectedError: "Password must not exceed 15 characters.",
      },
      {
        description: "special chars too short",
        password: "!@#$",
        options: { minLength: 8 },
        expectedError: "Password must be at least 8 characters.",
      },
      {
        description: "Unicode chars too short",
        password: "Pä",
        options: { minLength: 8 },
        expectedError: "Password must be at least 8 characters.",
      },
    ];

    it.each(lengthTests)(
      "should validate $description",
      async ({ password, options, expectedError }) => {
        const result = await validatePassword(password, options);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expectedError);
      }
    );
  });

  describe("Sad Path - Blocklist Validation", () => {
    interface BlocklistTestCase {
      description: string;
      password: string;
      options: ValidationOptions;
    }

    const blocklistTests: BlocklistTestCase[] = [
      {
        description: "similar to blocklist item",
        password: "myp@ssword",
        options: {
          blocklist: ["password"],
          matchingSensitivity: 0.3,
          maxEditDistance: 5,
        },
      },
      {
        description: "overlapping terms",
        password: "pass1234word",
        options: {
          blocklist: ["password", "1234"],
        },
      },
      {
        description: "Unicode similarity",
        password: "Pä123",
        options: {
          blocklist: ["pä", "123"],
          matchingSensitivity: 0.25,
        },
      },
    ];

    it.each(blocklistTests)(
      "should detect $description",
      async ({ password, options }) => {
        const result = await validatePassword(password, options);
        expect(result.isValid).toBe(false);
        expect(
          result.errors.some((error) =>
            error.includes("Password contains a substring too similar to:")
          )
        ).toBe(true);
      }
    );

    it("should handle custom distance calculator", async () => {
      const result = await validatePassword("mypassword", {
        blocklist: ["password"],
        customDistanceCalculator: (term) => Math.floor(term.length / 4),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password contains a substring too similar to: "password".'
      );
    });
  });

  describe("Sad Path - HIBP Validation", () => {
    it("should detect compromised passwords", async () => {
      const result = await validatePassword("password", { hibpCheck: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password has been compromised in a data breach."
      );
    });

    it("should detect compromised passwords with debounce enabled", async () => {
      const result = await validatePassword("password", {
        hibpCheck: true,
        hibpDebounceMs: 10,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password has been compromised in a data breach."
      );
    });
  });
  describe("Error Limit Handling", () => {
    interface ErrorLimitTestCase {
      description: string;
      password: string;
      options: ValidationOptions;
      expectedErrorCount: number;
      expectedErrors?: string[];
    }

    const errorLimitTests: ErrorLimitTestCase[] = [
      {
        description: "stop at error limit with multiple violations",
        password: "123456",
        options: {
          blocklist: ["123456"],
          minLength: 15,
          hibpCheck: true,
          errorLimit: 2,
        },
        expectedErrorCount: 2,
      },
      {
        description: "collect all errors when no limit",
        password: "123456",
        options: {
          errorLimit: undefined,
          blocklist: ["123456"],
          minLength: 15,
          hibpCheck: true,
        },
        expectedErrorCount: 3,
      },
      {
        description: "stop exactly at error limit",
        password: "a",
        options: {
          minLength: 8,
          maxLength: 64,
          blocklist: ["a"],
          errorLimit: 1,
        },
        expectedErrorCount: 1,
        expectedErrors: ["Password must be at least 8 characters."],
      },
      {
        description: "handle multiple errors with exact limit",
        password: "password123",
        options: {
          minLength: 8,
          blocklist: ["password", "123", "pass"],
          errorLimit: 3,
        },
        expectedErrorCount: 3,
        expectedErrors: [
          'Password contains a substring too similar to: "password".',
          'Password contains a substring too similar to: "123".',
          'Password contains a substring too similar to: "pass".',
        ],
      },
      {
        description: "handle remaining limit of zero",
        password: "test",
        options: {
          minLength: 8,
          blocklist: ["test", "password"],
          errorLimit: 1,
        },
        expectedErrorCount: 1,
        expectedErrors: ["Password must be at least 8 characters."],
      },
    ];

    it.each(errorLimitTests)(
      "should $description",
      async ({ password, options, expectedErrorCount, expectedErrors }) => {
        const result = await validatePassword(password, options);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(expectedErrorCount);
        if (expectedErrors) {
          expect(result.errors).toEqual(expectedErrors);
        }
      }
    );

    // Additional test for input validation error limit
    it("should stop at error limit for input validation", async () => {
      const result = await validatePassword("", {
        minLength: "invalid" as any,
        maxLength: "invalid" as any,
        errorLimit: 1,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors).toContain("Password cannot be empty.");
    });

    // Test for remaining limit calculation
    it("should handle remaining limit calculation correctly", async () => {
      const result = await validatePassword("short", {
        minLength: 8,
        blocklist: ["short", "password"],
        errorLimit: 2,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toEqual([
        "Password must be at least 8 characters.",
        'Password contains a substring too similar to: "short".',
      ]);
    });

    // Additional test to verify error accumulation behavior
    it("should accumulate errors up to the limit", async () => {
      const result = await validatePassword("testpass", {
        minLength: 10,
        maxLength: 15,
        blocklist: ["test", "pass"],
        hibpCheck: true,
        errorLimit: 2,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      // Only first two errors should be included due to limit
      expect(result.errors).toEqual([
        "Password must be at least 10 characters.",
        'Password contains a substring too similar to: "test".',
      ]);
    });

    // Test for zero remaining limit
    it("should handle zero remaining limit", async () => {
      const result = await validatePassword("a", {
        minLength: 8,
        blocklist: ["a", "b", "c"],
        errorLimit: 1,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors).toEqual([
        "Password must be at least 8 characters.",
      ]);
    });
    it("should not add additional errors when error limit is reached", async () => {
      // Using a very small error limit (1) and a password that violates multiple input validations
      const result = await validatePassword("test", {
        errorLimit: 1,
        minLength: "invalid" as any,
        maxLength: "invalid" as any,
        blocklist: "invalid" as any,
        matchingSensitivity: "invalid" as any,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      // Should only contain the first error
    });

    it("should handle hitting error limit exactly with input validation", async () => {
      // Using multiple invalid inputs with exact error limit
      const result = await validatePassword("", {
        errorLimit: 2,
        minLength: "invalid" as any,
        maxLength: "invalid" as any,
        matchingSensitivity: "invalid" as any, // This error shouldn't be added
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toEqual([
        "Password cannot be empty.",
        "Password has been compromised in a data breach.",
      ]);

      // This error should not be added due to error limit
      expect(result.errors).not.toContain("Maximum length must be a number.");
    });

    it("should stop adding errors at limit with multiple validation steps", async () => {
      const result = await validatePassword("pass", {
        errorLimit: 2,
        minLength: 8,
        blocklist: ["pass", "word", "123"], // Multiple blocklist items
        hibpCheck: true, // Additional validation that should be skipped
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toEqual([
        "Password must be at least 8 characters.",
        'Password contains a substring too similar to: "pass".',
      ]);

      // These errors should not be added due to error limit
      expect(result.errors).not.toContain(
        'Password contains a substring too similar to: "word".'
      );
      expect(result.errors).not.toContain(
        "Password has been compromised in a data breach."
      );
    });
  });
});
