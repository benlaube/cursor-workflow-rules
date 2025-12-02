/**
 * Next.js middleware for automatic request/response logging.
 * 
 * Works with both API routes and middleware.
 */

import type { NextRequest, NextResponse } from 'next/server';
import type { Logger } from '../logger';
import { setRequestContext, updateResponseContext, calculateDuration, type RequestInfo, type ResponseInfo } from './base';
import { logApiCall } from '../helpers/log-api-call';
import { getOpenTelemetryTraceId } from '../tracing/opentelemetry';

/**
 * Creates Next.js middleware for logging requests.
 * 
 * @param logger - Logger instance
 * @returns Next.js middleware function
 */
export function createNextJsMiddleware(logger: Logger) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    
    // Get trace ID if available
    const traceId = getOpenTelemetryTraceId();
    
    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.ip;
    
    // Calculate request size (if body is available)
    const contentLength = request.headers.get('content-length');
    const requestSize = contentLength ? parseInt(contentLength, 10) : undefined;
    
    // Set request context
    const requestInfo: RequestInfo = {
      method: request.method,
      path: request.nextUrl.pathname,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      ipAddress,
      requestSize,
    };
    
    setRequestContext(requestInfo, traceId);
    
    // Log request
    logApiCall(
      logger,
      'debug',
      `HTTP Request: ${request.method} ${request.nextUrl.pathname}`,
      'user',
      request.nextUrl.pathname,
      request.method,
      {
        userAgent: request.headers.get('user-agent'),
      }
    );
    
    // Note: Response logging would need to be done in the route handler
    // or using a response interceptor
    return undefined; // Continue to next middleware
  };
}

/**
 * Creates a Next.js API route wrapper for logging.
 * 
 * @param logger - Logger instance
 * @param handler - API route handler
 * @returns Wrapped handler with logging
 */
export function withLogging<T extends NextRequest>(
  logger: Logger,
  handler: (req: T) => Promise<NextResponse>
) {
  return async (req: T): Promise<NextResponse> => {
    const startTime = Date.now();
    
    // Get trace ID if available
    const traceId = getOpenTelemetryTraceId();
    
    // Get IP address
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.ip;
    
    // Calculate request size
    const contentLength = req.headers.get('content-length');
    const requestSize = contentLength ? parseInt(contentLength, 10) : undefined;
    
    // Set request context
    const requestInfo: RequestInfo = {
      method: req.method,
      path: new URL(req.url).pathname,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      ipAddress,
      requestSize,
    };
    
    setRequestContext(requestInfo, traceId);
    
    // Log request
    logApiCall(
      logger,
      'debug',
      `HTTP Request: ${req.method} ${new URL(req.url).pathname}`,
      'user',
      new URL(req.url).pathname,
      req.method
    );
    
    try {
      const response = await handler(req);
      const duration = calculateDuration(startTime);
      
      // Calculate response size (if available)
      const contentLength = response.headers.get('content-length');
      const responseSize = contentLength ? parseInt(contentLength, 10) : undefined;
      
      // Update context with response info
      const responseInfo: ResponseInfo = {
        statusCode: response.status,
        duration,
        headers: Object.fromEntries(response.headers.entries()),
        responseSize,
      };
      
      await updateResponseContext(responseInfo, startTime);
      
      // Log response
      const level = response.status >= 500 ? 'error' : response.status >= 400 ? 'warn' : 'info';
      
      logApiCall(
        logger,
        level,
        `HTTP Response: ${req.method} ${new URL(req.url).pathname} | Status: ${response.status} | Duration: ${duration}ms`,
        'user',
        new URL(req.url).pathname,
        req.method,
        {
          statusCode: response.status,
          duration,
          bytesOut: responseSize,
        }
      );
      
      return response;
    } catch (error) {
      const duration = calculateDuration(startTime);
      
      // Log error
      logApiCall(
        logger,
        'error',
        `HTTP Error: ${req.method} ${new URL(req.url).pathname} | Duration: ${duration}ms`,
        'user',
        new URL(req.url).pathname,
        req.method,
        {
          error: error instanceof Error ? error.message : String(error),
          duration,
        }
      );
      
      throw error;
    }
  };
}

