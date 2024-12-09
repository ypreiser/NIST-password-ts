// src\tests\index.test.ts
import { describe, it, expect } from 'vitest';
import validatePassword  from '../index';

describe('Password Validation', () => {
  it('should validate passwords based on length', async () => {
    const result = await validatePassword('short', { hibpCheck: false });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 15 characters.');
  });

  it('should allow valid passwords', async () => {
    const result = await validatePassword('validpassword123456', { hibpCheck: false });
    expect(result.isValid).toBe(true);
  });

  it('should check HIBP for compromised passwords', async () => {
    const result = await validatePassword('password', { hibpCheck: true });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password has been compromised in a data breach.');
  });

  it('should detect blacklisted passwords with fuzzy matching', async () => {
    const result = await validatePassword('myp@ssw0rd', {
      blacklist: ['password'],
      hibpCheck: false,
      fuzzyTolerance: 3,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password contains a substring too similar to a blacklisted term.');
  });

  it('should validate passwords based on maximum length', async () => {
    const result = await validatePassword('thispasswordiswaytoolong', { maxLength: 15, hibpCheck: false });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at most 15 characters.');
  });

  it('should handle missing blacklist option gracefully', async () => {
    const result = await validatePassword('mylongerpassword', { hibpCheck: false });
    expect(result.isValid).toBe(true);
  });
});
