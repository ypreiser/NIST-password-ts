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

  // Check if password is a string
  if (typeof password !== "string") {
    errors.push("Password must be a string.");
    return errors;
  }

  // Check if trimming is enabled and trim whitespace from password
  if (options.trimWhitespace !== false) {
    password = password.trim();
  }

  // Check if password is empty
  if (!password) {
    errors.push("Password cannot be empty.");
    return errors;
  }

  // Validate options
  if (options.minLength && typeof options.minLength !== "number") {
    errors.push("Minimum length must be a number.");
  }

  if (options.maxLength && typeof options.maxLength !== "number") {
    errors.push("Maximum length must be a number.");
  }

  if (options.blocklist) {
    if (!Array.isArray(options.blocklist)) {
      errors.push("Blocklist must be an array.");
    } else if (options.trimWhitespace !== false) {
      // Trim blocklist terms if enabled
      options.blocklist = options.blocklist.map((term) => term.trim());
    }
  }

  if (
    options.matchingSensitivity &&
    typeof options.matchingSensitivity !== "number"
  ) {
    errors.push("Matching sensitivity must be a number.");
  }

  if (
    options.matchingSensitivity &&
    (options.matchingSensitivity < 0 || options.matchingSensitivity > 1)
  ) {
    errors.push("Matching sensitivity must be between 0 and 1.");
  }

  if (options.minEditDistance && typeof options.minEditDistance !== "number") {
    errors.push("Min tolerance must be a number.");
  }

  if (options.maxEditDistance && typeof options.maxEditDistance !== "number") {
    errors.push("Max tolerance must be a number.");
  }

  if (
    options.minEditDistance &&
    options.maxEditDistance &&
    options.minEditDistance > options.maxEditDistance
  ) {
    errors.push("Min tolerance cannot be greater than maximum tolerance.");
  }

  if (options.minEditDistance && options.minEditDistance < 0) {
    errors.push("Min tolerance must be greater than or equal to 0.");
  }

  if (options.maxEditDistance && options.maxEditDistance < 0) {
    errors.push("Max tolerance must be greater than or equal to 0.");
  }

  return errors;
}
