// src\types.ts
export type CharacterTypeOptions = {
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigits: boolean;
  requireSpecialCharacters: boolean;
};

export type ValidationOptions = {
  minLength?: number;
  maxLength?: number;
  allowedCharacterSet?: RegExp;
  blacklist?: string[];
  fuzzyToleranceValue?: fuzzyTolerancevalue;
  hibpCheck?: boolean;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type fuzzyTolerancevalue = 0 | 1 | 2 | 3 | 4 | 5;
