/**
 * Browser event logging middleware.
 * 
 * Automatically logs browser errors and unhandled promise rejections.
 */

import type { Logger } from '../logger';
import { setLogContext } from '../context';

/**
 * Sets up browser event logging.
 * 
 * @param logger - Logger instance
 */
export function setupBrowserLogging(logger: Logger): void {
  if (typeof window === 'undefined') {
    return; // Not in browser
  }
  
  // Log unhandled errors
  window.addEventListener('error', (event) => {
    setLogContext({
      source: 'system',
      action: 'error',
      component: 'frontend',
    });
    
    logger.error(
      `Unhandled Error: ${event.message}`,
      event.error,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });
  
  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    setLogContext({
      source: 'system',
      action: 'error',
      component: 'frontend',
    });
    
    logger.error(
      `Unhandled Promise Rejection: ${event.reason}`,
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        reason: event.reason,
      }
    );
  });
}

