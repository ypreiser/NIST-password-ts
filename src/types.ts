// src\types.ts

/**
 * Options for configuring password validation.
 */
export type ValidationOptions = {
  minLength?: number; // Minimum allowed password length
  maxLength?: number; // Maximum allowed password length
  blocklist?: string[]; // List of blocked terms for validation
  fuzzyScalingFactor?: number; // Scaling factor for fuzzy tolerance in blocklist validation
  minTolerance?: number; // Minimum allowed tolerance for fuzzy matching
  maxTolerance?: number; // Maximum allowed tolerance for fuzzy matching
  hibpCheck?: boolean; // Flag to enable or disable HIBP breach checks
  customToleranceCalculator?: (term: string, password: string) => number; // Custom function for tolerance calculation
};

/**
 * The result of a password validation process.
 */
export type ValidationResult = {
  isValid: boolean; // Indicates if the password is valid
  errors: string[]; // List of validation error messages
};
