// src\types.ts

/**
 * Options for configuring password validation.
 */
export type ValidationOptions = {
  minLength?: number; // Minimum allowed password length
  maxLength?: number; // Maximum allowed password length
  blocklist?: string[]; // List of blocked terms for validation
  matchingSensitivity?: number; // Default: 0.25 - Controls how strict the matching is based on the length of the blocklist terms.
  maxEditDistance?: number; // Default: 5 -  Maximum allowed character differences for fuzzy matching.
  hibpCheck?: boolean; // Flag to enable or disable HIBP breach checks
  customDistanceCalculator?: (term: string, password: string) => number; // Custom function for tolerance calculation
  trimWhitespace?: boolean; // Default: true - Flag to enable or disable trimming of whitespace from password and blocklist terms
  errorLimit?: number
};

/**
 * The result of a password validation process.
 */
export type ValidationResult = {
  isValid: boolean; // Indicates if the password is valid
  errors: string[]; // List of validation error messages
};
