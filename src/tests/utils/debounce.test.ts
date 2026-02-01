// src/tests/utils/debounce.test.ts
import { createDebouncer } from '../../utils/debounce';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('createDebouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should reject all pending promises when function throws', async () => {
    const error = new Error('Test error');
    const throwingFn = vi.fn().mockRejectedValue(error);
    const debounced = createDebouncer(throwingFn, 100);

    // Attach catch handlers immediately to prevent unhandled rejection warnings
    const errors: Error[] = [];
    const promise1 = debounced('arg1').catch((e) => { errors.push(e); });
    const promise2 = debounced('arg2').catch((e) => { errors.push(e); });

    await vi.advanceTimersByTimeAsync(110);
    await Promise.all([promise1, promise2]);

    expect(errors).toHaveLength(2);
    expect(errors[0].message).toBe('Test error');
    expect(errors[1].message).toBe('Test error');
    expect(throwingFn).toHaveBeenCalledTimes(1);
  });

  it('should resolve all pending promises with same result', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const debounced = createDebouncer(mockFn, 100);

    const promise1 = debounced('arg1');
    const promise2 = debounced('arg2');

    await vi.advanceTimersByTimeAsync(110);

    const [result1, result2] = await Promise.all([promise1, promise2]);
    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg2'); // Last call wins
  });
});
