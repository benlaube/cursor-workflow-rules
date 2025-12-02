/**
 * Logger type definitions.
 */

export type LogLevel = 
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal'
  | 'user_action'
  | 'notice'
  | 'success'
  | 'failure';

/**
 * Performance metrics structure for structured performance tracking.
 */
export interface PerformanceMetrics {
  /** Duration in milliseconds */
  duration?: number;
  /** Memory usage in bytes (Node.js) */
  memory?: {
    heapUsed?: number;
    heapTotal?: number;
    external?: number;
    rss?: number;
  };
  /** CPU usage percentage (if available) */
  cpuUsage?: number;
  /** Event loop lag in milliseconds (Node.js) */
  eventLoopLag?: number;
  /** Database query metrics */
  database?: {
    queryDuration?: number;
    rowCount?: number;
    queryType?: string;
  };
  /** External API call metrics */
  apiCall?: {
    duration?: number;
    retries?: number;
    statusCode?: number;
  };
  /** Queue lengths for async operations */
  queueLength?: number;
  /** Connection pool stats */
  connectionPool?: {
    active?: number;
    idle?: number;
    waiting?: number;
  };
}

/**
 * Business entity tracking structure.
 */
export interface BusinessEntity {
  /** Entity ID (order_id, customer_id, transaction_id, etc.) */
  id: string;
  /** Entity type (order, customer, transaction, etc.) */
  type: string;
}

/**
 * Feature flags structure.
 */
export interface FeatureFlags {
  [flagName: string]: boolean | string | number;
}

/**
 * Error categorization types.
 */
export type ErrorCategory = 
  | 'validation'
  | 'network'
  | 'database'
  | 'business_logic'
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'timeout'
  | 'unknown';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  logger_name: string;
  message: string;
  service?: string;
  env?: string;
  source?: string;
  action?: string;
  component?: string;
  request_id?: string;
  trace_id?: string;
  user_id?: string;
  tenant_id?: string;
  org_id?: string;
  resource_id?: string;
  job_id?: string;
  feature_flag?: string;
  experiment?: string;
  release?: string;
  session_id: string;
  runtime: 'node' | 'browser' | 'edge';
  host?: string;
  region?: string;
  runtime_version?: string;
  app_version?: string;
  commit_sha?: string;
  deployment_id?: string;
  pid?: number;
  thread_id?: number;
  raw_log?: string;
  meta?: Record<string, unknown>;
  
  // Phase 1 Enhancements
  /** Client IP address */
  ip_address?: string;
  /** Request body size in bytes */
  request_size?: number;
  /** Response payload size in bytes */
  response_size?: number;
  /** Error classification category */
  error_category?: ErrorCategory;
  /** Error fingerprint hash for grouping */
  error_fingerprint?: string;
  /** Business entity ID */
  business_entity_id?: string;
  /** Business entity type */
  business_entity_type?: string;
  /** Active feature flags */
  feature_flags?: FeatureFlags;
  /** Structured performance metrics */
  performance_metrics?: PerformanceMetrics;
  /** Correlation ID for cross-service tracing */
  correlation_id?: string;
}
