// src\tests\validators\inputValidator.test.ts
import { describe, expect, it } from "vitest";
import { validateInput } from "../../validators/inputValidator";
import { ValidationOptions } from "../../types";

describe("Input Validator", () => {
  it("should return an error if the password is empty", () => {
    const options: ValidationOptions = {};
    const result = validateInput("", options);
    expect(result).toEqual(["Password cannot be empty."]);
  });

  it("should return an error if the password is not a string", () => {
    const options: ValidationOptions = {};
    const result = validateInput(null as any, options);
    expect(result).toEqual(["Password cannot be empty."]);
  });

  it("should return an error if minLength is not a number", () => {
    const options: ValidationOptions = { minLength: "15" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Minimum length must be a number."]);
  });

  it("should return an error if maxLength is not a number", () => {
    const options: ValidationOptions = { maxLength: "64" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Maximum length must be a number."]);
  });

  it("should return an error if blacklist is not an array", () => {
    const options: ValidationOptions = { blacklist: "notAnArray" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Blacklist must be an array."]);
  });

  it("should return an error if fuzzyToleranceValue is not a number", () => {
    const options: ValidationOptions = { fuzzyToleranceValue: "3" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Fuzzy tolerance must be a number."]);
  });

  it("should return no errors for valid input", () => {
    const options: ValidationOptions = {
      minLength: 8,
      maxLength: 64,
      blacklist: [],
      fuzzyToleranceValue: 3,
    };
    const result = validateInput("validPassword", options);
    expect(result).toEqual([]);
  });
});
