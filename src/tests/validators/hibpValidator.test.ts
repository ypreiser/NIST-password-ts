// nist-password-validator\src\tests\validators\hibpValidator.test.ts
import { hibpValidator, generateSHA1 } from '../../validators/hibpValidator';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import type { ValidationResult } from "../../types";

describe('HIBP Password Validator', () => {
  // Test utilities
  const mockFetch = (response: Partial<Response>) => {
    global.fetch = vi.fn().mockResolvedValueOnce(response as Response);
  };

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Happy Path', () => {
    it('should validate a password not found in breaches', async () => {
      mockFetch({
        ok: true,
        text: async () => 'ABCDE:2\nFGHIJ:3',
      });

      const result = await hibpValidator('SecurePass123!');
      expect(result).toEqual<ValidationResult>({ 
        isValid: true, 
        errors: [] 
      });
    });

    it('should handle empty response from API correctly', async () => {
      mockFetch({
        ok: true,
        text: async () => '',
      });

      const result = await hibpValidator('AnotherSecurePass456!');
      expect(result).toEqual<ValidationResult>({ 
        isValid: true, 
        errors: [] 
      });
    });

    it('should correctly identify a breached password', async () => {
      const password = 'password123';
      const sha1 = await generateSHA1(password);
      const suffix = sha1.substring(5);

      mockFetch({
        ok: true,
        text: async () => `${suffix}:1337\nOTHERHASH:42`,
      });

      const result = await hibpValidator(password);
      expect(result).toEqual<ValidationResult>({ 
        isValid: false, 
        errors: ['Password has been compromised in a data breach.'] 
      });
    });
  });

  describe('Sad Path', () => {
    it('should handle API error responses with detailed error message', async () => {
      mockFetch({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Service temporarily unavailable',
      });

      const result = await hibpValidator('password123');
      expect(result).toEqual<ValidationResult>({
        isValid: false,
        errors: ['Unable to verify password against breach database. Please try again later.'],
      });
    });

    it('should handle network failures gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(
        new Error('Network connection failed')
      );

      const result = await hibpValidator('password123');
      expect(result).toEqual<ValidationResult>({
        isValid: false,
        errors: ['Unable to verify password against breach database. Please try again later.'],
      });
    });

    it('should handle malformed API responses', async () => {
      mockFetch({
        ok: true,
        text: async () => 'INVALID:FORMAT:EXTRA:COLONS',
      });

      const result = await hibpValidator('password123');
      expect(result).toEqual<ValidationResult>({ 
        isValid: true, 
        errors: [] 
      });
    });

    it('should handle API rate limiting', async () => {
      mockFetch({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => 'Rate limit exceeded',
      });

      const result = await hibpValidator('password123');
      expect(result).toEqual<ValidationResult>({
        isValid: false,
        errors: ['Unable to verify password against breach database. Please try again later.'],
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle passwords with special characters correctly', async () => {
      mockFetch({
        ok: true,
        text: async () => 'ABCDE:0',
      });

      const result = await hibpValidator('!@#$%^&*()_+{}:"<>?😀');
      expect(result).toEqual<ValidationResult>({ 
        isValid: true, 
        errors: [] 
      });
    });

    it('should handle extremely long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      mockFetch({
        ok: true,
        text: async () => 'ABCDE:0',
      });

      const result = await hibpValidator(longPassword);
      expect(result).toEqual<ValidationResult>({ 
        isValid: true, 
        errors: [] 
      });
    });

    it('should handle passwords with zero occurrences in breaches', async () => {
      const password = 'UniquePassword123!';
      const sha1 = await generateSHA1(password);
      const suffix = sha1.substring(5);

      mockFetch({
        ok: true,
        text: async () => `${suffix}:0\nOTHERHASH:42`,
      });

      const result = await hibpValidator(password);
      expect(result).toEqual<ValidationResult>({ 
        isValid: true, 
        errors: [] 
      });
    });
  });
});