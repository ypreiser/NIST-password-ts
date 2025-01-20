// nist-password-validator\src\utils\createPasswordValidator.ts
// src/utils/PasswordValidator.ts
import { validatePassword } from "../validatePassword ";
import { ValidationOptions, ValidationResult } from "../types";

class PasswordValidator {
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = options;
  }

  /**
   * Updates the configuration options.
   * @param {ValidationOptions} options - New validation options.
   */
  updateConfig(options: ValidationOptions): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Validates a password using the configured options.
   * @param {string} password - The password to validate.
   * @returns {Promise<ValidationResult>} - A promise that resolves to the validation result.
   */
  async validate(password: string): Promise<ValidationResult> {
    return validatePassword(password, this.options);
  }
}

export { PasswordValidator };
