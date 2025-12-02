/**
 * Logger unit tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupLogger } from '../src/logger';

describe('Logger', () => {
  let logger: ReturnType<typeof setupLogger>;

  beforeEach(() => {
    logger = setupLogger('test-logger', {
      env: 'test',
      serviceName: 'test-service',
      enableFile: false,
      enableDatabase: false,
    });
  });

  it('should create a logger instance', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should log at different levels', () => {
    expect(() => logger.trace('trace message')).not.toThrow();
    expect(() => logger.debug('debug message')).not.toThrow();
    expect(() => logger.info('info message')).not.toThrow();
    expect(() => logger.warn('warn message')).not.toThrow();
    expect(() => logger.error('error message')).not.toThrow();
  });

  it('should log custom levels', () => {
    expect(() => logger.userAction('user action')).not.toThrow();
    expect(() => logger.notice('notice')).not.toThrow();
    expect(() => logger.success('success')).not.toThrow();
    expect(() => logger.failure('failure')).not.toThrow();
  });

  it('should log with metadata', () => {
    expect(() => {
      logger.info('message', { key: 'value' });
    }).not.toThrow();
  });

  it('should log errors', () => {
    const error = new Error('Test error');
    expect(() => {
      logger.error('Error occurred', error);
    }).not.toThrow();
  });
});

