import { describe, it, expect } from "vitest";
import { blocklistValidator } from "../../validators/blocklistValidator";

describe("blocklistValidator", () => {
  it("validates a password not in the blocklist", () => {
    const result = blocklistValidator("securepassword", ["123456", "qwerty"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates passwords containing blocklist terms", () => {
    const result = blocklistValidator("mypassword123", ["password", "123"]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "123".'
    );
  });

  it("respects the error limit", () => {
    const result = blocklistValidator(
      "mypassword123",
      ["password", "123", "myp"],
      { errorLimit: 2 }
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(2); 
  });

  it("validates passwords with special characters in blocklist", () => {
    const result = blocklistValidator("secure_pass", ["secure_pass"]);
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "secure_pass".'],
    });
  });

  it("validates passwords with UTF-8 characters", () => {
    const result = blocklistValidator("p@sswörd", ["password"]);
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "password".'],
    });
  });

  it("trims whitespace from blocklist terms if enabled", () => {
    const result = blocklistValidator("mypassword", ["   password   "], {
      trimWhitespace: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("does not trim whitespace from blocklist terms if disabled", () => {
    const result = blocklistValidator("mypassword", ["   password   "], {
      trimWhitespace: false,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("uses a custom distance calculator if provided", () => {
    const customDistanceCalculator = (term: string) => term.length / 2;
    const result = blocklistValidator("mypassword", ["password"], {
      customDistanceCalculator,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("handles an empty blocklist gracefully", () => {
    const result = blocklistValidator("mypassword", [], {});
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("handles an empty password gracefully", () => {
    const result = blocklistValidator("", ["password"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("handles blocklist with empty strings", () => {
    const result = blocklistValidator("mypassword", ["", "password"]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("validates passwords with exact matches for short terms", () => {
    const result = blocklistValidator("mypassword", ["pass"]);
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "pass".'],
    });
  });

  it("validates passwords using fuzzy matching", () => {
    const result = blocklistValidator("passw0rd", ["password"], {
      maxEditDistance: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("skips fuzzy matching for short terms", () => {
    const result = blocklistValidator("mypassword", ["p", "b", "pass"], {
      matchingSensitivity: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "pass".'
    );
  });

  it("stops processing when error limit is reached", () => {
    const result = blocklistValidator(
      "mypassword123456",
      ["mypassword", "123", "456"],
      { errorLimit: 1 }
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
  });

  it("handles complex UTF-8 characters in blocklist", () => {
    const result = blocklistValidator("mypassword😊", ["password😊"]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password😊".'
    );
  });
});
