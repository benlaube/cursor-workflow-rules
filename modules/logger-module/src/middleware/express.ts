/**
 * Express.js middleware for automatic request/response logging.
 */

import type { Request, Response, NextFunction } from 'express';
import type { Logger } from '../logger';
import { setRequestContext, updateResponseContext, calculateDuration, type RequestInfo, type ResponseInfo } from './base';
import { logApiCall } from '../helpers/log-api-call';
import { getOpenTelemetryTraceId } from '../tracing/opentelemetry';
import { setLogContext } from '../context';

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
    
    // Calculate request size
    const requestSize = req.get('content-length') 
      ? parseInt(req.get('content-length') || '0', 10) 
      : req.body 
        ? JSON.stringify(req.body).length 
        : undefined;
    
    // Get IP address (check various headers for proxies)
    const ipAddress = req.ip || 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      (req.socket?.remoteAddress);
    
    // Set request context
    const requestInfo: RequestInfo = {
      method: req.method,
      path: req.path,
      url: req.url,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, unknown>,
      body: req.body,
      user: (req as any).user,
      ipAddress,
      requestSize,
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
        ip: req.ip || (req.socket && req.socket.remoteAddress),
        referrer: req.get('referer'),
        bytesIn: req.get('content-length') ? Number(req.get('content-length')) : undefined,
      }
    );
    
    // Capture response
    res.on('finish', async () => {
      const duration = calculateDuration(startTime);
      
      // Calculate response size
      const contentLength = res.getHeader('content-length');
      const responseSize = contentLength 
        ? parseInt(String(contentLength), 10) 
        : undefined;
      
      // Update context with response info
      const responseInfo: ResponseInfo = {
        statusCode: res.statusCode,
        duration,
        headers: res.getHeaders() as Record<string, string>,
        responseSize,
      };
      
      await updateResponseContext(responseInfo, startTime);
      
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
          bytesOut: responseSize,
        }
      );
    });
    
    next();
  };
}
