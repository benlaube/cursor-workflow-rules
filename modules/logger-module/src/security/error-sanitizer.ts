/**
 * Error sanitization utilities.
 * 
 * Removes sensitive information from error objects and stack traces
 * for production environments.
 */

/**
 * Sanitizes an error object by removing file paths and internal details.
 * 
 * @param error - Error object to sanitize
 * @param sanitizeStack - Whether to sanitize the stack trace (default: true)
 * @returns Sanitized error object
 */
export function sanitizeError(
  error: Error,
  sanitizeStack: boolean = true
): {
  name: string;
  message: string;
  stack?: string;
} {
  const sanitized: {
    name: string;
    message: string;
    stack?: string;
  } = {
    name: error.name,
    message: error.message,
  };
  
  if (sanitizeStack && error.stack) {
    sanitized.stack = sanitizeStackTrace(error.stack);
  }
  
  return sanitized;
}

/**
 * Sanitizes a stack trace by removing file paths and internal details.
 * 
 * @param stack - Stack trace string
 * @returns Sanitized stack trace
 */
export function sanitizeStackTrace(stack: string): string {
  return stack
    // Remove absolute file paths (keep only filename)
    .replace(/\([^)]*\/node_modules\/[^)]+\)/g, '(node_modules/...)')
    .replace(/\([^)]*\/src\/[^)]+\)/g, '(src/...)')
    .replace(/\([^)]*\/lib\/[^)]+\)/g, '(lib/...)')
    .replace(/at [^(]+\([^)]*\/[^/]+\)/g, (match) => {
      // Extract just the filename
      const filenameMatch = match.match(/\/([^/]+)\)/);
      if (filenameMatch) {
        return match.replace(/\([^)]+\)/, `(${filenameMatch[1]})`);
      }
      return match;
    })
    // Remove user home directory paths
    .replace(/\/Users\/[^/]+/g, '~')
    .replace(/\/home\/[^/]+/g, '~')
    // Remove internal module paths
    .replace(/internal\/[^:]+/g, 'internal/...');
}

/**
 * Serializes an error object safely, with optional sanitization.
 * 
 * @param error - Error object to serialize
 * @param sanitize - Whether to sanitize the error (default: true in production)
 * @returns Serialized error object
 */
export function serializeError(
  error: unknown,
  sanitize: boolean = process.env.NODE_ENV === 'production'
): {
  name?: string;
  message: string;
  stack?: string;
  code?: string;
  cause?: unknown;
} {
  if (error instanceof Error) {
    const base = {
      name: error.name,
      message: error.message,
      ...(error.stack && { stack: sanitize ? sanitizeStackTrace(error.stack) : error.stack }),
      ...((error as any).code && { code: (error as any).code }),
      ...(error.cause && { cause: serializeError(error.cause, sanitize) }),
    };
    
    return sanitize ? sanitizeError(error, true) : base;
  }
  
  // Non-Error objects
  return {
    message: String(error),
  };
}

