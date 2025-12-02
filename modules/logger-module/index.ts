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
  withNestedContext,
  withNestedContextAsync,
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
  extractContextFromHeaders,
  injectContextToHeaders,
  extractContextFromMessage,
  injectContextToMessage,
  CONTEXT_HEADERS,
  updateBaseline,
  getBaseline,
  compareToBaseline,
  shouldAlert,
  getAllBaselines,
  clearBaselines,
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

// Audit Handler
export {
  AuditLogHandler,
  createAuditHandler,
  type AuditHandlerOptions,
} from './src/handlers/audit-handler';

// Integrations
export {
  logGraphQLOperation,
  logGraphQLResolver,
  createGraphQLLoggingPlugin,
  type GraphQLOperation,
  type GraphQLResolver,
} from './src/integrations/graphql';

export {
  logGRPCCall,
  createGRPCInterceptor,
  type GRPCCall,
} from './src/integrations/grpc';

export {
  logMessageQueueOperation,
  injectContextToQueueMessage,
  type MessageQueueInfo,
  type MessageQueueOperation,
} from './src/integrations/message-queue';

export {
  logDatabaseQuery,
  type DatabaseQueryInfo,
} from './src/integrations/database-query';

export {
  logCacheOperation,
  type CacheOperationInfo,
  type CacheOperation,
  type CacheResult,
} from './src/integrations/cache';

export {
  logWebSocketOperation,
  type WebSocketInfo,
  type WebSocketOperation,
} from './src/integrations/websocket';

// Performance Baselines
export type {
  PerformanceBaseline,
  PerformanceComparison,
} from './src/helpers/performance-baselines';

// Error Correlation
export {
  linkError,
  getErrorCorrelation,
  calculateErrorImpact,
  getAllErrorCorrelations,
  clearErrorCorrelations,
  type ErrorCorrelation,
  type ErrorImpact,
} from './src/helpers/error-correlation';

// User Context
export {
  parseUserAgent,
  createSessionInfo,
  type UserAgentInfo,
  type SessionInfo,
  type SessionEvent,
} from './src/helpers/user-context';

// Geolocation
export {
  getGeolocation,
  anonymizeIp,
  type GeolocationInfo,
  type PrivacyMode,
} from './src/helpers/geolocation';

// Log Retention
export {
  getRetentionPolicy,
  shouldArchive,
  shouldDelete,
  generateArchiveFilename,
  DEFAULT_RETENTION_POLICIES,
  type RetentionPolicy,
} from './src/helpers/log-retention';
