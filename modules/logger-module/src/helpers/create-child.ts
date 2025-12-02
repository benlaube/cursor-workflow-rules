/**
 * Child logger creation helper.
 * 
 * Creates child loggers with inherited context and additional bindings.
 */

import type { Logger } from '../logger';
import type { PartialLogContext } from '../types/context';
import { setupLogger } from '../logger';
import type { LoggerOptions } from '../types/options';

/**
 * Creates a child logger with additional context.
 * 
 * Note: This is a simplified implementation. For full child logger support,
 * the Logger class would need to expose its options and Pino logger configuration.
 * 
 * @param logger - Parent logger instance
 * @param context - Additional context to bind to child logger
 * @returns Child logger instance
 */
export function createChildLogger(
  logger: Logger,
  context: PartialLogContext & Record<string, unknown>
): Logger {
  return logger.child(context, context);
}
