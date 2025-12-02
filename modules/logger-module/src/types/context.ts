/**
 * Context type definitions for log context propagation.
 */

export interface LogContext {
  source?: string;
  action?: string;
  component?: string;
  endpoint?: string;
  requestId?: string;
  traceId?: string;
}

export type PartialLogContext = Partial<LogContext>;

