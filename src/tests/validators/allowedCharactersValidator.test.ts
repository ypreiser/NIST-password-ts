// src\tests\validators\allowedCharactersValidator.test.ts
import { describe, it, expect } from 'vitest';
import { allowedCharactersValidator } from '../../validators/allowedCharactersValidator ';

describe('allowedCharactersValidator', () => {
  it('skips validation when no regex is provided', () => {
    const result = allowedCharactersValidator('AnyPassword');
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('validates password with valid characters', () => {
    const regex = /^[\u0020-\u007E]+$/; // Printable ASCII
    const result = allowedCharactersValidator('ValidPassword123!', regex);
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('returns error for password with invalid characters', () => {
    const regex = /^[\u0020-\u007E]+$/; // Printable ASCII
    const result = allowedCharactersValidator('Invalid💣', regex);
    expect(result).toEqual({ isValid: false, errors: ['Password contains invalid characters.'] });
  });
});
