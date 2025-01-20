// src/utils/createPasswordValidator.ts
import { validatePassword } from "../validatePassword ";
import { ValidationOptions, ValidationResult } from "../types";

/**
 * Creates a reusable password validator with pre-configured options.
 * @param {ValidationOptions} options - The validation options to be used for all validations with this validator.
 * @returns {object} - An object with a `validate` method to validate passwords using the configured options.
 */
export function createPasswordValidator(options: ValidationOptions = {}) {
  return {
    /**
     * Validates a password using the pre-configured options.
     * @param {string} password - The password to validate.
     * @returns {Promise<ValidationResult>} - A promise that resolves to the validation result.
     */
    validate: (password: string): Promise<ValidationResult> => {
      return validatePassword(password, options);
    },
  };
}
