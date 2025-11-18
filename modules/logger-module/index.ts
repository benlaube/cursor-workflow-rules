import pino from 'pino';

/**
 * Configuration options for the Logger.
 */
export interface LoggerOptions {
  /**
   * Current environment. 
   * - 'development': Enables pretty printing and lower log level (debug).
   * - 'production': Uses JSON formatting and higher log level (info) for performance.
   * - 'test': Can be used to silence logs or capture them for assertions.
   */
  env: 'development' | 'production' | 'test';
  
  /**
   * The name of the service or module using the logger.
   * Helpful for filtering logs in a microservices architecture (e.g., 'auth-service', 'payment-worker').
   */
  serviceName: string;
}

/**
 * A standardized wrapper around the Pino logger.
 * 
 * Design Goals:
 * 1. Consistency: Ensures all services log in the same format.
 * 2. Performance: Uses asynchronous logging in production via Pino.
 * 3. Developer Experience: Readable logs in development.
 */
export class Logger {
  private logger: pino.Logger;

  constructor(options: LoggerOptions) {
    this.logger = pino({
      name: options.serviceName,
      // Debug level in dev allows seeing verbose details. Info in prod reduces noise.
      level: options.env === 'development' ? 'debug' : 'info',
      
      // Transport configuration:
      // In 'development', we use 'pino-pretty' to format logs for human readability.
      // In 'production', we use default (undefined) which outputs structured JSON. 
      // JSON is crucial for tools like Datadog, Splunk, or CloudWatch to parse logs effectively.
      transport: options.env === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard', // Adds human-readable timestamps
          ignore: 'pid,hostname', // Removes noise from dev logs
        }
      } : undefined,
    });
  }

  /**
   * Log informational messages. Use for tracking normal application flow.
   * @param message - The main log message
   * @param meta - Optional object containing relevant context (e.g., { userId: '123' })
   */
  info(message: string, meta?: object) {
    this.logger.info(meta, message);
  }

  /**
   * Log errors. Use when an operation fails.
   * @param message - Description of what failed
   * @param error - The Error object (stack trace will be serialized automatically)
   * @param meta - Additional context (e.g., input parameters that caused the error)
   */
  error(message: string, error?: Error, meta?: object) {
    // We deliberately explicitly map 'err' to the Error object to ensure 
    // Pino's standard error serializer picks it up.
    this.logger.error({ err: error, ...meta }, message);
  }

  /**
   * Log warnings. Use for non-critical issues that might need attention (e.g., deprecated API usage, retries).
   * @param message - The warning message
   * @param meta - Context data
   */
  warn(message: string, meta?: object) {
    this.logger.warn(meta, message);
  }

  /**
   * Log debug information. Use for verbose tracing during development.
   * These logs are typically suppressed in production to save storage/costs.
   * @param message - The debug message
   * @param meta - Detailed state data
   */
  debug(message: string, meta?: object) {
    this.logger.debug(meta, message);
  }
}

/**
 * Factory function to create a pre-configured Logger instance.
 * 
 * Automatically detects the environment from `process.env.NODE_ENV`.
 * 
 * @example
 * const logger = createLogger('user-service');
 * logger.info('User logged in', { userId: 'u-123' });
 * 
 * @param serviceName - Unique identifier for the service
 */
export const createLogger = (serviceName: string) => {
  const env = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
  return new Logger({ env, serviceName });
};
