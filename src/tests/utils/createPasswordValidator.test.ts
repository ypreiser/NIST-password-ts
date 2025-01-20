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
    });

    // First validation with initial config
    let result = await validator.validate("StrongPass123!💂");
    expect(result.isValid).toBe(true);

    // Update config to be more strict
    validator.updateConfig({
      minLength: 12,
      blocklist: ["StrongPass"],
    });

    // Validate with updated config
    result = await validator.validate("StrongPass123!💂");
    expect(result.isValid).toBe(false);
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
});
