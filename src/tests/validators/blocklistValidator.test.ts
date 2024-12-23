// src\tests\validators\blocklistValidator.test.ts
import { describe, it, expect } from "vitest";
import { blocklistValidator } from "../../validators/blocklistValidator";

describe("blocklistValidator", () => {
  it("validates a password not in the blocklist", () => {
    const result = blocklistValidator("secret", ["password", "123456"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates passwords with UTF-8 characters", () => {
    const result = blocklistValidator("p@sswörd", ["p@ssword"]);
    expect(result).toEqual({
      isValid: false,
      errors: ["Password contains a substring too similar to a blocked term."],
    });
  });

  it("validates complex UTF-8 characters", () => {
    const result = blocklistValidator("passw😊rd", ["password"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates a password when fuzzy matching is disabled", () => {
    const result = blocklistValidator("passw0rd", ["password"], {
      maxEditDistance: 0,
    });
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("handles overlapping blocklist terms and passwords", () => {
    const result = blocklistValidator("mypassword123", ["password", "123"]);
    expect(result).toEqual({
      isValid: false,
      errors: ["Password contains a substring too similar to a blocked term."],
    });
  });

  it("validates an empty password", () => {
    const result = blocklistValidator("", ["password"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates passwords with special characters in blocklist", () => {
    const result = blocklistValidator("secure_pass", ["secure_pass"]);
    expect(result).toEqual({
      isValid: false,
      errors: ["Password contains a substring too similar to a blocked term."],
    });
  });

  it("uses a custom tolerance calculator", () => {
    const result = blocklistValidator("mypassword", ["password"], {
      customDistanceCalculator: (term) => Math.floor(term.length / 4),
    });
    expect(result).toEqual({
      isValid: false,
      errors: ["Password contains a substring too similar to a blocked term."],
    });
  });

  it("validates a password using default minTolerance of 0", () => {
    const result = blocklistValidator("pass1234", ["password", "1234"], {});
    expect(result).toEqual({
      isValid: false,
      errors: ["Password contains a substring too similar to a blocked term."],
    });
  });

  it("validates a password using default minEditDistance of 1", () => {
    const result = blocklistValidator("abc", ["1"], {
      minEditDistance: 1,
    });
    expect(result).toEqual({
      isValid: false,
      errors: ["Password contains a substring too similar to a blocked term."],
    });
  });

  it("should trim whitespace from blocklist terms when trimWhitespace is true", () => {
    const result = blocklistValidator("mypassword", ["   password   "], {
      trimWhitespace: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password contains a substring too similar to a blocked term."
    );
  });

  it("should not trim whitespace from blocklist terms when trimWhitespace is false", () => {
    const result = blocklistValidator("mypassword", ["   password   "], {
      trimWhitespace: false,
    });
    expect(result.isValid).toBe(true); // Should be valid since the password does not match the untrimmed blocklist term
    expect(result.errors).toEqual([]);
  });

  it("should handle mixed whitespace in blocklist terms correctly", () => {
    const result = blocklistValidator(
      "mypassword",
      ["password", "   password   "],
      {
        trimWhitespace: true,
      }
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password contains a substring too similar to a blocked term."
    );
  });

  it("should validate correctly when no blocklist terms are provided", () => {
    const result = blocklistValidator("mypassword", [], {
      trimWhitespace: true,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
