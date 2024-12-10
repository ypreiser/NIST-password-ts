// src\validators\inputValidator.ts

import { ValidationOptions } from '../types';

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

  if (options.blacklist && !Array.isArray(options.blacklist)) {
    errors.push('Blacklist must be an array.');
  }

  if (options.fuzzyToleranceValue && typeof options.fuzzyToleranceValue !== 'number') {
    errors.push('Fuzzy tolerance must be a number.');
  }

  return errors;
} 