// src\tests\index.test.ts
import { describe, it, expect } from "vitest";
import { validatePassword } from "../index";

describe("Password Validation", () => {
  it("should return an error for empty password", async () => {
    const result = await validatePassword("", {});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password cannot be empty.");
  });

  it("should return an error for invalid minLength", async () => {
    const result = await validatePassword("validPassword", {
      minLength: "10" as any,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Minimum length must be a number.");
  });

  it("should return an error for invalid maxLength", async () => {
    const result = await validatePassword("validPassword", {
      maxLength: "20" as any,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Maximum length must be a number.");
  });

  it("should return an error for invalid blocklist", async () => {
    const result = await validatePassword("validPassword", {
      blocklist: "notAnArray" as any,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Blocklist must be an array.");
  });

  it("should return an error for invalid matchingSensitivity", async () => {
    const result = await validatePassword("validPassword", {
      matchingSensitivity: "0.25" as any,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Matching sensitivity must be a number.");
  });

  it("should validate a valid password", async () => {
    const result = await validatePassword("validPassword123", {
      minLength: 8,
      maxLength: 64,
      blocklist: [],
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should validate a password with maximum length error", async () => {
    const result = await validatePassword("thispasswordiswaytoolong", {
      maxLength: 15,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must not exceed 15 characters.");
  });

  it("should use default options when none are provided", async () => {
    const result = await validatePassword("validPassword123");
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should check HIBP for compromised passwords", async () => {
    const result = await validatePassword("password", { hibpCheck: true });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password has been compromised in a data breach."
    );
  });

  it("should validate a password with special characters", async () => {
    const result = await validatePassword("$$$+=+=P@ssw0rd!", {
      minLength: 8,
      maxLength: 64,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should validate a password with Unicode characters", async () => {
    const result = await validatePassword("🐲👇❤️👍🦁👍🏾🙈🐱🔓🎉😁", {
      minLength: 8,
      maxLength: 64,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should return an error for a password with special characters below minimum length", async () => {
    const result = await validatePassword("!@#$", { minLength: 8 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters.");
  });

  it("should return an error for a password with Unicode characters below minimum length", async () => {
    const result = await validatePassword("Pä", { minLength: 8 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters.");
  });

  it("should not check HIBP for compromised passwords when hibpCheck is false", async () => {
    const result = await validatePassword("password", {
      minLength: 8,
      hibpCheck: false,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should validate passwords with blocklist and dynamic tolerance", async () => {
    const result = await validatePassword("myp@ssword", {
      blocklist: ["password", "123456"],
      matchingSensitivity: 0.3,
      minEditDistance: 1,
      maxEditDistance: 5,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("should use default fuzzyScalingFactor when null", async () => {
    const result = await validatePassword("validPassword💥", {
      minLength: 8,
      blocklist: ["notvalid"],
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should validate using a customToleranceCalculator", async () => {
    const result = await validatePassword("mypassword", {
      blocklist: ["password"],
      customDistanceCalculator: (term) => Math.floor(term.length / 4),
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("should handle passwords with overlapping blocklist terms", async () => {
    const result = await validatePassword("pass1234word", {
      blocklist: ["password", "1234"],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "1234".'
    );
  });

  it("should return an error for a password with overlapping Unicode terms", async () => {
    const result = await validatePassword("Pä123", {
      blocklist: ["pä", "123"],
      matchingSensitivity: 0.25,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "pä".'
    );
  });

  it("should trim whitespace from the password", async () => {
    const result = await validatePassword("   validPassword123   ", {
      trimWhitespace: true,
      hibpCheck: false,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should not trim whitespace from the password if trimWhitespace is false", async () => {
    const result = await validatePassword("   validPassword123   ", {
      trimWhitespace: false,
      hibpCheck: false,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should trim whitespace from blocklist terms", async () => {
    const result = await validatePassword("mypassword", {
      blocklist: ["   password   "],
      trimWhitespace: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("should not trim whitespace from blocklist terms if trimWhitespace is false", async () => {
    const result = await validatePassword("mypassword", {
      blocklist: ["   password   "],
      trimWhitespace: false,
      hibpCheck: false,
      minLength: 8,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should stop validating at errorLimit ", async () => {
    const result = await validatePassword("123456", {
      blocklist: ["123456"],
      minLength: 15,
      hibpCheck: true,
      errorLimit: 2,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      "Password must be at least 15 characters.",
      'Password contains a substring too similar to: "123456".',
    ]);
  });
  it("should stop validating at errorLimit ", async () => {
    const result = await validatePassword("123456!password", {
      blocklist: ["123456", "!", "password", "d"],
      minLength: 6,
      hibpCheck: true,
      errorLimit: 2,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(2);
    expect(result.errors).toEqual([
      'Password contains a substring too similar to: "123456".',
      'Password contains a substring too similar to: "!".',
    ]);
  });
  it("should validate without limiting errors when errorLimit is undefined", async () => {
    const result = await validatePassword("123456", {
      errorLimit: undefined,
      blocklist: ["123456"],
      minLength: 15,
      hibpCheck: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be at least 15 characters.");
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "123456".'
    );
    expect(result.errors).toContain(
      "Password has been compromised in a data breach."
    );
  });

  it("should handle empty errors array from validators", async () => {
    const result = await validatePassword("validPassword", {
      minLength: 8,
      maxLength: 64,
      blocklist: [],
      hibpCheck: false,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should stop validation immediately when input validation fails", async () => {
    const result = await validatePassword("", {
      minLength: 8,
      maxLength: 64,
      blocklist: [],
      hibpCheck: true,
      errorLimit: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain("Password cannot be empty.");
  });

  it("should stop validation after length validation if error limit reached", async () => {
    const result = await validatePassword("short", {
      minLength: 8,
      maxLength: 10,
      blocklist: ["password"],
      hibpCheck: true,
      errorLimit: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain("Password must be at least 8 characters.");
  });

  it("should stop validation after maxLength check if error limit reached", async () => {
    const result = await validatePassword("thispasswordiswaytoolong", {
      minLength: 8,
      maxLength: 15,
      blocklist: ["password"],
      hibpCheck: true,
      errorLimit: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain("Password must not exceed 15 characters.");
  });
  it("should stop validation after blocklist check if error limit reached", async () => {
    const result = await validatePassword("password", {
      minLength: 8,
      blocklist: ["password"],
      hibpCheck: true,
      errorLimit: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("should stop validation after length validation with multiple errors if error limit allows", async () => {
    const result = await validatePassword("short", {
      minLength: 8,
      maxLength: 10,
      blocklist: ["password"],
      hibpCheck: true,
      errorLimit: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain("Password must be at least 8 characters.");
  });

  it("should validate all checks when no error limit is set", async () => {
    const result = await validatePassword("thispasswordiswaytoolong", {
      minLength: 8,
      maxLength: 15,
      blocklist: ["password"],
      hibpCheck: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must not exceed 15 characters.");
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });
});
