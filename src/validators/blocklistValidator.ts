// nist-password-validator\src\validators\blocklistValidator.ts
import levenshteinDistance from "../utils/levenshteinDistance";
import { getUtf8Length } from "../utils/utf8Length";

/**
 * Validates a password against a blocklist, allowing for fuzzy matching.
 *
 * Uses Levenshtein distance to detect passwords that are too similar to blocked terms,
 * preventing common variations like "p@ssw0rd" when "password" is blocked.
 *
 * @param {string} password - The password to validate.
 * @param {string[] | null | undefined} blocklist - The list of blocked terms.
 * @param {object} [options] - Optional settings to customize validation.
 * @param {number} [options.matchingSensitivity=0.25] - Controls matching strictness based on term length. Default is 0.25 (25%).
 * @param {number} [options.minEditDistance] - Legacy parameter, currently unused. Kept for backward compatibility.
 * @param {number} [options.maxEditDistance=5] - Maximum character differences allowed for fuzzy matches. Default is 5.
 * @param {function} [options.customDistanceCalculator] - Custom function to calculate edit distance.
 * @param {boolean} [options.trimWhitespace=true] - Whether to trim leading/trailing whitespace from blocklist terms. Default is true.
 * @param {number} [options.errorLimit=Infinity] - Maximum number of errors to report. Default is Infinity.
 * @returns {ValidationResult} - An object containing a boolean indicating validity and an array of error messages.
 *
 * @example
 * Exact match detection
 * ```typescript
 * const result = blocklistValidator("password123", ["password", "admin"]);
 * // Returns: {
 * //   isValid: false,
 * //   errors: ['Password contains a substring too similar to: "password".']
 * // }
 * ```
 *
 * @example
 * Fuzzy matching detects variations
 * ```typescript
 * const result = blocklistValidator("p@ssw0rd", ["password"]);
 * // Detects "p@ssw0rd" is similar to "password"
 * // Returns: {
 * //   isValid: false,
 * //   errors: ['Password contains a substring too similar to: "password".']
 * // }
 * ```
 *
 * @example
 * Valid password (no matches)
 * ```typescript
 * const result = blocklistValidator("MySecurePass123", ["password", "admin"]);
 * // Returns: { isValid: true, errors: [] }
 * ```
 */
export function blocklistValidator(
  password: string,
  blocklist: string[] | null | undefined,
  options: {
    matchingSensitivity?: number;
    minEditDistance?: number;
    maxEditDistance?: number;
    customDistanceCalculator?: (term: string, password: string) => number;
    trimWhitespace?: boolean;
    errorLimit?: number;
  } = {}
): { isValid: boolean; errors: string[] } {
  const {
    matchingSensitivity = 0.25,
    maxEditDistance = 5,
    customDistanceCalculator,
    trimWhitespace = true,
    errorLimit = Infinity,
  } = options;

  const errors: string[] = [];

  if (
    !Array.isArray(blocklist) ||
    blocklist.length === 0 ||
    blocklist.every((term) => term === "")
  ) {
    return { isValid: true, errors };
  }

  // Preprocess blocklist into a Set for fast lookups
  const processedBlocklistSet = new Set(
    blocklist
      .filter((term) => term.trim() !== "") // Remove empty strings
      .map((term) =>
        trimWhitespace ? term.trim().toLowerCase() : term.toLowerCase()
      )
  );

  // Helper: Calculate fuzzy tolerance
  const calculateFuzzyTolerance = (term: string) => {
    if (customDistanceCalculator) {
      return customDistanceCalculator(term, password);
    }
    return Math.max(
      Math.min(
        Math.floor(getUtf8Length(term) * matchingSensitivity),
        maxEditDistance
      ),
      0
    );
  };

  // Helper: Check if a password substring matches a blocklist term
  const isTermBlocked = (blockedWord: string): boolean => {
    const fuzzyTolerance = calculateFuzzyTolerance(blockedWord);

    // Use Set for exact matching when bypassing fuzzy matching for short terms
    if (getUtf8Length(blockedWord) <= fuzzyTolerance) {
      return processedBlocklistSet.has(blockedWord.toLowerCase());
    }

    for (
      let i = 0;
      i <= getUtf8Length(password) - getUtf8Length(blockedWord);
      i++
    ) {
      const substring = password
        .substring(i, i + getUtf8Length(blockedWord))
        .toLowerCase();
      const distance = levenshteinDistance(substring, blockedWord);
      if (distance <= fuzzyTolerance) {
        return true;
      }
    }
    return false;
  };

  // Validate against blocklist with early exit on error limit
  for (const term of processedBlocklistSet) {
    if (isTermBlocked(term)) {
      errors.push(`Password contains a substring too similar to: "${term}".`);
      if (errors.length >= errorLimit) {
        break; // Stop further checks when error limit is reached
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}
