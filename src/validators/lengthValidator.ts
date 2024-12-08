// src\validators\lengthValidator.ts
import { ValidationResult } from '../types';

export function lengthValidator(password: string, minLength: number, maxLength: number): ValidationResult {
  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long.`);
  }

  if (password.length > maxLength) {
    errors.push(`Password must be at most ${maxLength} characters long.`);
  }

  return { isValid: errors.length === 0, errors };
}
