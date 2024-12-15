// src\validators\inputValidator.ts

import { ValidationOptions } from '../types';

/**
 * Validates the input password against various criteria.
 * @param {string} password - The password to validate.
 * @param {ValidationOptions} options - The validation options including minLength, maxLength, blocklist, and fuzzyToleranceValue.
 * @returns {string[]} - An array of error messages if validation fails, or an empty array if validation passes.
 */
export function validateInput(password: string, options: ValidationOptions): string[] {
  const errors: string[] = [];

  // Input validation
  if (typeof password !== 'string' || password.trim() === '') {
    errors.push('Password cannot be empty.');
  }

  if (options.minLength && typeof options.minLength !== 'number') {
    errors.push('Minimum length must be a number.');
  }

  if (options.maxLength && typeof options.maxLength !== 'number') {
    errors.push('Maximum length must be a number.');
  }

  if (options.blocklist && !Array.isArray(options.blocklist)) {
    errors.push('Blocklist must be an array.');
  }

  if (options.fuzzyToleranceValue && typeof options.fuzzyToleranceValue !== 'number') {
    errors.push('Fuzzy tolerance must be a number.');
  }

  return errors;
} 