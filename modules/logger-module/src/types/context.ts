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
  
  // Phase 2 Enhancements
  /** Request headers (relevant ones) */
  requestHeaders?: Record<string, string>;
  /** Response headers (relevant ones) */
  responseHeaders?: Record<string, string>;
  /** Request fingerprint for duplicate detection */
  requestFingerprint?: string;
  /** Rate limiting information */
  rateLimitInfo?: {
    limit?: number;
    remaining?: number;
    reset?: number;
    retryAfter?: number;
  };
  /** Cache status information */
  cacheStatus?: {
    hit?: boolean;
    miss?: boolean;
    status: 'hit' | 'miss' | 'unknown';
    cacheControl?: string;
    etag?: string;
  };
}

export type PartialLogContext = Partial<LogContext>;
