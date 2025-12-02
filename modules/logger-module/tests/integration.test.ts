/**
 * Integration tests.
 */

import { describe, it, expect } from 'vitest';
import { setupLogger } from '../src/logger';
import { setLogContext, withLogContextAsync } from '../src/context';
import { logWithContext, logApiCall } from '../src/helpers';

describe('Integration Tests', () => {
  it('should log with context propagation', async () => {
    const logger = setupLogger('test', {
      env: 'test',
      serviceName: 'test',
      enableFile: false,
      enableDatabase: false,
    });

    await withLogContextAsync(
      { source: 'user', action: 'test', component: 'backend' },
      async () => {
        logger.info('Test message');
        // Context should be available
        const context = require('../src/context').getLogContext();
        expect(context?.source).toBe('user');
      }
    );
  });

  it('should use helper functions', () => {
    const logger = setupLogger('test', {
      env: 'test',
      serviceName: 'test',
      enableFile: false,
      enableDatabase: false,
    });

    expect(() => {
      logWithContext(logger, 'info', 'Test', 'user', 'test', 'backend');
    }).not.toThrow();

    expect(() => {
      logApiCall(logger, 'debug', 'API call', 'api', '/api/test', 'GET');
    }).not.toThrow();
  });
});

