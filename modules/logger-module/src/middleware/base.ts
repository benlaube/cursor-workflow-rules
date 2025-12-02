/**
 * Base middleware utilities for HTTP request/response logging.
 * 
 * Provides common functionality for all framework middleware.
 */

import { generateRequestId } from '../tracing/request-id';
import { getOpenTelemetryTraceId } from '../tracing/opentelemetry';
import { setLogContext } from '../context';
import type { LogContext } from '../types/context';
import { createPerformanceMetrics } from '../helpers/performance-tracking';
import {
  fingerprintRequest,
  extractRequestHeaders,
  extractResponseHeaders,
  getCacheStatus,
  getRateLimitInfo,
} from '../helpers/request-tracking';

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
    tenantId?: string;
    orgId?: string;
  };
  /** Client IP address */
  ipAddress?: string;
  /** Request body size in bytes */
  requestSize?: number;
}

export interface ResponseInfo {
  statusCode: number;
  duration: number;
  headers?: Record<string, string>;
  /** Response payload size in bytes */
  responseSize?: number;
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
  
  // Extract relevant request headers
  const requestHeaders = request.headers
    ? extractRequestHeaders(request.headers)
    : undefined;
  
  // Generate request fingerprint
  const requestFingerprint = fingerprintRequest(
    request.method,
    request.path,
    request.headers,
    request.query as Record<string, unknown>
  );
  
  const context: Partial<LogContext> = {
    source: 'user',
    action,
    component: 'backend',
    endpoint: request.path,
    requestId,
    ...(traceId && { traceId }),
    ...(request.user?.id && { userId: request.user.id }),
    ...(request.user?.tenantId && { tenantId: request.user.tenantId }),
    ...(request.user?.orgId && { orgId: request.user.orgId }),
    // Phase 1 Enhancements
    ...(request.ipAddress && { ipAddress: request.ipAddress }),
    ...(request.requestSize !== undefined && { requestSize: request.requestSize }),
    // Phase 2 Enhancements
    ...(requestHeaders && { requestHeaders }),
    ...(requestFingerprint && { requestFingerprint }),
  };
  
  setLogContext(context);
}

/**
 * Updates log context with response information.
 */
export async function updateResponseContext(
  response: ResponseInfo,
  startTime: number
): Promise<void> {
  const duration = calculateDuration(startTime);
  
  // Import dynamically to avoid circular dependency
  const { getLogContext, setLogContext } = await import('../context');
  
  // Get current context
  const currentContext = getLogContext() || {};
  
  // Extract relevant response headers
  const responseHeaders = response.headers
    ? extractResponseHeaders(response.headers)
    : undefined;
  
  // Get cache status
  const cacheStatus = response.headers
    ? getCacheStatus(response.headers)
    : undefined;
  
  // Get rate limit info
  const rateLimitInfo = response.headers
    ? getRateLimitInfo(response.headers)
    : undefined;
  
  // Create performance metrics
  const performanceMetrics = await createPerformanceMetrics(duration);
  
  const context: Partial<LogContext> = {
    ...currentContext,
    ...(response.responseSize !== undefined && { responseSize: response.responseSize }),
    performanceMetrics,
    // Phase 2 Enhancements
    ...(responseHeaders && { responseHeaders }),
    ...(cacheStatus && { cacheStatus }),
    ...(rateLimitInfo && { rateLimitInfo }),
  };
  
  setLogContext(context);
}

/**
 * Calculates response time in milliseconds.
 */
export function calculateDuration(startTime: number): number {
  return Date.now() - startTime;
}
