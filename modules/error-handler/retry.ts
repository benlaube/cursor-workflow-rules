import { AppError, Result, ok, err } from './index';

interface RetryOptions {
  retries: number;
  delay: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * "Auto-healing" mechanism: Retries an async operation with exponential backoff.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = { retries: 3, delay: 1000, backoffFactor: 2 }
): Promise<Result<T, AppError>> {
  let lastError: any;
  let currentDelay = options.delay;

  for (let attempt = 1; attempt <= options.retries; attempt++) {
    try {
      const value = await operation();
      return ok(value);
    } catch (e: any) {
      lastError = e;
      
      const shouldRetry = options.shouldRetry ? options.shouldRetry(e) : true;
      if (!shouldRetry || attempt === options.retries) {
        break;
      }

      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Increase delay for next attempt
      if (options.backoffFactor) {
        currentDelay *= options.backoffFactor;
      }
    }
  }

  return err(new AppError(
    `Operation failed after ${options.retries} retries. Last error: ${lastError?.message}`, 
    'RETRY_EXHAUSTED'
  ));
}

