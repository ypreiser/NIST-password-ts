// src\validators\blocklistValidator.ts
import { ValidationResult } from "../types";
import levenshteinDistance from "../utils/levenshteinDistance";

export function blocklistValidator(
  password: string,
  blocklist: string[] | null | undefined,
  fuzzyToleranceValue: number = 3
): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(blocklist) || blocklist.length === 0) {
    return { isValid: true, errors };
  }

  const isBlocked = blocklist.some((blockedWord) => {
    for (let i = 0; i <= password.length - blockedWord.length; i++) {
      const substring = password.substring(i, i + blockedWord.length);
      const distance = levenshteinDistance(
        substring.toLowerCase(),
        blockedWord.toLowerCase()
      );
      if (distance <= fuzzyToleranceValue) {
        return true;
      }
    }
    return false;
  });

  if (isBlocked) {
    errors.push(
      "Password contains a substring too similar to a blocked term."
    );
  }

  return { isValid: errors.length === 0, errors };
}
