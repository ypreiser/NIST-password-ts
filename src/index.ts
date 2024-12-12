// src\index.ts
import { lengthValidator } from "./validators/lengthValidator";
import { blocklistValidator } from "./validators/blocklistValidator";
import { hibpValidator } from "./validators/hibpValidator";
import { validateInput } from "./validators/inputValidator";
import { ValidationOptions, ValidationResult } from "./types";

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
    const blocklistResult = blocklistValidator(
      password,
      options.blocklist,
      options.fuzzyToleranceValue || 3
    );
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
