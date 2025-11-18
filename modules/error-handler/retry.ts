import { AppError, Result, ok, err } from './index';

/**
 * Options to configure the retry behavior.
 */
interface RetryOptions {
  /** Number of retry attempts before giving up. Default: 3 */
  retries: number;
  /** Initial delay in milliseconds. Default: 1000ms */
  delay: number;
  /** 
   * Multiplier for the delay after each attempt (Exponential Backoff).
   * e.g., factor 2 means: 1000ms -> 2000ms -> 4000ms
   * Default: 2 
   */
  backoffFactor?: number;
  /**
   * Optional predicate to determine if a specific error should trigger a retry.
   * Useful for retrying network errors (503) but not client errors (400).
   * @returns true to retry, false to abort immediately.
   */
  shouldRetry?: (error: any) => boolean;
}

/**
 * Auto-Healing / Retry Mechanism.
 * 
 * Automatically retries an asynchronous operation that fails.
 * Implements "Exponential Backoff" to avoid thundering herd problems on failing services.
 * 
 * @param operation - A function that returns a Promise (the action to retry)
 * @param options - Configuration for retries
 * 
 * @example
 * const result = await withRetry(
 *   () => api.fetchData(),
 *   { retries: 3, delay: 500, shouldRetry: (e) => e.status === 503 }
 * );
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = { retries: 3, delay: 1000, backoffFactor: 2 }
): Promise<Result<T, AppError>> {
  let lastError: any;
  let currentDelay = options.delay;

  // Loop through attempts. Note: attempt=1 is the first TRY, so retries=3 means 4 total attempts.
  // Implementation details: actually standard retry logic usually counts retries AS retries.
  // Let's stick to standard: 1 initial attempt + N retries.
  const totalAttempts = options.retries + 1;

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    try {
      const value = await operation();
      return ok(value);
    } catch (e: any) {
      lastError = e;
      
      // Check if we should retry based on the error type
      const shouldRetry = options.shouldRetry ? options.shouldRetry(e) : true;
      
      // If this was the last attempt OR validation says don't retry -> break
      if (!shouldRetry || attempt === totalAttempts) {
        break;
      }

      // Wait for the backoff period
      // TODO: Consider adding "Jitter" here to prevent synchronized retries in distributed systems
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Increase delay for next attempt
      if (options.backoffFactor) {
        currentDelay *= options.backoffFactor;
      }
    }
  }

  // If we exit the loop, all retries failed.
  return err(new AppError(
    `Operation failed after ${options.retries} retries. Last error: ${lastError?.message}`, 
    'RETRY_EXHAUSTED'
  ));
}
