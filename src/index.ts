// src\index.ts
import { lengthValidator } from "./validators/lengthValidator";
import { blocklistValidator } from "./validators/blocklistValidator";
import { hibpValidator } from "./validators/hibpValidator";
import { validateInput } from "./validators/inputValidator";
import { ValidationOptions, ValidationResult } from "./types";

/**
 * Validates a password against various criteria including length, blocklist, and breach checks.
 * @param {string} password - The password to validate.
 * @param {ValidationOptions} [options={}] - The validation options including minLength, maxLength, blocklist, scaling factors, and HIBP check settings.
 * @returns {Promise<ValidationResult>} - A promise that resolves to an object containing a boolean indicating validity and an array of error messages.
 */
async function validatePassword(
  password: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const errors: string[] = validateInput(password, options);

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Length validation
  const lengthResult = lengthValidator(
    password,
    options.minLength,
    options.maxLength
  );
  errors.push(...lengthResult.errors);

  // Check for maximum length error
  if (options.maxLength && password.length > options.maxLength) {
    errors.push(`Password must be at most ${options.maxLength} characters.`);
  }

  // Blocklist validation
  if (options.blocklist) {
    const blocklistResult = blocklistValidator(password, options.blocklist, {
      trimWhitespace: options.trimWhitespace,
      matchingSensitivity: options.matchingSensitivity,
      minEditDistance: options.minEditDistance,
      maxEditDistance: options.maxEditDistance,
      customDistanceCalculator: options.customDistanceCalculator,
    });
    errors.push(...blocklistResult.errors);
  }

  // HIBP validation
  if (options.hibpCheck !== false) {
    const hibpResult = await hibpValidator(password);
    errors.push(...hibpResult.errors);
  }

  return { isValid: errors.length === 0, errors };
}

export { validatePassword, lengthValidator, blocklistValidator, hibpValidator };
