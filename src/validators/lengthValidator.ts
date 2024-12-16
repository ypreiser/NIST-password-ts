// src\validators\lengthValidator.ts
import { getUtf8Length } from '../utils/utf8Length';
import { ValidationResult } from '../types';

/**
 * Validates the length of a password against specified minimum and maximum lengths.
 * @param {string} password - The password to validate.
 * @param {number} [min=15] - The minimum length the password must meet.
 * @param {number} [max=64] - The maximum length the password must not exceed.
 * @returns {ValidationResult} - An object containing a boolean indicating validity and an array of error messages.
 */
export function lengthValidator(
  password: string,
  min: number = 15,
  max: number = 100000 //defalt 100K

): ValidationResult {
  const length = getUtf8Length(password);
  const errors: string[] = [];
  if (length < min) errors.push(`Password must be at least ${min} characters.`);
  if (length > max) errors.push(`Password must not exceed ${max} characters.`);
  return { isValid: errors.length === 0, errors };
}
