// src\tests\validators\lengthValidator.test.ts
import { describe, expect, it } from 'vitest';
import { lengthValidator } from '../../validators/lengthValidator';

describe('lengthValidator', () => {
  it('validates password with valid length', () => {
    const result = lengthValidator('ValidPassword', 8, 64);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('returns error for password shorter than min length', () => {
    const result = lengthValidator('short', 8, 64);
    expect(result).toEqual({ isValid: false, errors: ['Password must be at least 8 characters.'] });
  });
  it('returns error for password shorter than min length', () => {
    const result = lengthValidator('short');
    expect(result).toEqual({ isValid: false, errors: ['Password must be at least 15 characters.'] });
  });

  it('returns error for password longer than max length', () => {
    const result = lengthValidator('😁'.repeat(100001), 8);
    expect(result).toEqual({ isValid: false, errors: ['Password must not exceed 100000 characters.'] });
  });
  it('returns error for password longer than max length', () => {
    const result = lengthValidator('😁'.repeat(65), 8, 64);
    expect(result).toEqual({ isValid: false, errors: ['Password must not exceed 64 characters.'] });
  });

  it('validates password with length equal to min length', () => {
    const result = lengthValidator('12345678', 8, 64);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('validates password with length equal to max length', () => {
    const result = lengthValidator('a'.repeat(64), 8, 64);
    expect(result).toEqual({ isValid: true, errors: [] });
  });
});
