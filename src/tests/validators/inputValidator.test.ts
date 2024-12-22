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
    const result = validateInput(1 as any, options);
    expect(result).toEqual(["Password must be a string."]);
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

  it("should return an error if matchingSensitivity is not a number", () => {
    const options: ValidationOptions = { matchingSensitivity: "0.5" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Matching sensitivity must be a number."]);
  });

  it("should return an error if matchingSensitivity is out of range", () => {
    const options: ValidationOptions = { matchingSensitivity: -0.1 };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Matching sensitivity must be between 0 and 1."]);
  });

  it("should return an error if matchingSensitivity is greater than 1", () => {
    const options: ValidationOptions = { matchingSensitivity: 1.5 };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Matching sensitivity must be between 0 and 1."]);
  });

  it("should return an error if minTolerance is not a number", () => {
    const options: ValidationOptions = { minEditDistance: "1" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Min tolerance must be a number."]);
  });

  it("should return an error if maxTolerance is not a number", () => {
    const options: ValidationOptions = { maxEditDistance: "5" as any };
    const result = validateInput("validPassword", options);
    expect(result).toEqual(["Max tolerance must be a number."]);
  });

  it("should return an error if minTolerance is greater than maxTolerance", () => {
    const options: ValidationOptions = {
      minEditDistance: 5,
      maxEditDistance: 3,
    };
    const result = validateInput("validPassword", options);
    expect(result).toEqual([
      "Min tolerance cannot be greater than maximum tolerance.",
    ]);
  });

  it("should return an error if minTolerance is less than 0", () => {
    const options: ValidationOptions = { minEditDistance: -1 };
    const result = validateInput("validPassword", options);
    expect(result).toEqual([
      "Min tolerance must be greater than or equal to 0.",
    ]);
  });

  it("should return an error if maxTolerance is less than 0", () => {
    const options: ValidationOptions = { maxEditDistance: -1 };
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
      minEditDistance: 0,
      maxEditDistance: 4,
      matchingSensitivity: 0.3,
    };
    const result = validateInput("validPassword", options);
    expect(result).toEqual([]);
  });
});
