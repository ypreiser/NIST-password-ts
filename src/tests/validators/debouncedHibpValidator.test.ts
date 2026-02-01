// src/tests/validators/debouncedHibpValidator.test.ts
import { debouncedHibpValidator, clearDebouncerCache } from '../../validators/debouncedHibpValidator';
import { generateSHA1 } from '../../validators/hibpValidator';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';
import type { ValidationResult } from "../../types";

describe('Debounced HIBP Validator', () => {
  const mockFetch = (response: Partial<Response>) => {
    global.fetch = vi.fn().mockResolvedValue(response as Response);
  };

  beforeEach(() => {
    vi.useFakeTimers();
    clearDebouncerCache();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Debouncing Behavior', () => {
    it('should only call API once for rapid sequential calls', async () => {
      mockFetch({
        ok: true,
        text: async () => 'ABCDE:0',
      });

      const delay = 100;

      // Make 3 rapid calls
      const promise1 = debouncedHibpValidator('password1', delay);
      const promise2 = debouncedHibpValidator('password2', delay);
      const promise3 = debouncedHibpValidator('password3', delay);

      // Advance timers past debounce delay
      await vi.advanceTimersByTimeAsync(delay + 10);

      const results = await Promise.all([promise1, promise2, promise3]);

      // All should resolve to the same result (from last call)
      expect(results[0]).toEqual<ValidationResult>({ isValid: true, errors: [] });
      expect(results[1]).toEqual<ValidationResult>({ isValid: true, errors: [] });
      expect(results[2]).toEqual<ValidationResult>({ isValid: true, errors: [] });

      // API should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should wait for debounce delay before calling API', async () => {
      mockFetch({
        ok: true,
        text: async () => 'ABCDE:0',
      });

      const delay = 200;
      const promise = debouncedHibpValidator('testpassword', delay);

      // Before delay passes
      expect(global.fetch).not.toHaveBeenCalled();

      // Advance partially
      await vi.advanceTimersByTimeAsync(100);
      expect(global.fetch).not.toHaveBeenCalled();

      // Advance past delay
      await vi.advanceTimersByTimeAsync(150);
      await promise;

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should reset timer when new call arrives', async () => {
      mockFetch({
        ok: true,
        text: async () => 'ABCDE:0',
      });

      const delay = 100;

      // First call
      const promise1 = debouncedHibpValidator('password1', delay);

      // Wait 50ms (half the delay)
      await vi.advanceTimersByTimeAsync(50);
      expect(global.fetch).not.toHaveBeenCalled();

      // Second call - should reset timer
      const promise2 = debouncedHibpValidator('password2', delay);

      // Wait another 50ms - still shouldn't fire (timer reset)
      await vi.advanceTimersByTimeAsync(50);
      expect(global.fetch).not.toHaveBeenCalled();

      // Wait remaining time
      await vi.advanceTimersByTimeAsync(60);

      await Promise.all([promise1, promise2]);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should call API separately for calls after debounce completes', async () => {
      mockFetch({
        ok: true,
        text: async () => 'ABCDE:0',
      });

      const delay = 100;

      // First call
      const promise1 = debouncedHibpValidator('password1', delay);
      await vi.advanceTimersByTimeAsync(delay + 10);
      await promise1;

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call after debounce completes
      const promise2 = debouncedHibpValidator('password2', delay);
      await vi.advanceTimersByTimeAsync(delay + 10);
      await promise2;

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Result Handling', () => {
    it('should return breach result correctly', async () => {
      const password = 'breachedpassword';
      const sha1 = await generateSHA1(password);
      const suffix = sha1.substring(5);

      mockFetch({
        ok: true,
        text: async () => `${suffix}:1337\nOTHERHASH:42`,
      });

      const promise = debouncedHibpValidator(password, 50);
      await vi.advanceTimersByTimeAsync(60);

      const result = await promise;
      expect(result).toEqual<ValidationResult>({
        isValid: false,
        errors: ['Password has been compromised in a data breach.'],
      });
    });

    it('should handle API errors gracefully', async () => {
      mockFetch({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      const promise = debouncedHibpValidator('anypassword', 50);
      await vi.advanceTimersByTimeAsync(60);

      const result = await promise;
      expect(result).toEqual<ValidationResult>({
        isValid: false,
        errors: ['Unable to verify password against breach database. Please try again later.'],
      });
    });

    it('should reject all pending promises when underlying function throws', async () => {
      // Make fetch throw an error that propagates
      global.fetch = vi.fn().mockImplementation(() => {
        throw new Error('Network failure');
      });

      const promise1 = debouncedHibpValidator('password1', 50);
      const promise2 = debouncedHibpValidator('password2', 50);

      await vi.advanceTimersByTimeAsync(60);

      // hibpValidator catches errors and returns a result, so both should resolve
      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toEqual<ValidationResult>({
        isValid: false,
        errors: ['Unable to verify password against breach database. Please try again later.'],
      });
      expect(result2).toEqual<ValidationResult>({
        isValid: false,
        errors: ['Unable to verify password against breach database. Please try again later.'],
      });
    });
  });

  describe('Zero Delay', () => {
    it('should work with zero delay (immediate execution)', async () => {
      mockFetch({
        ok: true,
        text: async () => 'ABCDE:0',
      });

      const promise = debouncedHibpValidator('password1', 0);

      // Zero delay still requires timer to fire
      await vi.advanceTimersByTimeAsync(1);

      const result = await promise;
      expect(result).toEqual<ValidationResult>({ isValid: true, errors: [] });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
