/**
 * Context propagation utilities for cross-service tracing.
 * 
 * Provides helpers for propagating log context across service boundaries
 * via HTTP headers, message queues, and other communication mechanisms.
 */

import type { LogContext } from '../types/context';

/**
 * Standard header names for context propagation.
 */
export const CONTEXT_HEADERS = {
  REQUEST_ID: 'x-request-id',
  TRACE_ID: 'x-trace-id',
  CORRELATION_ID: 'x-correlation-id',
  USER_ID: 'x-user-id',
  TENANT_ID: 'x-tenant-id',
  SESSION_ID: 'x-session-id',
  SOURCE: 'x-log-source',
  ACTION: 'x-log-action',
  COMPONENT: 'x-log-component',
  FEATURE_FLAGS: 'x-feature-flags',
  TAGS: 'x-log-tags',
} as const;

/**
 * Extracts log context from HTTP headers.
 * 
 * @param headers - HTTP headers object
 * @returns Partial log context extracted from headers
 * 
 * @example
 * const context = extractContextFromHeaders(req.headers);
 * setLogContext(context);
 */
export function extractContextFromHeaders(
  headers: Record<string, string | string[] | undefined>
): Partial<LogContext> {
  const getHeader = (key: string): string | undefined => {
    const lowerKey = key.toLowerCase();
    const value = headers[lowerKey] || headers[key];
    return value ? String(Array.isArray(value) ? value[0] : value) : undefined;
  };
  
  const context: Partial<LogContext> = {};
  
  // Extract standard context fields
  const requestId = getHeader(CONTEXT_HEADERS.REQUEST_ID);
  if (requestId) context.requestId = requestId;
  
  const traceId = getHeader(CONTEXT_HEADERS.TRACE_ID);
  if (traceId) context.traceId = traceId;
  
  const correlationId = getHeader(CONTEXT_HEADERS.CORRELATION_ID);
  if (correlationId) context.correlationId = correlationId;
  
  const userId = getHeader(CONTEXT_HEADERS.USER_ID);
  if (userId) context.userId = userId;
  
  const tenantId = getHeader(CONTEXT_HEADERS.TENANT_ID);
  if (tenantId) context.tenantId = tenantId;
  
  const source = getHeader(CONTEXT_HEADERS.SOURCE);
  if (source) context.source = source;
  
  const action = getHeader(CONTEXT_HEADERS.ACTION);
  if (action) context.action = action;
  
  const component = getHeader(CONTEXT_HEADERS.COMPONENT);
  if (component) context.component = component;
  
  // Extract feature flags (JSON)
  const featureFlags = getHeader(CONTEXT_HEADERS.FEATURE_FLAGS);
  if (featureFlags) {
    try {
      context.featureFlags = JSON.parse(featureFlags);
    } catch {
      // Invalid JSON, skip
    }
  }
  
  // Extract tags (JSON)
  const tags = getHeader(CONTEXT_HEADERS.TAGS);
  if (tags) {
    try {
      context.tags = JSON.parse(tags);
    } catch {
      // Invalid JSON, skip
    }
  }
  
  return context;
}

/**
 * Injects log context into HTTP headers.
 * 
 * @param context - Log context to inject
 * @param headers - Headers object to modify (mutated)
 * @returns Headers object with context injected
 * 
 * @example
 * const headers = {};
 * injectContextToHeaders(context, headers);
 * fetch(url, { headers });
 */
export function injectContextToHeaders(
  context: Partial<LogContext>,
  headers: Record<string, string> = {}
): Record<string, string> {
  if (context.requestId) {
    headers[CONTEXT_HEADERS.REQUEST_ID] = context.requestId;
  }
  
  if (context.traceId) {
    headers[CONTEXT_HEADERS.TRACE_ID] = context.traceId;
  }
  
  if (context.correlationId) {
    headers[CONTEXT_HEADERS.CORRELATION_ID] = context.correlationId;
  }
  
  if (context.userId) {
    headers[CONTEXT_HEADERS.USER_ID] = context.userId;
  }
  
  if (context.tenantId) {
    headers[CONTEXT_HEADERS.TENANT_ID] = context.tenantId;
  }
  
  if (context.source) {
    headers[CONTEXT_HEADERS.SOURCE] = context.source;
  }
  
  if (context.action) {
    headers[CONTEXT_HEADERS.ACTION] = context.action;
  }
  
  if (context.component) {
    headers[CONTEXT_HEADERS.COMPONENT] = context.component;
  }
  
  if (context.featureFlags) {
    try {
      headers[CONTEXT_HEADERS.FEATURE_FLAGS] = JSON.stringify(context.featureFlags);
    } catch {
      // Skip if can't stringify
    }
  }
  
  if (context.tags) {
    try {
      headers[CONTEXT_HEADERS.TAGS] = JSON.stringify(context.tags);
    } catch {
      // Skip if can't stringify
    }
  }
  
  return headers;
}

/**
 * Extracts log context from message queue message metadata.
 * 
 * @param metadata - Message metadata/attributes
 * @returns Partial log context extracted from metadata
 * 
 * @example
 * const context = extractContextFromMessage(rabbitmqMessage.properties.headers);
 * setLogContext(context);
 */
export function extractContextFromMessage(
  metadata: Record<string, unknown>
): Partial<LogContext> {
  const context: Partial<LogContext> = {};
  
  if (typeof metadata[CONTEXT_HEADERS.REQUEST_ID] === 'string') {
    context.requestId = metadata[CONTEXT_HEADERS.REQUEST_ID];
  }
  
  if (typeof metadata[CONTEXT_HEADERS.TRACE_ID] === 'string') {
    context.traceId = metadata[CONTEXT_HEADERS.TRACE_ID];
  }
  
  if (typeof metadata[CONTEXT_HEADERS.CORRELATION_ID] === 'string') {
    context.correlationId = metadata[CONTEXT_HEADERS.CORRELATION_ID];
  }
  
  if (typeof metadata[CONTEXT_HEADERS.USER_ID] === 'string') {
    context.userId = metadata[CONTEXT_HEADERS.USER_ID];
  }
  
  if (typeof metadata[CONTEXT_HEADERS.TENANT_ID] === 'string') {
    context.tenantId = metadata[CONTEXT_HEADERS.TENANT_ID];
  }
  
  if (typeof metadata[CONTEXT_HEADERS.SOURCE] === 'string') {
    context.source = metadata[CONTEXT_HEADERS.SOURCE];
  }
  
  if (typeof metadata[CONTEXT_HEADERS.ACTION] === 'string') {
    context.action = metadata[CONTEXT_HEADERS.ACTION];
  }
  
  if (typeof metadata[CONTEXT_HEADERS.COMPONENT] === 'string') {
    context.component = metadata[CONTEXT_HEADERS.COMPONENT];
  }
  
  if (metadata[CONTEXT_HEADERS.FEATURE_FLAGS]) {
    context.featureFlags = metadata[CONTEXT_HEADERS.FEATURE_FLAGS] as Record<string, unknown>;
  }
  
  if (metadata[CONTEXT_HEADERS.TAGS]) {
    context.tags = metadata[CONTEXT_HEADERS.TAGS] as Record<string, string | number | boolean>;
  }
  
  return context;
}

/**
 * Injects log context into message queue message metadata.
 * 
 * @param context - Log context to inject
 * @param metadata - Metadata object to modify (mutated)
 * @returns Metadata object with context injected
 * 
 * @example
 * const metadata = {};
 * injectContextToMessage(context, metadata);
 * rabbitmqChannel.publish(exchange, routingKey, content, { headers: metadata });
 */
export function injectContextToMessage(
  context: Partial<LogContext>,
  metadata: Record<string, unknown> = {}
): Record<string, unknown> {
  if (context.requestId) {
    metadata[CONTEXT_HEADERS.REQUEST_ID] = context.requestId;
  }
  
  if (context.traceId) {
    metadata[CONTEXT_HEADERS.TRACE_ID] = context.traceId;
  }
  
  if (context.correlationId) {
    metadata[CONTEXT_HEADERS.CORRELATION_ID] = context.correlationId;
  }
  
  if (context.userId) {
    metadata[CONTEXT_HEADERS.USER_ID] = context.userId;
  }
  
  if (context.tenantId) {
    metadata[CONTEXT_HEADERS.TENANT_ID] = context.tenantId;
  }
  
  if (context.source) {
    metadata[CONTEXT_HEADERS.SOURCE] = context.source;
  }
  
  if (context.action) {
    metadata[CONTEXT_HEADERS.ACTION] = context.action;
  }
  
  if (context.component) {
    metadata[CONTEXT_HEADERS.COMPONENT] = context.component;
  }
  
  if (context.featureFlags) {
    metadata[CONTEXT_HEADERS.FEATURE_FLAGS] = context.featureFlags;
  }
  
  if (context.tags) {
    metadata[CONTEXT_HEADERS.TAGS] = context.tags;
  }
  
  return metadata;
}

