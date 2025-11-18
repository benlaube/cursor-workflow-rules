/**
 * Base error class for the application.
 * 
 * Distinguishes between:
 * - Operational Errors: Expected runtime errors (e.g., Validation failed, Not Found). 
 *   These are part of the domain logic and can be handled gracefully.
 * - Programmer Errors: Bugs in the code (e.g., undefined is not a function). 
 *   These usually require a crash/restart to ensure system integrity.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  /**
   * @param message - Human readable error message
   * @param code - Machine readable error code (e.g., 'USER_NOT_FOUND')
   * @param statusCode - HTTP status code (default 500)
   * @param isOperational - True if this is a known/handled error case (default true)
   */
  constructor(message: string, code: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Captures the stack trace at the point where this error was instantiated
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Result Type Pattern (inspired by Rust/Go).
 * 
 * Eliminates the need for try/catch blocks in business logic.
 * Forces the consumer to check if the operation was successful (`ok: true`) 
 * or failed (`ok: false`) before accessing the value.
 */
export type Result<T, E = AppError> = 
  | { ok: true; value: T } 
  | { ok: false; error: E };

// Helper constructors for Result type
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/**
 * Safe Promise Wrapper.
 * 
 * Wraps any Promise and converts rejection into a Result type.
 * Prevents unhandled promise rejections crashing the process.
 * 
 * @example
 * const result = await safe(db.users.findMany());
 * if (!result.ok) {
 *   // handle error
 *   return;
 * }
 * // access result.value safely
 */
export async function safe<T>(promise: Promise<T>): Promise<Result<T, AppError>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (e: any) {
    // Normalize unknown errors into AppError
    return err(new AppError(e.message || 'Unknown error', 'UNKNOWN_ERROR'));
  }
}
