// src\validators\blocklistValidator.ts
import levenshteinDistance from "../utils/levenshteinDistance";

/**
 * Validates a password against a blocklist, allowing for fuzzy matching.
 * 
 * @param {string} password - The password to validate.
 * @param {string[] | null | undefined} blocklist - The list of blocked terms.
 * @param {object} [options] - Optional configuration for the validation process.
 * @param {number} [options.fuzzyScalingFactor=0.25] - Scaling factor for dynamic fuzzy tolerance.
 * @param {number} [options.minTolerance=0] - Minimum allowed fuzzy tolerance.
 * @param {number} [options.maxTolerance=5] - Maximum allowed fuzzy tolerance.
 * @param {function} [options.customToleranceCalculator] - Custom function for calculating tolerance.
 * @returns {{ isValid: boolean, errors: string[] }} - Validation result, indicating validity and any errors.
 */
export function blocklistValidator(
  password: string,
  blocklist: string[] | null | undefined,
  options: {
    fuzzyScalingFactor?: number;
    minTolerance?: number;
    maxTolerance?: number;
    customToleranceCalculator?: (term: string, password: string) => number;
  } = {}
): { isValid: boolean; errors: string[] } {
  const {
    fuzzyScalingFactor = 0.25,
    minTolerance = 0,
    maxTolerance = 5,
    customToleranceCalculator,
  } = options;

  const errors: string[] = [];

  if (!Array.isArray(blocklist) || blocklist.length === 0) {
    return { isValid: true, errors };
  }

  const isBlocked = blocklist.some((blockedWord) => {
    const fuzzyTolerance = customToleranceCalculator
      ? customToleranceCalculator(blockedWord, password)
      : Math.max(
          Math.min(
            Math.floor(blockedWord.length * fuzzyScalingFactor),
            maxTolerance
          ),
          minTolerance
        );

    for (let i = 0; i <= password.length - blockedWord.length; i++) {
      const substring = password.substring(i, i + blockedWord.length);
      const distance = levenshteinDistance(
        substring.toLowerCase(),
        blockedWord.toLowerCase()
      );
      if (distance <= fuzzyTolerance) {
        return true;
      }
    }
    return false;
  });

  if (isBlocked) {
    errors.push("Password contains a substring too similar to a blocked term.");
  }

  return { isValid: errors.length === 0, errors };
}
