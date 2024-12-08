import { ValidationResult } from '../types';

export function allowedCharactersValidator(password: string, characterSetRegex?: RegExp): ValidationResult {
  const errors: string[] = [];

  // Skip validation if no character set is specified
  if (!characterSetRegex) {
    return { isValid: true, errors };
  }

  if (!characterSetRegex.test(password)) {
    errors.push('Password contains invalid characters.');
  }

  return { isValid: errors.length === 0, errors };
}
