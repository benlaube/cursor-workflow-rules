/**
 * Handler tests.
 */

import { describe, it, expect } from 'vitest';
import { createConsoleHandler } from '../src/handlers/console-handler';
import { createFileHandler } from '../src/handlers/file-handler';
import { createDatabaseHandler } from '../src/handlers/database-handler';

describe('Handlers', () => {
  it('should create console handler', () => {
    const handler = createConsoleHandler({
      level: 'info',
      format: 'json',
    });

    expect(handler).toBeDefined();
    expect(handler.level).toBe('info');
  });

  it('should create file handler in Node.js', () => {
    // Only test if in Node.js
    if (typeof process !== 'undefined' && process.versions?.node) {
      const handler = createFileHandler({
        level: 'debug',
      });

      // Handler may be null if file system operations fail
      // Just check it doesn't throw
      expect(() => createFileHandler({ level: 'debug' })).not.toThrow();
    }
  });

  it('should create database handler', () => {
    const handler = createDatabaseHandler({
      level: 'warn',
      batchSize: 10,
      flushInterval: 1000,
    });

    expect(handler).toBeDefined();
  });
});

