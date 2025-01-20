// src\index.ts
import { lengthValidator } from "./validators/lengthValidator";
import { blocklistValidator } from "./validators/blocklistValidator";
import { hibpValidator } from "./validators/hibpValidator";
import { validateInput } from "./validators/inputValidator";
import { ValidationOptions, ValidationResult } from "./types";

/**
 * Validates a password against various criteria including length, blocklist, and breach checks.
 * @param {string} password - The password to validate.
 * @param {ValidationOptions} [options={}] - The validation options including minLength, maxLength, blocklist, scaling factors, HIBP check settings, and error limit.
 * @returns {Promise<ValidationResult>} - A promise that resolves to an object containing a boolean indicating validity and an array of error messages.
 */
async function validatePassword(
  password: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const errors: string[] = [];
  const { errorLimit = Infinity } = options; // Default: No limit

  // Helper to manage error limit
  const addErrors = (newErrors: string[]) => {
    const remainingLimit = errorLimit - errors.length;
      errors.push(...newErrors.slice(0, remainingLimit));

  };

  // Input validation
  const inputErrors = validateInput(password, options);
  addErrors(inputErrors);
  if (errors.length >= errorLimit) {
    return { isValid: false, errors };
  }

  // Length validation
  const lengthResult = lengthValidator(
    password,
    options.minLength,
    options.maxLength
  );
  addErrors(lengthResult.errors);
  if (errors.length >= errorLimit) {
    return { isValid: false, errors };
  }

  // Blocklist validation
  if (options.blocklist) {
    const blocklistResult = blocklistValidator(password, options.blocklist, {
      trimWhitespace: options.trimWhitespace,
      matchingSensitivity: options.matchingSensitivity,
      maxEditDistance: options.maxEditDistance,
      customDistanceCalculator: options.customDistanceCalculator,
      errorLimit: errorLimit - errors.length, // Adjust error limit based on current errors
    });
    addErrors(blocklistResult.errors);
    if (errors.length >= errorLimit) {
      return { isValid: false, errors };
    }
  }

  // HIBP validation
  if (options.hibpCheck !== false) {
    const hibpResult = await hibpValidator(password);
    addErrors(hibpResult.errors);
  }

  return { isValid: errors.length === 0, errors };
}

export { validatePassword, lengthValidator, blocklistValidator, hibpValidator };
