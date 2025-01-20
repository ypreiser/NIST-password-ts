// nist-password-validator\src\tests\utils\createPasswordValidator.test.ts
import { describe, it, expect, vi } from "vitest";
import { createPasswordValidator } from "../../utils/createPasswordValidator";
import { validatePassword } from "../../validatePassword ";
import { ValidationOptions } from "../../types";

vi.mock("../validatePassword", () => ({
  validatePassword: vi.fn(),
}));

describe("createPasswordValidator", () => {
  describe("Happy Path", () => {
    it("should return a reusable validator object with default options", async () => {
      const validator = createPasswordValidator();
      const mockResult = { isValid: true, errors: [] };

      // Mocking validatePassword behavior
      (validatePassword as any).mockResolvedValue(mockResult);

      const result = await validator.validate("validPassword123");
      expect(validatePassword).toHaveBeenCalledWith("validPassword123", {});
      expect(result).toEqual(mockResult);
    });

    it("should validate passwords using pre-configured options", async () => {
      const options: ValidationOptions = {
        minLength: 10,
        maxLength: 64,
        hibpCheck: false,
        blocklist: ["password123"],
      };
      const validator = createPasswordValidator(options);
      const mockResult = { isValid: true, errors: [] };

      (validatePassword as any).mockResolvedValue(mockResult);

      const result = await validator.validate("customValidPassword");
      expect(validatePassword).toHaveBeenCalledWith(
        "customValidPassword",
        options
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("Sad Path", () => {
    it("should propagate validation errors from validatePassword", async () => {
      const options: ValidationOptions = { minLength: 8 };
      const validator = createPasswordValidator(options);
      const mockResult = {
        isValid: false,
        errors: ["Password must be at least 8 characters."],
      };

      (validatePassword as any).mockResolvedValue(mockResult);

      const result = await validator.validate("short");
      expect(validatePassword).toHaveBeenCalledWith("short", options);
      expect(result).toEqual(mockResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters.");
    });

    it("should handle invalid input to the validator", async () => {
      const validator = createPasswordValidator();
      const mockResult = {
        isValid: false,
        errors: ["Password cannot be empty."],
      };

      (validatePassword as any).mockResolvedValue(mockResult);

      const result = await validator.validate("");
      expect(validatePassword).toHaveBeenCalledWith("", {});
      expect(result).toEqual(mockResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Password cannot be empty.");
    });

    it("should correctly use the options provided when creating the validator", async () => {
      const options: ValidationOptions = {
        minLength: 12,
        blocklist: ["weakpassword"],
        hibpCheck: true,
      };
      const validator = createPasswordValidator(options);

      const mockResult = {
        isValid: false,
        errors: ["Password has been compromised in a data breach."],
      };

      (validatePassword as any).mockResolvedValue(mockResult);

      const result = await validator.validate("weakpassword");
      expect(validatePassword).toHaveBeenCalledWith("weakpassword", options);
      expect(result).toEqual(mockResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Password has been compromised in a data breach."
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle complex options and still validate correctly", async () => {
      const options: ValidationOptions = {
        minLength: 8,
        maxLength: 20,
        blocklist: ["password", "12345"],
        hibpCheck: false,
        errorLimit: 2,
      };
      const validator = createPasswordValidator(options);

      const mockResult = {
        isValid: false,
        errors: [
          "Password must not exceed 20 characters.",
          'Password contains a substring too similar to: "password".',
        ],
      };

      (validatePassword as any).mockResolvedValue(mockResult);

      const result = await validator.validate("password12345");
      expect(validatePassword).toHaveBeenCalledWith("password12345", options);
      expect(result).toEqual(mockResult);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should use default options when invalid options are provided", async () => {
      const invalidOptions: ValidationOptions = { minLength: -1 } as any;
      const validator = createPasswordValidator(invalidOptions);

      const mockResult = {
        isValid: false,
        errors: ["Password must be at least 8 characters."],
      };

      (validatePassword as any).mockResolvedValue(mockResult);

      const result = await validator.validate("short");
      expect(validatePassword).toHaveBeenCalledWith("short", invalidOptions);
      expect(result).toEqual(mockResult);
    });
  });
});
