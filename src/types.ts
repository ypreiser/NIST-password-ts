// src\types.ts

export type ValidationOptions = {
  minLength?: number;
  maxLength?: number;
  allowedCharacterSet?: RegExp;
  blocklist?: string[];
  fuzzyToleranceValue?: fuzzyTolerancevalue;
  hibpCheck?: boolean;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type fuzzyTolerancevalue = 0 | 1 | 2 | 3 | 4 | 5;
