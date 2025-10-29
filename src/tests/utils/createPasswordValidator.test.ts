// nist-password-validator\src\tests\utils\createPasswordValidator.test.ts
import { describe, it, expect } from "vitest";
import { PasswordValidator } from "../../utils/createPasswordValidator";

describe("createPasswordValidator Tests", () => {
  it("should validate passwords with specified options", async () => {
    const validator = new PasswordValidator({
      minLength: 8,
      maxLength: 64,
      errorLimit: 1,
    });

    const result = await validator.validate("StrongPass123!💂");
    console.log(result);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should create validator with default options", async () => {
    const validator = new PasswordValidator();
    const result = await validator.validate("StrongPass123!💂");

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should update configuration and validate with new options", async () => {
    const validator = new PasswordValidator({
      minLength: 8,
      blocklist: ["password"],
    });

    // Validate with initial config
    let result = await validator.validate("mypassword");
    expect(result.isValid).toBe(false); // Should fail due to blocklist

    // Update configuration
    validator.updateConfig({
      blocklist: ["test"], // Update blocklist
      minLength: 12, // Update minLength
    });

    // Validate with updated config
    result = await validator.validate("mypassword");
    expect(result.isValid).toBe(false); // Should fail due to length (10 < 12)
    expect(result.errors).toContain("Password must be at least 12 characters.");

    result = await validator.validate("mynewpassword");
    expect(result.isValid).toBe(true); // Should pass as it meets the new criteria (13 chars, no "test")
  });

  it("should fail validation for short passwords", async () => {
    const validator = new PasswordValidator({
      minLength: 12,
    });

    const result = await validator.validate("short");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be at least 12 characters.");
  });

  it("should respect error limits", async () => {
    const validator = new PasswordValidator({
      minLength: 8,
      maxLength: 16,
      blocklist: ["12345"],
      errorLimit: 1,
    });

    const result = await validator.validate("12345");
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1); // Stops at error limit
  });

  it("should stop at error limit after input validation", async () => {
    const validator = new PasswordValidator({
      minLength: "invalid" as any,
      maxLength: "invalid" as any,
      errorLimit: 1,
    });

    const result = await validator.validate("");
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it("should stop at error limit after maxLength validation", async () => {
    const validator = new PasswordValidator({
      minLength: 5,
      maxLength: 10,
      blocklist: ["test"],
      errorLimit: 2,
    });

    const result = await validator.validate("thisisaverylongpasswordtest");
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain("Password must not exceed 10 characters.");
    expect(result.errors[1]).toContain('Password contains a substring too similar to: "test".');
  });

  it("should stop at error limit after blocklist validation", async () => {
    const validator = new PasswordValidator({
      minLength: 20,
      blocklist: ["test", "password", "admin"],
      errorLimit: 2,
    });

    const result = await validator.validate("testpassword");
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it("should stop at error limit exactly after maxLength check", async () => {
    const validator = new PasswordValidator({
      maxLength: 5,
      errorLimit: 1,
    });

    const result = await validator.validate("toolongpassword");
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("Password must not exceed 5 characters.");
  });
});
