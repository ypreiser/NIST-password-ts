// src\utils\createPasswordValidator.ts
import { validateInput } from "../validators/inputValidator";
import { blocklistValidator } from "../validators/blocklistValidator";
import { hibpValidator } from "../validators/hibpValidator";
import { debouncedHibpValidator } from "../validators/debouncedHibpValidator";
import { getUtf8Length } from "../utils/utf8Length";
import { ValidationOptions, ValidationResult } from "../types";

/**
 * A configurable password validator class that maintains validation settings.
 *
 * This class provides a stateful alternative to the functional `validatePassword` API,
 * allowing you to configure validation rules once and reuse them across multiple
 * password validations. It supports all NIST guidelines including length validation,
 * blocklist checking, and Have I Been Pwned breach detection.
 *
 * @class PasswordValidator
 *
 * @example
 * Basic usage with default options
 * ```typescript
 * import { PasswordValidator } from 'nist-password-validator';
 *
 * const validator = new PasswordValidator({
 *   minLength: 10,
 *   maxLength: 128,
 *   blocklist: ['password', 'admin', 'letmein']
 * });
 *
 * const result = await validator.validate('mySecurePassword123');
 * if (result.isValid) {
 *   console.log('Password is valid!');
 * } else {
 *   console.log('Errors:', result.errors);
 * }
 * ```
 *
 * @example
 * Updating configuration dynamically
 * ```typescript
 * const validator = new PasswordValidator({ minLength: 8 });
 *
 * // Later, update requirements
 * validator.updateConfig({ minLength: 12, maxLength: 64 });
 *
 * const result = await validator.validate('newPassword');
 * ```
 *
 * @example
 * Disabling HIBP checks for performance
 * ```typescript
 * const validator = new PasswordValidator({
 *   minLength: 10,
 *   hibpCheck: false  // Skip breach database check
 * });
 * ```
 *
 * @see {@link validatePassword} for the functional API alternative
 */
class PasswordValidator {
  private options: ValidationOptions;

  /**
   * Creates a new PasswordValidator instance with the specified options.
   *
   * @param {ValidationOptions} options - Configuration options for password validation
   * @param {number} [options.minLength=15] - Minimum password length (NIST recommends 8+)
   * @param {number} [options.maxLength=100000] - Maximum password length
   * @param {string[]} [options.blocklist=[]] - Array of forbidden password substrings
   * @param {number} [options.matchingSensitivity=0.25] - Fuzzy matching tolerance (0-1)
   * @param {number} [options.maxEditDistance=5] - Maximum Levenshtein distance for fuzzy matching
   * @param {boolean} [options.hibpCheck=true] - Check password against Have I Been Pwned database
   * @param {boolean} [options.trimWhitespace=true] - Trim leading/trailing whitespace
   * @param {number} [options.errorLimit=Infinity] - Maximum number of errors to return
   * @param {Function} [options.customDistanceCalculator] - Custom function for edit distance calculation
   */
  constructor(
    options: ValidationOptions = { blocklist: [], trimWhitespace: true }
  ) {
    this.options = options;
  }

  /**
   * Updates the validator's configuration by merging new options with existing ones.
   *
   * This method allows you to change validation rules without creating a new validator instance.
   * New options are shallow-merged with existing options, allowing partial updates.
   *
   * @param {ValidationOptions} options - New validation options to merge
   *
   * @example
   * ```typescript
   * const validator = new PasswordValidator({ minLength: 8 });
   *
   * // Update just the minLength
   * validator.updateConfig({ minLength: 12 });
   *
   * // Add a blocklist while keeping minLength
   * validator.updateConfig({ blocklist: ['password', 'admin'] });
   * ```
   */
  updateConfig(options: ValidationOptions): void {
    // Update the existing options
    this.options = { ...this.options, ...options };
  }

  /**
   * Validates a password against the configured rules and optionally provided overrides.
   *
   * This method performs comprehensive password validation including:
   * - Input type and format validation
   * - Length requirements (UTF-8 aware)
   * - Blocklist checking with fuzzy matching
   * - Have I Been Pwned breach database lookup (if enabled)
   *
   * The validation process stops early if the error limit is reached, improving performance
   * for passwords with multiple issues.
   *
   * @param {string} password - The password string to validate
   * @param {ValidationOptions} [options={}] - Optional overrides for this specific validation
   * @returns {Promise<ValidationResult>} Validation result with isValid flag and error messages
   *
   * @example
   * ```typescript
   * const validator = new PasswordValidator({ minLength: 10 });
   *
   * const result = await validator.validate('short');
   * // result = {
   * //   isValid: false,
   * //   errors: ['Password must be at least 10 characters.']
   * // }
   * ```
   *
   * @example
   * Override options for specific validation
   * ```typescript
   * const validator = new PasswordValidator({ minLength: 10 });
   *
   * // Temporarily use different requirements
   * const result = await validator.validate('test', { minLength: 8 });
   * ```
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

    // HIBP validation
    if (combinedOptions.hibpCheck !== false) {
      const hibpResult = combinedOptions.hibpDebounceMs
        ? await debouncedHibpValidator(password, combinedOptions.hibpDebounceMs)
        : await hibpValidator(password);
      addErrors(hibpResult.errors);
    }

    return { isValid: errors.length === 0, errors };
  }
}

export { PasswordValidator };
