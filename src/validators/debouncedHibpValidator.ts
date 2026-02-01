// src/validators/debouncedHibpValidator.ts

import { hibpValidator, generateSHA1 } from "./hibpValidator";
import { createDebouncer } from "../utils/debounce";
import { ValidationResult } from "../types";

// Cache of debouncers keyed by delay value
const debouncerCache = new Map<number, (password: string) => Promise<ValidationResult>>();

/**
 * Returns a debounced HIBP validator for the given delay.
 * Reuses existing debouncers for the same delay value.
 */
function getDebouncer(delayMs: number): (password: string) => Promise<ValidationResult> {
  let debouncer = debouncerCache.get(delayMs);
  if (!debouncer) {
    debouncer = createDebouncer(hibpValidator, delayMs);
    debouncerCache.set(delayMs, debouncer);
  }
  return debouncer;
}

/**
 * Debounced wrapper around hibpValidator.
 * Groups rapid calls together and only executes after delay passes.
 *
 * @param password - Password to check
 * @param delayMs - Debounce delay in milliseconds
 * @returns Promise resolving to validation result
 */
export async function debouncedHibpValidator(
  password: string,
  delayMs: number
): Promise<ValidationResult> {
  const debouncer = getDebouncer(delayMs);
  return debouncer(password);
}

/**
 * Clears the debouncer cache. Useful for testing.
 */
export function clearDebouncerCache(): void {
  debouncerCache.clear();
}

// Re-export for convenience
export { generateSHA1 };
