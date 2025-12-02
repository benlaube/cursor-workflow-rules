/**
 * Mock logger creation for testing.
 * 
 * Provides a mock logger implementation compatible with Vitest
 * for use in the testing-module.
 */

import { vi } from 'vitest';
import type { Logger } from '../logger';
import type { LogLevel } from '../types/logger';

/**
 * Mock logger interface matching the Logger class.
 */
export interface MockLogger {
  trace: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  fatal: ReturnType<typeof vi.fn>;
  userAction: ReturnType<typeof vi.fn>;
  notice: ReturnType<typeof vi.fn>;
  success: ReturnType<typeof vi.fn>;
  failure: ReturnType<typeof vi.fn>;
  child: ReturnType<typeof vi.fn>;
  getPinoLogger: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock logger for testing.
 * 
 * @returns Mock logger instance with Vitest mock functions
 * 
 * @example
 * ```typescript
 * const mockLogger = createMockLogger();
 * const service = new UserService(mockLogger);
 * 
 * service.login('user-1');
 * 
 * expect(mockLogger.info).toHaveBeenCalledWith('User logged in');
 * ```
 */
export function createMockLogger(): MockLogger {
  return {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    userAction: vi.fn(),
    notice: vi.fn(),
    success: vi.fn(),
    failure: vi.fn(),
    child: vi.fn().mockReturnThis(),
    getPinoLogger: vi.fn().mockReturnValue({}),
  };
}

/**
 * Type guard to check if a logger is a mock logger.
 */
export function isMockLogger(logger: Logger | MockLogger): logger is MockLogger {
  return typeof (logger as MockLogger).trace === 'function' &&
         vi.isMockFunction((logger as MockLogger).trace);
}

