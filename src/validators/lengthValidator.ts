// src\validators\lengthValidator.ts
import { getUtf8Length } from '../utils/utf8Length';
import { ValidationResult } from '../types';

/**
 * Validates the length of a password against specified minimum and maximum lengths.
 * Uses UTF-8 aware character counting to properly handle emoji and special characters.
 *
 * @param {string} password - The password to validate.
 * @param {number} [min=15] - The minimum length the password must meet.
 * @param {number} [max=100000] - The maximum length the password must not exceed.
 * @returns {ValidationResult} - An object containing a boolean indicating validity and an array of error messages.
 *
 * @example
 * Valid password
 * ```typescript
 * const result = lengthValidator("mySecurePassword", 8, 64);
 * // Returns: { isValid: true, errors: [] }
 * ```
 *
 * @example
 * Password too short
 * ```typescript
 * const result = lengthValidator("short", 8, 64);
 * // Returns: {
 * //   isValid: false,
 * //   errors: ["Password must be at least 8 characters."]
 * // }
 * ```
 *
 * @example
 * Password with emoji (UTF-8 aware)
 * ```typescript
 * const result = lengthValidator("pass👍🏾word", 8, 64);
 * // "👍🏾" counts as 1 character, not 4
 * // Returns: { isValid: true, errors: [] }
 * ```
 */
export function lengthValidator(
  password: string,
  min: number = 15,
  max: number = 100000 // default 100K
): ValidationResult {
  const length = getUtf8Length(password);
  const errors: string[] = [];
  if (length < min) errors.push(`Password must be at least ${min} characters.`);
  if (length > max) errors.push(`Password must not exceed ${max} characters.`);
  return { isValid: errors.length === 0, errors };
}
