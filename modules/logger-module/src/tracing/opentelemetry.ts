/**
 * OpenTelemetry integration for distributed tracing.
 * 
 * Provides hooks for integrating with OpenTelemetry trace and span IDs.
 */

/**
 * Gets the current OpenTelemetry trace ID if available.
 * 
 * @returns Trace ID string or undefined
 */
export function getOpenTelemetryTraceId(): string | undefined {
  try {
    // Try to import @opentelemetry/api if available
    const { trace } = require('@opentelemetry/api');
    const span = trace.getActiveSpan();
    
    if (span) {
      const spanContext = span.spanContext();
      return spanContext.traceId;
    }
  } catch {
    // OpenTelemetry not available or not configured
  }
  
  return undefined;
}

/**
 * Gets the current OpenTelemetry span ID if available.
 * 
 * @returns Span ID string or undefined
 */
export function getOpenTelemetrySpanId(): string | undefined {
  try {
    const { trace } = require('@opentelemetry/api');
    const span = trace.getActiveSpan();
    
    if (span) {
      const spanContext = span.spanContext();
      return spanContext.spanId;
    }
  } catch {
    // OpenTelemetry not available or not configured
  }
  
  return undefined;
}

/**
 * Gets both trace ID and span ID from OpenTelemetry if available.
 * 
 * @returns Object with traceId and spanId, or undefined if not available
 */
export function getOpenTelemetryContext(): { traceId: string; spanId: string } | undefined {
  const traceId = getOpenTelemetryTraceId();
  const spanId = getOpenTelemetrySpanId();
  
  if (traceId && spanId) {
    return { traceId, spanId };
  }
  
  return undefined;
}

