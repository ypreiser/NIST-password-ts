// src\index.ts
import { lengthValidator } from './validators/lengthValidator';
import { blacklistValidator } from './validators/blacklistValidator';
import { hibpValidator } from './validators/hibpValidator';
import { ValidationOptions, ValidationResult } from './types';

export default async function validatePassword(
  password: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const errors: string[] = [];

  console.log({password});
  

  // Length validation
  const lengthResult = lengthValidator(password, options.minLength, options.maxLength);
  errors.push(...lengthResult.errors);

  // Check for maximum length error
  if (options.maxLength && password.length > options.maxLength) {
    errors.push(`Password must be at most ${options.maxLength} characters.`);
  }

  // Blacklist validation
  if (options.blacklist) {
    const blacklistResult = blacklistValidator(
      password,
      options.blacklist,
      options.fuzzyTolerance || 3
    );
    errors.push(...blacklistResult.errors);
  }

  // HIBP validation
  if (options.hibpCheck !== false) {
    const hibpResult = await hibpValidator(password);
    errors.push(...hibpResult.errors);
  }

  return { isValid: errors.length === 0, errors };
}
