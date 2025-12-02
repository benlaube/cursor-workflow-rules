/**
 * Error serialization helper.
 * 
 * Safely serializes error objects with stack traces and metadata.
 */

import { serializeError as sanitizeError, sanitizeStackTrace } from '../security/error-sanitizer';
import { safeSerialize } from '../security/circular-handler';

/**
 * Serializes an error object with full metadata.
 * 
 * @param error - Error object to serialize
 * @param sanitize - Whether to sanitize stack traces (default: true in production)
 * @returns Serialized error object
 */
export function serializeError(
  error: unknown,
  sanitize: boolean = typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
): Record<string, unknown> {
  if (error instanceof Error) {
    const base: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    };
    
    if (error.stack) {
      base.stack = sanitize ? sanitizeStackTrace(error.stack) : error.stack;
    }
    
    // Add any additional error properties
    if ((error as any).code) {
      base.code = (error as any).code;
    }
    
    if ((error as any).statusCode) {
      base.statusCode = (error as any).statusCode;
    }
    
    if (error.cause) {
      base.cause = serializeError(error.cause, sanitize);
    }
    
    // Include any other enumerable properties
    for (const key in error) {
      if (error.hasOwnProperty(key) && !['name', 'message', 'stack', 'cause'].includes(key)) {
        try {
          base[key] = safeSerialize((error as any)[key]);
        } catch {
          // Skip properties that can't be serialized
        }
      }
    }
    
    return base;
  }
  
  // Non-Error objects
  return {
    message: String(error),
    type: typeof error,
    value: safeSerialize(error),
  };
}

