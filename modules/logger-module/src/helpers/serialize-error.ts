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
      fingerprint: createFingerprint(`${error.name}:${error.message}`),
    };
    
    if (error.stack) {
      const stackValue = sanitize ? sanitizeStackTrace(error.stack) : error.stack;
      base.stack = stackValue;
      base.stack_preview = stackValue.split('\n').slice(0, 3).join('\n');
    }
    
    // Add any additional error properties
    if ((error as any).code) {
      base.code = (error as any).code;
    }
    
    if ((error as any).statusCode) {
      base.statusCode = (error as any).statusCode;
    }
    
    if ((error as any).retryable !== undefined) {
      base.retryable = (error as any).retryable;
    } else if (base.statusCode) {
      const status = Number(base.statusCode);
      base.retryable = [429, 500, 502, 503, 504].includes(status);
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

/**
 * Creates a lightweight fingerprint for grouping similar errors.
 */
function createFingerprint(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `err_${Math.abs(hash)}`;
}
