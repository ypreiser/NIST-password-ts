// src\tests\validators\blocklistValidator.test.ts
import { describe, it, expect } from "vitest";
import { blocklistValidator } from "../../validators/blocklistValidator";

describe("blocklistValidator", () => {
  it("validates a password not in the blocklist", () => {
    const result = blocklistValidator("secret", ["password", "123456"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("returns error for a password exactly matching a blocklist entry", () => {
    const result = blocklistValidator("password", ["password", "123456"]);
    expect(result).toEqual({
      isValid: false,
      errors: [
        "Password contains a substring too similar to a blocklisted term.",
      ],
    });
  });

  it("validates a password when fuzzy matching is disabled", () => {
    const result = blocklistValidator("passw0rd", ["password"], 0); // No fuzzy matching
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("returns error for a close fuzzy match to a blocklisted password", () => {
    const result = blocklistValidator("passw0rd", ["password"], 2); // Allow a small fuzziness
    expect(result).toEqual({
      isValid: false,
      errors: [
        "Password contains a substring too similar to a blocklisted term.",
      ],
    });
  });

  it("validates a password when the blocklist is null", () => {
    const result = blocklistValidator("SecurePassword", null);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates a password when the blocklist is undefined", () => {
    const result = blocklistValidator("SecurePassword", undefined);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates a password when the blocklist is empty", () => {
    const result = blocklistValidator("SecurePassword", []);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("returns error for a password with a case-insensitive match in the blocklist", () => {
    const result = blocklistValidator("PASSWORD", ["password"]);
    expect(result).toEqual({
      isValid: false,
      errors: [
        "Password contains a substring too similar to a blocklisted term.",
      ],
    });
  });

  it("validates a password when the fuzzyTolerance is high and not close to blocklist entries", () => {
    const result = blocklistValidator(
      "thisiscompletelysafe",
      ["password", "123456"],
      5
    ); // Large tolerance but not similar
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("validates a password shorter than any blocklist entry", () => {
    const result = blocklistValidator("123", ["password"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("returns error for a substring fuzzy match", () => {
    const result = blocklistValidator("myp@sswordishere", ["password"], 3); // Substring match
    expect(result).toEqual({
      isValid: false,
      errors: [
        "Password contains a substring too similar to a blocklisted term.",
      ],
    });
  });

  it("validates a password when no substrings match within fuzzyTolerance", () => {
    const result = blocklistValidator("thisiscompletelysafe", ["password"], 3); // No substrings match
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("handles empty password input gracefully", () => {
    const result = blocklistValidator("", ["password"]);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("handles empty blocklist gracefully", () => {
    const result = blocklistValidator("password123", []);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it("handles passwords containing multiple substrings of blocklisted terms", () => {
    const result = blocklistValidator("mypassword123", ["password", "123"]);
    expect(result).toEqual({
      isValid: false,
      errors: [
        "Password contains a substring too similar to a blocklisted term.",
      ],
    });
  });

  it("handles passwords that partially overlap multiple blocklisted terms", () => {
    const result = blocklistValidator("pass123word", ["password", "123"]);
    expect(result).toEqual({
      isValid: false,
      errors: [
        "Password contains a substring too similar to a blocklisted term.",
      ],
    });
  });
});
