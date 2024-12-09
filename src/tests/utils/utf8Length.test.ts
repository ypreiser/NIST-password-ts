// src\tests\utils\utf8Length.test.ts

import { describe, it, expect } from 'vitest';
import { getUtf8Length } from '../../utils/utf8Length';

describe('getUtf8Length', () => {
  it('should count ASCII characters correctly', () => {
    expect(getUtf8Length('hello')).toBe(5);
    expect(getUtf8Length('12345')).toBe(5);
    expect(getUtf8Length('hello world')).toBe(11);
    expect(getUtf8Length(' ')).toBe(1);
  });

  it('should count emoji characters correctly', () => {
    expect(getUtf8Length('👋')).toBe(1);
    expect(getUtf8Length('hello 👋')).toBe(7);
    expect(getUtf8Length('👍🏾')).toBe(2); // Family emoji (combined emoji)
    expect(getUtf8Length('👨‍👩‍👧‍👦')).toBe(7); // Family emoji (combined emoji)
  });

  it('should count non-ASCII Unicode characters correctly', () => {
    expect(getUtf8Length('こんにちは')).toBe(5); // Japanese
    expect(getUtf8Length('привет')).toBe(6);     // Russian
    expect(getUtf8Length('안녕하세요')).toBe(5);  // Korean
  });

  it('should handle empty strings', () => {
    expect(getUtf8Length('')).toBe(0);
  });

  it('should handle mixed character types', () => {
    expect(getUtf8Length('hello 世界 👋')).toBe(10);
    expect(getUtf8Length('123 こん 👨‍👩‍👧‍👦 abc')).toBe(18);
  });
}); 