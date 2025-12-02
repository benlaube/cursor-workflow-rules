/**
 * Logger Module - Public API Exports
 * 
 * Universal logging system with multi-dimensional categorization,
 * context propagation, and multi-destination output.
 */

// Main logger
export { Logger, setupLogger } from './src/logger';

// Types
export type {
  LoggerOptions,
  LogLevel,
  LogEntry,
  LogContext,
  PartialLogContext,
  Runtime,
  BrowserStorage,
  ILogger,
  PerformanceMetrics,
  BusinessEntity,
  FeatureFlags,
  ErrorCategory,
} from './src/types';

// Context management
export {
  setLogContext,
  getLogContext,
  clearLogContext,
  withLogContext,
  withLogContextAsync,
} from './src/context';

// Session management
export {
  getSessionId,
  getSessionLogPath,
  clearSession,
  resetSession,
} from './src/session';

// Tracing
export {
  generateRequestId,
  getOrCreateRequestId,
  getOpenTelemetryTraceId,
  getOpenTelemetrySpanId,
  getOpenTelemetryContext,
} from './src/tracing';

// Helpers
export {
  logWithContext,
  logApiCall,
  createChildLogger,
  serializeError,
  categorizeError,
  fingerprintError,
  getMemoryUsage,
  getEventLoopLag,
  getCpuUsage,
  trackCpuUsage,
  createPerformanceMetrics,
  trackDatabaseQuery,
  trackApiCall,
  trackConnectionPool,
  fingerprintRequest,
  extractRequestHeaders,
  extractResponseHeaders,
  getCacheStatus,
  getRateLimitInfo,
} from './src/helpers';

// Middleware
export {
  createExpressMiddleware,
  createNextJsMiddleware,
  withLogging as withNextJsLogging,
  createFastifyPlugin,
  setupBrowserLogging,
} from './src/middleware';

// Testing utilities
export {
  createMockLogger,
  isMockLogger,
  type MockLogger,
} from './src/testing';

// Utilities
export {
  getRuntime,
  isNode,
  isBrowser,
  isEdge,
  hasFeature,
  getFeatureAvailability,
  getRuntimeDefaults,
} from './src/utils/environment';

// Security utilities
export {
  scrubPII,
  scrubObject,
  DEFAULT_PII_PATTERNS,
  DEFAULT_SCRUB_FIELDS,
  sanitizeError,
  sanitizeStackTrace,
  safeSerialize,
  safeStringify,
} from './src/security';

// Formatters
export {
  formatCategory,
  formatCategoryFromContext,
  getCurrentCategory,
  formatMessage,
  formatLogLevel,
} from './src/formatters';

// Metrics
export {
  recordMetric,
  getMetrics,
  resetMetrics,
  timeOperation,
  timeOperationSync,
  checkLoggerHealth,
  createHealthCheckHandler,
  type PerformanceMetrics,
  type LoggerHealth,
} from './src/metrics';

// Log Viewer
export {
  createLogViewerRouter,
  getAnalyzedLogs,
  getLogFiles,
  getLogFileContent,
  queryDatabaseLogs,
  type LogViewerOptions,
} from './src/viewer';

export {
  createLogViewerRouter as createExpressLogViewer,
} from './src/viewer/express';

export {
  startLogViewer,
  type StandaloneLogViewerOptions,
} from './src/viewer/standalone';
