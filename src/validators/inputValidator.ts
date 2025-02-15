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
  if (
    options.minLength &&
    (typeof options.minLength !== "number" ||
    options.minLength < 1)
  ) {
    errors.push("Minimum length must be a positive number.");
  }

  if (
    options.maxLength &&
    (typeof options.maxLength !== "number" ||
    options.maxLength < 1)
  ) {
    errors.push("Maximum length must be a positive number.");
  }
  if (
    options.minLength &&
    options.maxLength &&
    options.minLength > options.maxLength
  ) {
    errors.push("Minimum length cannot be greater than maximum length.");
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

  if (options.maxEditDistance && typeof options.maxEditDistance !== "number") {
    errors.push("Max tolerance must be a number.");
  }

  if (options.maxEditDistance && options.maxEditDistance < 0) {
    errors.push("Max tolerance must be greater than or equal to 0.");
  }

  if (options.errorLimit && typeof options.errorLimit !== "number") {
    errors.push("Error limit must be a number.");
  }
  if (options.errorLimit !== undefined && options.errorLimit < 1) {
    errors.push("Error limit must be greater than or equal to 1.");
  }

  return errors;
}
