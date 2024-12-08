// src\validators\blacklistValidator.ts
import { ValidationResult, fuzzyTolerancevalue } from '../types';
import levenshteinDistance from '../utils/levenshteinDistance';

export function blacklistValidator(
  password: string,
  blacklist: string[] | null | undefined,
  fuzzyTolerance : fuzzyTolerancevalue = 3 
): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(blacklist) || blacklist.length === 0) {
    return { isValid: true, errors };
  }

  const isBlacklisted = blacklist.some((blacklistedWord) => {
    for (let i = 0; i <= password.length - blacklistedWord.length; i++) {
      const substring = password.substring(i, i + blacklistedWord.length);
      const distance = levenshteinDistance(substring.toLowerCase(), blacklistedWord.toLowerCase());
      if (distance <= fuzzyTolerance) {
        return true;
      }
    }
    return false;
  });

  if (isBlacklisted) {
    errors.push('Password contains a substring too similar to a blacklisted term.');
  }

  return { isValid: errors.length === 0, errors };
}
