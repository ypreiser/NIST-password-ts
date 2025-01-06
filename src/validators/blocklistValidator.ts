import levenshteinDistance from "../utils/levenshteinDistance";
import { getUtf8Length } from "../utils/utf8Length";

/**
 * Validates a password against a blocklist, allowing for fuzzy matching.
 *
 * @param {string} password - The password to validate.
 * @param {string[] | null | undefined} blocklist - The list of blocked terms.
 * @param {object} [options] - Optional settings to customize validation.
 * @param {number} [options.matchingSensitivity=0.25] - Controls matching strictness based on term length. Default is 0.25 (25%).
 * @param {number} [options.minEditDistance=0] - Disabled! - Allways 0 to prevent false positives.
 * @param {number} [options.maxEditDistance=5] - Maximum character differences allowed for fuzzy matches. Default is 5.
 * @param {function} [options.customDistanceCalculator] - Custom function to calculate edit distance.
 * @param {boolean} [options.trimWhitespace=true] - Whether to trim leading/trailing whitespace from blocklist terms. Default is true.
 * @returns {{ isValid: boolean, errors: string[] }} - The validation result with any errors.
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
  } = {}
): { isValid: boolean; errors: string[] } {
  const {
    matchingSensitivity = 0.25,
    minEditDistance = 0,
    maxEditDistance = 5,
    customDistanceCalculator,
    trimWhitespace = true,
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
    trimWhitespace
      ? blocklist.map((term) => term.trim().toLowerCase())
      : blocklist.map((term) => term.toLowerCase())
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
    // Skip empty blocklist terms
    if (blockedWord === "") {
      return false;
    }

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

  const matchingTerms = Array.from(processedBlocklistSet).filter((term) =>
    isTermBlocked(term)
  );

  matchingTerms.forEach((term) => {
    errors.push(`Password contains a substring too similar to: "${term}".`);
  });

  return { isValid: errors.length === 0, errors };
}
