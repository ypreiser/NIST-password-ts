// src\tests\validators\blocklistValidator.test.ts
import { describe, it, expect } from "vitest";
import { blocklistValidator } from "../../validators/blocklistValidator";

describe("blocklistValidator", () => {
  it("validates a password not in the blocklist", () => {
    const result = blocklistValidator("secret", ["password", "123456"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates passwords with short terms in the blocklist using exact matching", () => {
    const result = blocklistValidator("mypassword", ["1", "b", "pass"], {});
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "pass".'],
    });
  });

  it("validates a password not in the blocklist", () => {
    const result = blocklistValidator("secret", ["password", "123456"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates passwords with short terms in the blocklist using exact matching", () => {
    const result = blocklistValidator("mypassword", ["a", "b"], {});
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "a".'],
    });
  });

  it("does not throw false positives for shorrt terms with bypassFuzzyForShortTerms", () => {
    const result = blocklistValidator("mypassword", ["B"], {});
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates passwords with multiple blocked terms", () => {
    const result = blocklistValidator("mypassword123", ["password", "123"]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "123".'
    );
  });

  it("should bypass fuzzy matching for short terms and use exact matching", () => {
    const result = blocklistValidator("mypassword", ["1", "b", "pass"], {});
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "pass".'],
    });
  });

  it("validates passwords with UTF-8 characters", () => {
    const result = blocklistValidator("p@sswörd", ["password"]);
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "password".'],
    });
  });

  it("validates passwords with UTF-8 characters in blocklist", () => {
    const result = blocklistValidator("password", ["p@sswörd"], {});
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "p@sswörd".'],
    });
  });

  it("validates complex UTF-8 characters", () => {
    const result = blocklistValidator("passw😊rd", ["password"]);
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "password".'],
    });
  });

  it("validates complex UTF-8 characters in blocklist", () => {
    const result = blocklistValidator("password", ["passw😊rd"]);
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "passw😊rd".'],
    });
  });

  it("validates a password when fuzzy matching is disabled", () => {
    const result = blocklistValidator("passw0rd", ["password"], {
      maxEditDistance: 0,
    });
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates an empty password", () => {
    const result = blocklistValidator("", ["password"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates passwords with special characters in blocklist", () => {
    const result = blocklistValidator("secure_pass", ["secure_pass"]);
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "secure_pass".'],
    });
  });

  it("uses a custom tolerance calculator", () => {
    const result = blocklistValidator("mypassword", ["password"], {
      customDistanceCalculator: (term) => Math.floor(term.length / 4),
    });
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "password".'],
    });
  });

  it("validates a password using default minTolerance of 0", () => {
    const result = blocklistValidator("pass1234", ["password", "1234"], {});
    expect(result).toEqual({
      isValid: false,
      errors: ['Password contains a substring too similar to: "1234".'],
    });
  });

  it("should trim whitespace from blocklist terms when trimWhitespace is true", () => {
    const result = blocklistValidator("mypassword", ["   password   "], {
      trimWhitespace: true,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "password".'
    );
  });

  it("should not trim whitespace from blocklist terms when trimWhitespace is false", () => {
    const result = blocklistValidator("mypassword", ["   password   "], {
      trimWhitespace: false,
    });
    expect(result.isValid).toBe(true);
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
      'Password contains a substring too similar to: "password".'
    );
  });

  it("should validate correctly when no blocklist terms are provided", () => {
    const result = blocklistValidator("mypassword", [], {
      trimWhitespace: true,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should validate correctly when blocklist contians empty string", () => {
    const result = blocklistValidator("mypassword", ["hello", ""], {});
    console.log(result);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
  it("should validate correctly when no blocklist terms are provided", () => {
    const result = blocklistValidator("mypassword", [], {
      trimWhitespace: true,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should validate correctly when blocklist contians empty string", () => {
    const result = blocklistValidator("mypasswordhello", ["", "hello", " "], {});
    console.log(result);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "hello".'
    );
  });

  it("should use exact matching with the processed blocklist", () => {
    const result = blocklistValidator("hello1", ["1"], {
      matchingSensitivity: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Password contains a substring too similar to: "1".'
    );
  });
});
