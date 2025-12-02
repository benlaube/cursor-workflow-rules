/**
 * Health check utilities for logger (Node.js only).
 * 
 * Provides health monitoring and status checks for logger handlers.
 */

import { isNode } from '../utils/environment';
import type { DatabaseLogHandler } from '../handlers/database-handler';

export interface LoggerHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  handlers: {
    console: { enabled: boolean; status: 'ok' | 'error' };
    file: { enabled: boolean; status: 'ok' | 'error' | 'unavailable' };
    database: { enabled: boolean; status: 'ok' | 'error' | 'unavailable' };
  };
  metrics?: {
    queueSize?: number;
    lastFlush?: Date;
  };
}

/**
 * Checks the health of the logger system.
 * 
 * @param databaseHandler - Optional database handler to check
 * @returns Health status object
 */
export function checkLoggerHealth(databaseHandler?: DatabaseLogHandler): LoggerHealth {
  const health: LoggerHealth = {
    status: 'healthy',
    handlers: {
      console: { enabled: true, status: 'ok' },
      file: { enabled: isNode(), status: isNode() ? 'ok' : 'unavailable' },
      database: { enabled: !!databaseHandler, status: databaseHandler ? 'ok' : 'unavailable' },
    },
  };

  // Check for any errors
  const hasErrors = Object.values(health.handlers).some(
    h => h.enabled && h.status === 'error'
  );

  if (hasErrors) {
    health.status = 'unhealthy';
  } else if (health.handlers.database.status === 'unavailable' && health.handlers.file.status === 'unavailable') {
    health.status = 'degraded';
  }

  return health;
}

/**
 * Gets a health check endpoint handler (Node.js only).
 * 
 * @param databaseHandler - Optional database handler to check
 * @returns Express/Next.js compatible handler function
 */
export function createHealthCheckHandler(databaseHandler?: DatabaseLogHandler) {
  if (!isNode()) {
    return () => ({ status: 'unavailable', message: 'Health checks only available in Node.js' });
  }

  return () => {
    const health = checkLoggerHealth(databaseHandler);
    return {
      status: health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503,
      body: health,
    };
  };
}

