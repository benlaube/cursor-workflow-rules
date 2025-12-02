/**
 * Logger interface for dependency injection and type safety.
 * 
 * Defines the public API of the logger that can be used for:
 * - Dependency injection
 * - Type-safe logger parameters
 * - Mock implementations
 * - Swappable logger implementations
 */

// LogLevel is not needed in the interface, but kept for potential future use

/**
 * Core logger interface matching the Logger class public API.
 */
export interface ILogger {
  /**
   * Logs a trace-level message.
   */
  trace(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs a debug-level message.
   */
  debug(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs an info-level message.
   */
  info(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs a warning-level message.
   */
  warn(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs an error-level message.
   * 
   * @param message - Error message
   * @param error - Error object (optional)
   * @param meta - Additional metadata (optional)
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;

  /**
   * Logs a fatal-level message.
   * 
   * @param message - Fatal error message
   * @param error - Error object (optional)
   * @param meta - Additional metadata (optional)
   */
  fatal(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;

  /**
   * Logs a user action (custom level).
   */
  userAction(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs a notice (custom level).
   */
  notice(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs a success (custom level).
   */
  success(message: string, meta?: Record<string, unknown>): void;

  /**
   * Logs a failure (custom level).
   * 
   * @param message - Failure message
   * @param error - Error object (optional)
   * @param meta - Additional metadata (optional)
   */
  failure(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;

  /**
   * Creates a child logger with additional context.
   * 
   * @param bindings - Additional context/bindings for the child logger
   * @returns Child logger instance (same type as parent for type compatibility)
   */
  child(bindings: Record<string, unknown>): this;

  /**
   * Gracefully shuts down the logger.
   * Flushes database handler and closes file streams.
   * 
   * @returns Promise that resolves when shutdown is complete
   */
  shutdown?(): Promise<void>;
}

/**
 * Type guard to check if an object implements ILogger.
 */
export function isILogger(obj: unknown): obj is ILogger {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const logger = obj as any;
  return (
    typeof logger.trace === 'function' &&
    typeof logger.debug === 'function' &&
    typeof logger.info === 'function' &&
    typeof logger.warn === 'function' &&
    typeof logger.error === 'function' &&
    typeof logger.fatal === 'function' &&
    typeof logger.userAction === 'function' &&
    typeof logger.notice === 'function' &&
    typeof logger.success === 'function' &&
    typeof logger.failure === 'function'
  );
}

