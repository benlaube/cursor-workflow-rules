/**
 * Zod schemas for runtime validation of logger configuration.
 */

import { z } from 'zod';

export const LogLevelSchema = z.enum([
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
  'user_action',
  'notice',
  'success',
  'failure',
]);

export const RuntimeSchema = z.enum(['node', 'browser', 'edge']);

export const BrowserStorageSchema = z.enum(['localStorage', 'sessionStorage', 'memory']);

export const FileRotationConfigSchema = z.object({
  maxSize: z.string().optional(),
  maxAge: z.string().optional(),
  compress: z.boolean().optional(),
  retention: z.string().optional(),
}).optional();

export const RetryConfigSchema = z.object({
  maxRetries: z.number().int().positive().optional(),
  initialDelay: z.number().int().positive().optional(),
  maxDelay: z.number().int().positive().optional(),
}).optional();

export const LoggerOptionsSchema = z.object({
  env: z.enum(['development', 'production', 'test']),
  serviceName: z.string().min(1),
  runtime: z.union([z.literal('auto'), RuntimeSchema]).optional(),
  
  // Log Levels
  level: LogLevelSchema.optional(),
  consoleLevel: LogLevelSchema.optional(),
  fileLevel: LogLevelSchema.optional(),
  databaseLevel: LogLevelSchema.optional(),
  
  // Handler Configuration
  enableConsole: z.boolean().optional(),
  enableFile: z.boolean().optional(),
  enableDatabase: z.boolean().optional(),
  
  // Console Handler
  consoleFormat: z.enum(['pretty', 'json', 'compact']).optional(),
  
  // File Handler
  logDir: z.string().optional(),
  fileRotation: FileRotationConfigSchema,
  
  // Database Handler
  supabaseClient: z.any().optional(), // SupabaseClient type
  persistLog: z.function().optional(),
  batchSize: z.number().int().positive().optional(),
  flushInterval: z.number().int().positive().optional(),
  maxQueueSize: z.number().int().positive().optional(),
  retryConfig: RetryConfigSchema,
  
  // Security
  piiPatterns: z.array(z.instanceof(RegExp)).optional(),
  scrubFields: z.array(z.string()).optional(),
  sanitizeErrors: z.boolean().optional(),
  
  // Performance
  samplingRate: z.number().int().positive().optional(),
  samplingLevels: z.array(LogLevelSchema).optional(),
  
  // Tracing
  enableTracing: z.boolean().optional(),
  opentelemetryEnabled: z.boolean().optional(),
  
  // Child Logger Defaults
  defaultContext: z.record(z.unknown()).optional(),
  
  // Graceful Shutdown
  shutdownTimeout: z.number().int().positive().optional(),
  
  // Browser-specific
  browserStorage: BrowserStorageSchema.optional(),
  
  // Edge-specific
  edgeOptimized: z.boolean().optional(),

  // Metadata enrichment
  appVersion: z.string().optional(),
  commitSha: z.string().optional(),
  deploymentId: z.string().optional(),
  region: z.string().optional(),
  host: z.string().optional(),
  runtimeVersion: z.string().optional(),
  respectEnvLogLevel: z.boolean().optional(),

  // Observability bridges
  otlpLogExporter: z.function().optional(),
  alertHandler: z.function().optional(),
  metricsHandler: z.function().optional(),

  // Security / PII controls
  safeFieldAllowlist: z.array(z.string()).optional(),
});
