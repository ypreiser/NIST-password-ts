// src\utils\createPasswordValidator.ts
import { validateInput } from "../validators/inputValidator";
import { blocklistValidator } from "../validators/blocklistValidator";
import { getUtf8Length } from "../utils/utf8Length";
import { ValidationOptions, ValidationResult } from "../types";

class PasswordValidator {
  private options: ValidationOptions;

  constructor(
    options: ValidationOptions = { blocklist: [], trimWhitespace: true }
  ) {
    this.options = options;
  }

  /**
   * Updates the configuration options.
   * @param {ValidationOptions} options - New validation options.
   */
  updateConfig(options: ValidationOptions): void {
    // Update the existing options
    this.options = { ...this.options, ...options };
  }

  /**
   * Validates a password using the configured options.
   * @param {string} password - The password to validate.
   * @param {ValidationOptions} options - Additional validation options.
   * @returns {Promise<ValidationResult>} - A promise that resolves to the validation result.
   */
  async validate(
    password: string,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const combinedOptions = { ...this.options, ...options };
    const { errorLimit = Infinity } = combinedOptions;

    // Helper to manage error limit
    const addErrors = (newErrors: string[]) => {
      const remainingLimit = errorLimit - errors.length;
      errors.push(...newErrors.slice(0, remainingLimit));
    };

    // Input validation
    const inputErrors = validateInput(password, combinedOptions);
    addErrors(inputErrors);
    if (errors.length >= errorLimit) {
      return { isValid: false, errors };
    }

    // Validate length
    if (
      combinedOptions.minLength &&
      getUtf8Length(password) < combinedOptions.minLength
    ) {
      addErrors([
        `Password must be at least ${combinedOptions.minLength} characters.`,
      ]);
      if (errors.length >= errorLimit) {
        return { isValid: false, errors };
      }
    }
    if (
      combinedOptions.maxLength &&
      getUtf8Length(password) > combinedOptions.maxLength
    ) {
      addErrors([
        `Password must not exceed ${combinedOptions.maxLength} characters.`,
      ]);
      if (errors.length >= errorLimit) {
        return { isValid: false, errors };
      }
    }

    // Blocklist validation
    if (combinedOptions.blocklist) {
      const blocklistResult = blocklistValidator(
        password,
        combinedOptions.blocklist,
        {
          trimWhitespace: combinedOptions.trimWhitespace,
          matchingSensitivity: combinedOptions.matchingSensitivity,
          maxEditDistance: combinedOptions.maxEditDistance,
          customDistanceCalculator: combinedOptions.customDistanceCalculator,
          errorLimit: errorLimit - errors.length,
        }
      );
      addErrors(blocklistResult.errors);
      if (errors.length >= errorLimit) {
        return { isValid: false, errors };
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

export { PasswordValidator };
