// src\tests\index.test.ts
import { describe, it, expect } from 'vitest';
import validatePassword  from '../index';

describe('Password Validation', () => {
  it('should return an error for empty password', async () => {
    const result = await validatePassword('', {});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password cannot be empty.');
  });

  it('should return an error for invalid minLength', async () => {
    const result = await validatePassword('validPassword', { minLength: '10' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimum length must be a number.');
  });

  it('should return an error for invalid maxLength', async () => {
    const result = await validatePassword('validPassword', { maxLength: '20' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Maximum length must be a number.');
  });

  it('should return an error for invalid blacklist', async () => {
    const result = await validatePassword('validPassword', { blacklist: 'notAnArray' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Blacklist must be an array.');
  });

  it('should return an error for invalid fuzzyToleranceValue', async () => {
    const result = await validatePassword('validPassword', { fuzzyToleranceValue: '3' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Fuzzy tolerance must be a number.');
  });

  it('should validate a valid password', async () => {
    const result = await validatePassword('validPassword123', { minLength: 8, maxLength: 64, blacklist: [], fuzzyToleranceValue: 3 });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should validate a password with maximum length error', async () => {
    const result = await validatePassword('thispasswordiswaytoolong', { maxLength: 15 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at most 15 characters.');
  });

  it('should use default options when none are provided', async () => {
    const result = await validatePassword('validPassword123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should check HIBP for compromised passwords', async () => {
    const result = await validatePassword('password', { hibpCheck: true });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password has been compromised in a data breach.');
  });
});
