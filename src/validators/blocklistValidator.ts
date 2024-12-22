// src\validators\blocklistValidator.ts
import levenshteinDistance from "../utils/levenshteinDistance";

/**
 * Validates a password against a blocklist, allowing for fuzzy matching.
 *
 * @param {string} password - The password to validate.
 * @param {string[] | null | undefined} blocklist - The list of blocked terms.
 * @param {object} [options] - Optional configuration for the validation process.
 * @param {number} [options.matchingSensitivity=0.25] - Scaling factor for dynamic matching sensitivity.
 * @param {number} [options.minEditDistance=0] - Minimum allowed edit distance.
 * @param {number} [options.maxEditDistance=5] - Maximum allowed edit distance.
 * @param {function} [options.customDistanceCalculator] - Custom function for calculating edit distance.
 * @returns {{ isValid: boolean, errors: string[] }} - Validation result, indicating validity and any errors.
 */
export function blocklistValidator(
  password: string,
  blocklist: string[] | null | undefined,
  options: {
    matchingSensitivity?: number;
    minEditDistance?: number;
    maxEditDistance?: number;
    customDistanceCalculator?: (term: string, password: string) => number;
  } = {}
): { isValid: boolean; errors: string[] } {
  const {
    matchingSensitivity: matchingSensitivity = 0.25,
    minEditDistance: minEditDistance = 0,
    maxEditDistance: maxEditDistance = 5,
    customDistanceCalculator: customDistanceCalculator,
  } = options;

  const errors: string[] = [];

  if (!Array.isArray(blocklist) || blocklist.length === 0) {
    return { isValid: true, errors };
  }

  const isBlocked = blocklist.some((blockedWord) => {
    const fuzzyTolerance = customDistanceCalculator
      ? customDistanceCalculator(blockedWord, password)
      : Math.max(
          Math.min(
            Math.floor(blockedWord.length * matchingSensitivity),
            maxEditDistance
          ),
          minEditDistance
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
