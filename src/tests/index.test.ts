// src\tests\index.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validatePassword } from "../../src";
import { hibpValidator } from "../../src/validators/hibpValidator";

vi.mock("../../src/validators/hibpValidator", () => ({
  hibpValidator: vi.fn(),
}));

describe("validatePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates a password meeting all requirements", async () => {
    const options = { minLength: 8, maxLength: 64, hibpCheck: false };
    const result = await validatePassword("SecurePassword123!", options);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("returns errors for multiple failed validations", async () => {
    const options = {
      minLength: 8,
      maxLength: 64,
      allowedCharacterSet: /^[a-zA-Z0-9]+$/,
      blacklist: ["123456"],
      hibpCheck: false,
    };
    const result = await validatePassword("123456", options);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 8 characters long."
    );
    expect(result.errors).toContain("Password is blacklisted.");
    expect(result.errors).toContain("Password contains invalid characters.");
  });

  it("validates against a provided allowed character set", async () => {
    const options = { allowedCharacterSet: /^[a-zA-Z]+$/ };
    const result = await validatePassword("Secure123", options);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password contains invalid characters.");
  });

  it("validates a password against the HIBP database", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      isValid: false,
      errors: ["Password has been compromised in a data breach."],
    });

    const options = { hibpCheck: true };
    const result = await validatePassword("password", options);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password has been compromised in a data breach."
    );
  });

  it("validates password length against custom options", async () => {
    const options = { minLength: 12, maxLength: 16 };
    const result = await validatePassword("short", options);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 12 characters long."
    );
  });

  it("validates blacklist entries with fuzzy tolerance", async () => {
    const options = { blacklist: ["password"] };
    const result = await validatePassword("passw0rd", options);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password is blacklisted.");
  });

  it("handles no validation options gracefully", async () => {
    const result = await validatePassword("NoOptionsPassword");
    expect(result).toEqual({ isValid: true, errors: [] });
  });
});
