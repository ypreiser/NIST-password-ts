// src\tests\validators\blacklistValidator.test.ts
import { describe, it, expect } from 'vitest';
import { blacklistValidator } from '../../validators/blacklistValidator';

describe('blacklistValidator', () => {
  it('validates a password not in the blacklist', () => {
    const result = blacklistValidator('secret', ['password', '123456']);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('returns error for a password exactly matching a blacklist entry', () => {
    const result = blacklistValidator('password', ['password', '123456']);
    expect(result).toEqual({ isValid: false, errors: ['Password contains a substring too similar to a blacklisted term.'] });
  });

  it('validates a password when fuzzy matching is disabled', () => {
    const result = blacklistValidator('passw0rd', ['password'], 0); // No fuzzy matching
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('returns error for a close fuzzy match to a blacklisted password', () => {
    const result = blacklistValidator('passw0rd', ['password'], 2); // Allow a small fuzziness
    expect(result).toEqual({ isValid: false, errors: ['Password contains a substring too similar to a blacklisted term.'] });
  });

  it('validates a password when the blacklist is null', () => {
    const result = blacklistValidator('SecurePassword', null);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('validates a password when the blacklist is undefined', () => {
    const result = blacklistValidator('SecurePassword', undefined);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('validates a password when the blacklist is empty', () => {
    const result = blacklistValidator('SecurePassword', []);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('returns error for a password with a case-insensitive match in the blacklist', () => {
    const result = blacklistValidator('PASSWORD', ['password']);
    expect(result).toEqual({ isValid: false, errors: ['Password contains a substring too similar to a blacklisted term.'] });
  });

  it('validates a password when the fuzzyTolerance is high and not close to blacklist entries', () => {
    const result = blacklistValidator('thisiscompletelysafe', ['password', '123456'], 5); // Large tolerance but not similar
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('validates a password shorter than any blacklist entry', () => {
    const result = blacklistValidator('123', ['password']);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('returns error for a substring fuzzy match', () => {
    const result = blacklistValidator('myp@sswordishere', ['password'], 3); // Substring match
    expect(result).toEqual({ isValid: false, errors: ['Password contains a substring too similar to a blacklisted term.'] });
  });

  it('validates a password when no substrings match within fuzzyTolerance', () => {
    const result = blacklistValidator('thisiscompletelysafe', ['password'], 3); // No substrings match
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('handles empty password input gracefully', () => {
    const result = blacklistValidator('', ['password']);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('handles empty blacklist gracefully', () => {
    const result = blacklistValidator('password123', []);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('handles passwords containing multiple substrings of blacklisted terms', () => {
    const result = blacklistValidator('mypassword123', ['password', '123']);
    expect(result).toEqual({ isValid: false, errors: ['Password contains a substring too similar to a blacklisted term.'] });
  });

  it('handles passwords that partially overlap multiple blacklisted terms', () => {
    const result = blacklistValidator('pass123word', ['password', '123']);
    expect(result).toEqual({ isValid: false, errors: ['Password contains a substring too similar to a blacklisted term.'] });
  });
});
