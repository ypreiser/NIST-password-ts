// src\validators\lengthValidator.ts
import { getUtf8Length } from '../utils/utf8Length';
import { ValidationResult } from '../types';

export function lengthValidator(
  password: string,
  min: number = 15,
  max: number = 64
): ValidationResult {
  const length = getUtf8Length(password);
  const errors: string[] = [];
  if (length < min) errors.push(`Password must be at least ${min} characters.`);
  if (length > max) errors.push(`Password must not exceed ${max} characters.`);
  return { isValid: errors.length === 0, errors };
}
