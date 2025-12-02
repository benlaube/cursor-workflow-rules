/**
 * Context type definitions for log context propagation.
 */

import type { BusinessEntity, FeatureFlags, PerformanceMetrics, ErrorCategory } from './logger';

export interface LogContext {
  source?: string;
  action?: string;
  component?: string;
  endpoint?: string;
  requestId?: string;
  traceId?: string;
  userId?: string;
  tenantId?: string;
  orgId?: string;
  resourceId?: string;
  jobId?: string;
  featureFlag?: string;
  experiment?: string;
  release?: string;
  
  // Phase 1 Enhancements
  /** Client IP address */
  ipAddress?: string;
  /** Request size in bytes */
  requestSize?: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Business entity being tracked */
  businessEntity?: BusinessEntity;
  /** Active feature flags */
  featureFlags?: FeatureFlags;
  /** Performance metrics */
  performanceMetrics?: PerformanceMetrics;
  /** Error category */
  errorCategory?: ErrorCategory;
  /** Error fingerprint */
  errorFingerprint?: string;
  /** Correlation ID for cross-service tracing */
  correlationId?: string;
  /** Context tags for flexible categorization */
  tags?: Record<string, string | number | boolean>;
}

export type PartialLogContext = Partial<LogContext>;
