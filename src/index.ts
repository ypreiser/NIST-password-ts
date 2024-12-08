// src\index.ts
import { lengthValidator } from "./validators/lengthValidator";
import { blacklistValidator } from "./validators/blacklistValidator";
import { hibpValidator } from "./validators/hibpValidator";
import { ValidationOptions, ValidationResult } from "./types";
import { allowedCharactersValidator } from "./validators/allowedCharactersValidator ";

export async function validatePassword(
  password: string,
  options: ValidationOptions = { hibpCheck: true }
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Enforce minimum and maximum length
  const minLength = options.minLength || 8; // Default minimum length: 8
  const maxLength = options.maxLength || 64; // Default maximum length: 64
  const lengthResult = lengthValidator(password, minLength, maxLength);
  errors.push(...lengthResult.errors);

  // Optional character set validation
  const charResult = allowedCharactersValidator(
    password,
    options.allowedCharacterSet
  );
  errors.push(...charResult.errors);

  // Check against HIBP if enabled
  if (options.hibpCheck) {
    const hibpResult = await hibpValidator(password);
    errors.push(...hibpResult.errors);
  }

  // Check blacklist if provided
  if (options.blacklist) {
    const blacklistResult = blacklistValidator(
      password,
      options.blacklist,
      options.fuzzyTolerance || 0
    );
    errors.push(...blacklistResult.errors);
  }

  return { isValid: errors.length === 0, errors };
}
