// src\utils\createPasswordValidator.ts
import { validateInput } from "../validators/inputValidator"; // Assuming you have an input validator
import { ValidationOptions, ValidationResult } from "../types";

class PasswordValidator {
  private normalizedBlocklist: Set<string>;
  private trimWhitespace: boolean;
  private options: ValidationOptions;

  constructor(
    options: ValidationOptions = { blocklist: [], trimWhitespace: true }
  ) {
    this.normalizedBlocklist = new Set();
    this.trimWhitespace = options.trimWhitespace ?? true; // Default to true if not provided
    this.options = options;

    if (options.blocklist) {
      this.setBlocklist(options.blocklist);
    }
  }

  /**
   * Updates the configuration options.
   * @param {ValidationOptions} options - New validation options.
   */
  updateConfig(options: ValidationOptions): void {
    console.log("Current options:", this.options);
    console.log("Current blocklist:", Array.from(this.normalizedBlocklist));

    // Ensure trimWhitespace is updated first
    if (options.trimWhitespace !== undefined) {
      this.trimWhitespace = options.trimWhitespace;
    }

    // If a new blocklist is provided, update it first
    if (options.blocklist !== undefined) {
      this.normalizedBlocklist.clear(); // Ensure it's fully reset
      this.setBlocklist(options.blocklist);
    }

    // Finally, merge other options (blocklist is already updated)
    this.options = { ...this.options, ...options };
    console.log("Updated options:", this.options);
    console.log("Updated blocklist:", Array.from(this.normalizedBlocklist));
  }

  setBlocklist(blocklist: string[]) {
    this.normalizedBlocklist.clear();
    blocklist.forEach((term) => {
      const normalizedTerm = this.trimWhitespace
        ? term.trim().toLowerCase()
        : term.toLowerCase();
      if (normalizedTerm) {
        this.normalizedBlocklist.add(normalizedTerm);
      }
    });
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

    // Normalize the password based on the trimWhitespace option
    const normalizedPassword = this.trimWhitespace
      ? password.trim().toLowerCase()
      : password.toLowerCase();

    // Check against the normalized blocklist
    if (this.normalizedBlocklist.has(normalizedPassword)) {
      errors.push(`Password contains a blocked term: "${password}".`);
    }

    // Validate length
    if (
      combinedOptions.minLength &&
      password.length < combinedOptions.minLength
    ) {
      errors.push(
        `Password must be at least ${combinedOptions.minLength} characters.`
      );
    }
    if (
      combinedOptions.maxLength &&
      password.length > combinedOptions.maxLength
    ) {
      errors.push(
        `Password must not exceed ${combinedOptions.maxLength} characters.`
      );
    }

    // Validate against the input validation rules
    const inputErrors = validateInput(password, combinedOptions);
    if (inputErrors.length > 0) {
      errors.push(...inputErrors);
    }

    // Respect error limit
    if (
      combinedOptions.errorLimit &&
      errors.length > combinedOptions.errorLimit
    ) {
      return {
        isValid: false,
        errors: errors.slice(0, combinedOptions.errorLimit),
      };
    }

    return { isValid: errors.length === 0, errors };
  }
}

export { PasswordValidator };
