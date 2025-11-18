export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/**
 * Wraps a promise in a Result type for safe handling.
 */
export async function safe<T>(promise: Promise<T>): Promise<Result<T, AppError>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (e: any) {
    return err(new AppError(e.message || 'Unknown error', 'UNKNOWN_ERROR'));
  }
}

