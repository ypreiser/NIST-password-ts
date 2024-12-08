// src\tests\utils\levenshteinDistance.test.ts
import { describe, it, expect } from 'vitest';
import levenshteinDistance from '../../utils/levenshteinDistance';

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
    expect(levenshteinDistance('a', 'a')).toBe(0);
  });

  it('should return the correct distance for strings of different lengths', () => {
    expect(levenshteinDistance('hello', 'hell')).toBe(1);    // deletion
    expect(levenshteinDistance('hell', 'hello')).toBe(1);    // insertion
    expect(levenshteinDistance('', 'a')).toBe(1);            // insertion into empty string
    expect(levenshteinDistance('a', '')).toBe(1);            // deletion to empty string
  });

  it('should handle substitutions correctly', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);       // single substitution
    expect(levenshteinDistance('dog', 'fog')).toBe(1);       // single substitution
    expect(levenshteinDistance('kitten', 'sitten')).toBe(1); // single substitution
  });

  it('should handle multiple operations correctly', () => {
    expect(levenshteinDistance('sitting', 'kitten')).toBe(3);  // multiple operations
    expect(levenshteinDistance('sunday', 'saturday')).toBe(3); // multiple operations
    expect(levenshteinDistance('abc', 'def')).toBe(3);         // all substitutions
  });

  it('should handle completely different strings', () => {
    expect(levenshteinDistance('hello', 'world')).toBe(4);
    expect(levenshteinDistance('password', '12345678')).toBe(8);
  });

  it('should handle case sensitivity', () => {
    expect(levenshteinDistance('hello', 'Hello')).toBe(1);
    expect(levenshteinDistance('WORLD', 'world')).toBe(5);
  });
}); 