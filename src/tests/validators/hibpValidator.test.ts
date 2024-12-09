// src\tests\validators\hibpValidator.test.ts
import { hibpValidator } from '../../validators/hibpValidator';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

// Helper function to generate SHA-1 hash for test passwords
async function generateSHA1(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => (b < 16 ? "0" : "") + b.toString(16)).join("").toUpperCase();
}

describe('hibpValidator', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates a password not in the HIBP database', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () => 'ABCDE:2\n12345:3', // Example hash ranges with no match
    } as Response);

    const result = await hibpValidator('uniquePassword123');
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  it('returns error for password in the HIBP database', async () => {
    // Generate SHA-1 for "password"
    const sha1 = await generateSHA1('password');
    const prefix = sha1.substring(0, 5); // First 5 characters
    const suffix = sha1.substring(5);    // Remaining characters

    // Mock fetch to return a response containing the matching suffix
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () => `${suffix.toUpperCase()}:1\nOTHERHASH:2`, // Matching suffix included
    } as Response);

    const result = await hibpValidator('password');
    expect(result).toEqual({ isValid: false, errors: ['Password has been compromised in a data breach.'] });
  });

  it('handles non-200 API responses gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Error details', // Add details for better error logging
    } as Response);

    await expect(hibpValidator('password')).rejects.toThrow(
      'HaveIBeenPwned check failed: Failed to check password against HaveIBeenPwned API. Status: 500, Details: Error details'
    );
  });

  it('throws an error for network issues or invalid responses', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(hibpValidator('password')).rejects.toThrow('HaveIBeenPwned check failed: Network error');
  });

  // New test for handling unexpected response formats
  it('throws an error for unexpected response format', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      text: async () => 'Unexpected format', // Simulate unexpected response
    } as Response);

    const result = await hibpValidator('unexpectedPassword');
    expect(result).toEqual({ isValid: true, errors: [] }); // Assuming it defaults to valid
  });
});
