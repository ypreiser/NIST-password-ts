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

  it("should return an error if blocklist is not an array", () => {
    const options: ValidationOptions = { blocklist: "notAnArray" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Blocklist must be an array."]);
  });

  it("should return an error if fuzzyScalingFactor is not a number", () => {
    const options: ValidationOptions = { fuzzyScalingFactor: "0.5" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Fuzzy scaling factor must be a number."]);
  });

  it("should return an error if fuzzyScalingFactor is out of range", () => {
    const options: ValidationOptions = { fuzzyScalingFactor: -0.1 };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Fuzzy scaling factor must be between 0 and 1."]);
  });

  it("should return an error if fuzzyScalingFactor is greater than 1", () => {
    const options: ValidationOptions = { fuzzyScalingFactor: 1.5 };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Fuzzy scaling factor must be between 0 and 1."]);
  });

  it("should return an error if minTolerance is not a number", () => {
    const options: ValidationOptions = { minTolerance: "1" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Min tolerance must be a number."]);
  });

  it("should return an error if maxTolerance is not a number", () => {
    const options: ValidationOptions = { maxTolerance: "5" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Max tolerance must be a number."]);
  });

  it("should return an error if minTolerance is greater than maxTolerance", () => {
    const options: ValidationOptions = { minTolerance: 5, maxTolerance: 3 };
    const result = validateInput("validPassword", options);
    expect(result).toEqual([
      "Min tolerance cannot be greater than maximum tolerance.",
    ]);
  });

  it("should return an error if minTolerance is less than 0", () => {
    const options: ValidationOptions = { minTolerance: -1 };
    const result = validateInput("validPassword", options);
    expect(result).toEqual([
      "Min tolerance must be greater than or equal to 0.",
    ]);
  });

  it("should return an error if maxTolerance is less than 0", () => {
    const options: ValidationOptions = { maxTolerance: -1 };
    const result = validateInput("validPassword", options);
    expect(result).toEqual([
      "Max tolerance must be greater than or equal to 0.",
    ]);
  });

  it("should return no errors for valid input with tolerances", () => {
    const options: ValidationOptions = {
      minLength: 8,
      maxLength: 64,
      blocklist: [],
      minTolerance: 0,
      maxTolerance: 4,
      fuzzyScalingFactor: 0.3,
    };
    const result = validateInput("validPassword", options);
    expect(result).toEqual([]);
  });
});
