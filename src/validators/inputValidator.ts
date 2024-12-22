// src\validators\inputValidator.ts

import { ValidationOptions } from "../types";

/**
 * Validates the input password against various criteria.
 * @param {string} password - The password to validate.
 * @param {ValidationOptions} options - The validation options including minLength, maxLength, blocklist, and fuzzyToleranceValue.
 * @returns {string[]} - An array of error messages if validation fails, or an empty array if validation passes.
 */
export function validateInput(
  password: string,
  options: ValidationOptions
): string[] {
  const errors: string[] = [];

  if (!password || typeof password !== "string") {
    errors.push("Password cannot be empty.");
  }

  if (options.minLength && typeof options.minLength !== "number") {
    errors.push("Minimum length must be a number.");
  }

  if (options.maxLength && typeof options.maxLength !== "number") {
    errors.push("Maximum length must be a number.");
  }

  if (options.blocklist && !Array.isArray(options.blocklist)) {
    errors.push("Blocklist must be an array.");
  }

  if (
    options.fuzzyScalingFactor &&
    typeof options.fuzzyScalingFactor !== "number"
  ) {
    errors.push("Fuzzy scaling factor must be a number.");
  }
  if (
    options.fuzzyScalingFactor &&
    (options.fuzzyScalingFactor < 0 || options.fuzzyScalingFactor > 1)
  ) {
    errors.push("Fuzzy scaling factor must be between 0 and 1.");
  }
  if (options.maxTolerance && typeof options.maxTolerance !== "number") {
    errors.push("Max tolerance must be a number.");
  }

  if (options.minTolerance && typeof options.minTolerance !== "number") {
    errors.push("Min tolerance must be a number.");
  }
  if (
    options.minTolerance &&
    options.maxTolerance &&
    options.minTolerance > options.maxTolerance
  ) {
    errors.push("Min tolerance cannot be greater than maximum tolerance.");
  }
  if (options.minTolerance && options.minTolerance < 0) {
    errors.push("Min tolerance must be greater than or equal to 0.");
  }
  if (options.maxTolerance && options.maxTolerance < 0) {
    errors.push("Max tolerance must be greater than or equal to 0.");
  }


  return errors;
}
