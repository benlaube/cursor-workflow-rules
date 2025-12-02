/**
 * Express.js middleware for automatic request/response logging.
 */

import type { Request, Response, NextFunction } from 'express';
import type { Logger } from '../logger';
import { setRequestContext, calculateDuration, type RequestInfo } from './base';
import { logApiCall } from '../helpers/log-api-call';
import { getOpenTelemetryTraceId } from '../tracing/opentelemetry';

/**
 * Creates Express middleware for logging requests and responses.
 * 
 * @param logger - Logger instance
 * @returns Express middleware function
 */
export function createExpressMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Get trace ID if available
    const traceId = getOpenTelemetryTraceId();
    
    // Set request context
    const requestInfo: RequestInfo = {
      method: req.method,
      path: req.path,
      url: req.url,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, unknown>,
      body: req.body,
      user: (req as any).user,
    };
    
    setRequestContext(requestInfo, traceId);
    
    // Log request
    logApiCall(
      logger,
      'debug',
      `HTTP Request: ${req.method} ${req.path}`,
      'user',
      req.path,
      req.method,
      {
        query: req.query,
        userAgent: req.get('user-agent'),
      }
    );
    
    // Capture response
    res.on('finish', () => {
      const duration = calculateDuration(startTime);
      
      // Log response
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      
      logApiCall(
        logger,
        level,
        `HTTP Response: ${req.method} ${req.path} | Status: ${res.statusCode} | Duration: ${duration}ms`,
        'user',
        req.path,
        req.method,
        {
          statusCode: res.statusCode,
          duration,
        }
      );
    });
    
    next();
  };
}

