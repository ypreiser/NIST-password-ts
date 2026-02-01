// src/utils/debounce.ts

/**
 * Creates a debounced version of an async function.
 * Cancels pending calls when new ones arrive.
 *
 * @param fn - The async function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function that returns a promise
 */
export function createDebouncer<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  delay: number
): (...args: A) => Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingResolvers: Array<{
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
  }> = [];

  return (...args: A): Promise<T> => {
    return new Promise((resolve, reject) => {
      // Clear any existing timeout
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      // Add this caller to pending resolvers
      pendingResolvers.push({ resolve, reject });

      // Set new timeout
      timeoutId = setTimeout(async () => {
        const resolversToNotify = pendingResolvers;
        pendingResolvers = [];
        timeoutId = null;

        try {
          const result = await fn(...args);
          resolversToNotify.forEach(({ resolve }) => resolve(result));
        } catch (error) {
          resolversToNotify.forEach(({ reject }) => reject(error));
        }
      }, delay);
    });
  };
}
