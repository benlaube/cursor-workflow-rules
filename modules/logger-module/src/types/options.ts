/**
 * Logger configuration options type definitions.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { LogLevel } from './logger';
import type { LogContext } from './context';
import type { Runtime, BrowserStorage } from './runtime';
import type { LogEntry } from './logger';

export interface FileRotationConfig {
  maxSize?: string; // e.g., '100MB'
  maxAge?: string; // e.g., '30d'
  compress?: boolean; // Default: true
  retention?: string; // e.g., '90d'
}

export interface RetryConfig {
  maxRetries?: number; // Default: 3
  initialDelay?: number; // Default: 1000ms
  maxDelay?: number; // Default: 30000ms
}

export interface LoggerOptions {
  env: 'development' | 'production' | 'test';
  serviceName: string;
  runtime?: 'auto' | Runtime; // Auto-detect if not specified
  
  // Log Levels (per destination)
  level?: LogLevel; // Default level
  consoleLevel?: LogLevel; // Separate level for console (default: INFO in prod, DEBUG in dev)
  fileLevel?: LogLevel; // Separate level for file (default: DEBUG, Node.js only)
  databaseLevel?: LogLevel; // Separate level for database (default: WARN)
  
  // Handler Configuration
  enableConsole?: boolean; // Default: true (all environments)
  enableFile?: boolean; // Default: true in Node.js, false in browser/edge
  enableDatabase?: boolean; // Default: false (opt-in, all environments)
  
  // Console Handler
  consoleFormat?: 'pretty' | 'json' | 'compact'; // Default: 'pretty' in dev, 'json' in prod
  // Note: 'pretty' only available in Node.js, falls back to 'json' in browser/edge
  
  // File Handler (Node.js only)
  logDir?: string; // Custom log directory (default: './logs', Node.js only)
  fileRotation?: FileRotationConfig;
  
  // Database Handler (Universal)
  supabaseClient?: SupabaseClient; // For Supabase integration
  persistLog?: (logEntry: LogEntry) => Promise<void>; // Generic callback
  batchSize?: number; // Database batch size (default: 50, smaller in edge: 25)
  flushInterval?: number; // Database flush interval in ms (default: 5000, faster in edge: 2000)
  maxQueueSize?: number; // Max queue size before backpressure (default: 1000, smaller in edge: 100)
  retryConfig?: RetryConfig;
  
  // Security
  piiPatterns?: RegExp[]; // Custom PII detection patterns
  scrubFields?: string[]; // Field names to automatically scrub
  sanitizeErrors?: boolean; // Sanitize stack traces in production (default: true)
  
  // Performance
  samplingRate?: number; // Sample 1 in N logs for high-volume scenarios (default: 1 = no sampling)
  samplingLevels?: LogLevel[]; // Levels to apply sampling to (default: ['debug', 'trace'])
  
  // Tracing
  enableTracing?: boolean; // Enable request/trace IDs (default: true)
  opentelemetryEnabled?: boolean; // Enable OpenTelemetry integration (default: false)
  
  // Child Logger Defaults
  defaultContext?: Partial<LogContext>; // Default context for all logs
  
  // Graceful Shutdown (Node.js only)
  shutdownTimeout?: number; // Timeout for graceful shutdown in ms (default: 5000)
  
  // Browser-specific
  browserStorage?: BrowserStorage; // Where to store session ID (default: 'localStorage')
  
  // Edge-specific
  edgeOptimized?: boolean; // Use smaller batches, faster flush for edge (default: true in edge runtime)

  // Metadata enrichment
  appVersion?: string; // Application/package version
  commitSha?: string; // Git commit SHA
  deploymentId?: string; // Deployment identifier (CI/CD run, release id)
  region?: string; // Region/zone identifier
  host?: string; // Hostname/instance id
  runtimeVersion?: string; // Runtime version (Node.js, browser UA, edge runtime)
  respectEnvLogLevel?: boolean; // If true, honors LOG_LEVEL env override (default: true in Node)

  // Observability bridges
  otlpLogExporter?: (logEntry: LogEntry & { resource?: Record<string, unknown> }) => Promise<void> | void;
  alertHandler?: (logEntry: LogEntry) => Promise<void> | void; // High severity sink (PagerDuty/webhook)
  metricsHandler?: (logEntry: LogEntry) => Promise<void> | void; // Optional metrics correlation hook

  // Security / PII controls
  safeFieldAllowlist?: string[]; // Only allow listed metadata fields; scrub others
}
