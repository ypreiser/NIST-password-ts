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
      blocklist: ["password"],
    });
  
    console.log("Before updateConfig:");
    let result = await validator.validate("mypassword");
    console.log(result);
    
    expect(result.isValid).toBe(false); 

    console.log("Validation result before update:", result);
  
    // Update configuration
    validator.updateConfig({
      blocklist: ["test"], // Update blocklist
      // minLength: 12, // Update minLength
    });
  
    console.log("After updateConfig:");
    result = await validator.validate("mylongpassword");
    console.log("Validation result after update:", result);
  
    expect(result.isValid).toBe(true); // Should still fail due to updated blocklist
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
