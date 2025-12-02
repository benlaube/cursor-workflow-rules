/**
 * Base middleware utilities for HTTP request/response logging.
 * 
 * Provides common functionality for all framework middleware.
 */

import { generateRequestId } from '../tracing/request-id';
import { getOpenTelemetryTraceId } from '../tracing/opentelemetry';
import { setLogContext } from '../context';
import type { LogContext } from '../types/context';

export interface RequestInfo {
  method: string;
  path: string;
  url?: string;
  headers?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  user?: {
    id: string;
    email?: string;
  };
}

export interface ResponseInfo {
  statusCode: number;
  duration: number;
  headers?: Record<string, string>;
}

/**
 * Determines action category from endpoint path and method.
 */
export function determineAction(path: string, method: string): string {
  const upperMethod = method.toUpperCase();
  
  // Check for common patterns
  if (path.includes('/api/')) {
    if (upperMethod === 'GET') return 'api_query';
    if (upperMethod === 'POST') return 'api_request';
    if (upperMethod === 'PUT' || upperMethod === 'PATCH') return 'api_update';
    if (upperMethod === 'DELETE') return 'api_delete';
  }
  
  // Default action based on method
  const methodActions: Record<string, string> = {
    GET: 'api_query',
    POST: 'api_request',
    PUT: 'api_update',
    PATCH: 'api_update',
    DELETE: 'api_delete',
  };
  
  return methodActions[upperMethod] || 'api_request';
}

/**
 * Sets log context from HTTP request.
 */
export function setRequestContext(
  request: RequestInfo,
  traceId?: string
): void {
  const requestId = generateRequestId();
  const action = determineAction(request.path, request.method);
  
  const context: Partial<LogContext> = {
    source: 'user',
    action,
    component: 'backend',
    endpoint: request.path,
    requestId,
    ...(traceId && { traceId }),
  };
  
  setLogContext(context);
}

/**
 * Calculates response time in milliseconds.
 */
export function calculateDuration(startTime: number): number {
  return Date.now() - startTime;
}

