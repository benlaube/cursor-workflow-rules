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
  // Get the parent logger's name and create a new logger with merged context
  const pinoLogger = logger.getPinoLogger();
  const parentName = pinoLogger.bindings().name as string || 'unknown';
  
  // Create child logger using Pino's child method
  const childPino = pinoLogger.child(context);
  
  // For now, return a new Logger instance
  // In a full implementation, we'd need to extract options from parent
  // This is a simplified version that creates a new logger with the child Pino instance
  const childLogger = Object.create(logger);
  childLogger.pinoLogger = childPino;
  
  return childLogger;
}
