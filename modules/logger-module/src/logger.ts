/**
 * Main Logger class with Pino integration and universal runtime support.
 * 
 * Provides structured logging with multi-dimensional categorization,
 * context propagation, and multi-destination output.
 */

import pino from 'pino';
import {
  getRuntime,
  getRuntimeDefaults,
  getHostName,
  getRegion,
  getRuntimeVersionString,
  getProcessIdentifiers,
  getDeploymentId,
  getPackageVersion,
} from './utils/environment';
import { getSessionId } from './session';
import { getLogContext, setLogContext } from './context';
import { formatCategoryFromContext } from './formatters';
import { getOrCreateRequestId } from './tracing/request-id';
import { getOpenTelemetryTraceId } from './tracing/opentelemetry';
import { scrubObject, DEFAULT_SCRUB_FIELDS } from './security/pii-scrubber';
import { serializeError } from './helpers/serialize-error';
import { categorizeError, fingerprintError } from './helpers/error-categorization';
import { createConsoleHandler } from './handlers/console-handler';
import { createFileHandler } from './handlers/file-handler';
import { createDatabaseHandler, DatabaseLogHandler } from './handlers/database-handler';
import type { LoggerOptions, LogLevel } from './types/options';
import type { ILogger } from './types/logger-interface';
import type { LogContext, PartialLogContext } from './types/context';
import { LoggerOptionsSchema } from './types/schemas';

/**
 * Custom log levels matching Python logger.
 */
const CUSTOM_LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  user_action: 25, // Between debug and info
  notice: 35, // Between info and warn
  success: 32, // Between info and notice
  failure: 45, // Between warn and error
};

type LoggerDependencies = {
  pinoLogger?: pino.Logger;
  databaseHandler?: DatabaseLogHandler;
  inheritedContext?: PartialLogContext;
};

type LoggerStats = {
  sampledOut: number;
  droppedFromQueue: number;
  flushErrors: number;
};

/**
 * Main Logger class.
 * 
 * Implements ILogger interface for dependency injection and type safety.
 */
export class Logger implements ILogger {
  private pinoLogger: pino.Logger;
  private options: LoggerOptions & {
    supabaseClient?: LoggerOptions['supabaseClient'];
    persistLog?: LoggerOptions['persistLog'];
    piiPatterns: RegExp[];
    scrubFields: string[];
    defaultContext?: LogContext;
  };
  private runtime: 'node' | 'browser' | 'edge';
  private sessionId: string;
  private databaseHandler?: DatabaseLogHandler;
  private stats: LoggerStats = { sampledOut: 0, droppedFromQueue: 0, flushErrors: 0 };
  private allowlistedFieldsLower?: string[];

  constructor(name: string, options: LoggerOptions, dependencies: LoggerDependencies = {}) {
    const validated = LoggerOptionsSchema.parse(options);
    
    this.runtime = validated.runtime === 'auto' || !validated.runtime
      ? getRuntime()
      : validated.runtime;
    
    const defaults = getRuntimeDefaults();
    const respectEnvLogLevel = validated.respectEnvLogLevel ?? (this.runtime === 'node');
    const envLogLevel = this.getEnvLogLevel(respectEnvLogLevel);
    const defaultLevel = validated.level || (validated.env === 'production' ? 'info' : 'debug');
    const resolvedLevel = envLogLevel || defaultLevel;
    
    const mergedDefaultContext = {
      ...(validated.defaultContext || {}),
      ...(dependencies.inheritedContext || {}),
    };
    
    this.options = {
      ...defaults,
      ...validated,
      runtime: this.runtime,
      piiPatterns: validated.piiPatterns || [],
      scrubFields: validated.scrubFields || DEFAULT_SCRUB_FIELDS,
      defaultContext: mergedDefaultContext,
      level: resolvedLevel,
      consoleLevel: envLogLevel || validated.consoleLevel || (validated.env === 'production' ? 'info' : 'debug'),
      fileLevel: validated.fileLevel || 'debug',
      databaseLevel: validated.databaseLevel || 'warn',
      enableConsole: validated.enableConsole ?? true,
      enableFile: validated.enableFile ?? (this.runtime === 'node'),
      enableDatabase: validated.enableDatabase ?? false,
      consoleFormat: validated.consoleFormat || defaults.consoleFormat,
      logDir: validated.logDir || './logs',
      batchSize: validated.batchSize || defaults.batchSize,
      flushInterval: validated.flushInterval || defaults.flushInterval,
      maxQueueSize: validated.maxQueueSize || defaults.maxQueueSize,
      retryConfig: validated.retryConfig || { maxRetries: 3, initialDelay: 1000, maxDelay: 30000 },
      sanitizeErrors: validated.sanitizeErrors ?? (validated.env === 'production'),
      samplingRate: validated.samplingRate || 1,
      samplingLevels: validated.samplingLevels || ['debug', 'trace'],
      enableTracing: validated.enableTracing ?? true,
      opentelemetryEnabled: validated.opentelemetryEnabled ?? false,
      shutdownTimeout: validated.shutdownTimeout || 5000,
      browserStorage: validated.browserStorage || 'localStorage',
      edgeOptimized: validated.edgeOptimized ?? (this.runtime === 'edge'),
      respectEnvLogLevel,
      appVersion: validated.appVersion || getPackageVersion(),
      commitSha: validated.commitSha || (typeof process !== 'undefined'
        ? (
          process.env.GIT_COMMIT ||
          process.env.GIT_SHA ||
          process.env.COMMIT_SHA ||
          process.env.RENDER_GIT_COMMIT ||
          process.env.VERCEL_GIT_COMMIT_SHA
        )
        : undefined),
      deploymentId: validated.deploymentId || getDeploymentId(),
      region: validated.region || getRegion(),
      host: validated.host || getHostName(),
      runtimeVersion: validated.runtimeVersion || getRuntimeVersionString() || this.runtime,
    };
    
    this.allowlistedFieldsLower = this.options.safeFieldAllowlist?.map(field => field.toLowerCase());
    this.sessionId = getSessionId(this.options.browserStorage);
    
    this.pinoLogger = dependencies.pinoLogger ?? this.createPinoLogger(name);
    
    if (dependencies.databaseHandler) {
      this.databaseHandler = dependencies.databaseHandler;
    } else if (this.options.enableDatabase) {
      this.databaseHandler = createDatabaseHandler({
        level: this.options.databaseLevel || 'warn',
        supabaseClient: this.options.supabaseClient,
        persistLog: this.options.persistLog,
        batchSize: this.options.batchSize,
        flushInterval: this.options.flushInterval,
        maxQueueSize: this.options.maxQueueSize,
        retryConfig: this.options.retryConfig,
        onQueueDrop: () => this.stats.droppedFromQueue++,
        onFlushError: () => this.stats.flushErrors++,
      });
    }
  }

  /**
   * Creates the underlying Pino logger instance with handlers.
   */
  private createPinoLogger(name: string): pino.Logger {
    const level = this.options.level;
    
    // Collect streams for multi-destination logging
    const streams: pino.StreamEntry[] = [];
    
    // Console handler
    if (this.options.enableConsole) {
      const consoleStream = createConsoleHandler({
        level: this.options.consoleLevel || level,
        format: this.options.consoleFormat,
      });
      streams.push(consoleStream);
    }
    
    // File handler (Node.js only)
    if (this.options.enableFile && this.runtime === 'node') {
      const fileStream = createFileHandler({
        level: this.options.fileLevel || 'debug',
        logDir: this.options.logDir,
        rotation: this.options.fileRotation,
      });
      if (fileStream) {
        streams.push(fileStream);
      }
    }
    
    // Base Pino configuration
    const pinoConfig: pino.LoggerOptions = {
      name,
      level,
      customLevels: CUSTOM_LEVELS,
      useOnlyCustomLevels: false,
    };
    
    // Add formatters and serializers
    pinoConfig.formatters = {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    };
    
    pinoConfig.serializers = {
      err: (err) => serializeError(err, this.options.sanitizeErrors),
    };
    
    // Create logger with multiple streams
    if (streams.length > 1) {
      return pino(pinoConfig, pino.multistream(streams));
    } else if (streams.length === 1) {
      return pino(pinoConfig, streams[0].stream);
    } else {
      // Fallback: create logger without streams (shouldn't happen)
      return pino(pinoConfig);
    }
  }

  /**
   * Resolves log level from environment variables when allowed.
   */
  private getEnvLogLevel(respectEnv: boolean): LogLevel | undefined {
    if (!respectEnv || typeof process === 'undefined') {
      return undefined;
    }
    
    const envLevel = process.env.LOG_LEVEL || process.env.LOGLEVEL;
    if (envLevel && (CUSTOM_LEVELS as Record<string, number>)[envLevel]) {
      return envLevel as LogLevel;
    }
    
    return undefined;
  }

  /**
   * Checks if a log level should be sampled.
   */
  private shouldSample(level: LogLevel): boolean {
    if (this.options.samplingRate <= 1) {
      return true; // No sampling
    }
    
    if (!this.options.samplingLevels.includes(level)) {
      return true; // Level not in sampling list
    }
    
    // Sample 1 in N logs
    const keep = Math.random() * this.options.samplingRate < 1;
    if (!keep) {
      this.stats.sampledOut += 1;
    }
    return keep;
  }

  /**
   * Applies an allowlist to metadata fields when configured.
   */
  private applyAllowlist(meta: Record<string, unknown>): Record<string, unknown> {
    if (!this.allowlistedFieldsLower || this.allowlistedFieldsLower.length === 0) {
      return meta;
    }
    
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta)) {
      const keyLower = key.toLowerCase();
      if (this.allowlistedFieldsLower.includes(keyLower)) {
        filtered[key] = value;
      } else {
        filtered[key] = '[REDACTED]';
      }
    }
    return filtered;
  }

  /**
   * Gets the current log context with defaults merged.
   */
  private getContext(): LogContext {
    const context = getLogContext() || {};
    const defaultContext = this.options.defaultContext || {};
    
    return {
      ...defaultContext,
      ...context,
    };
  }

  /**
   * Formats log metadata with context and security scrubbing.
   */
  private formatMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    const context = this.getContext();
    const { pid, threadId } = getProcessIdentifiers();
    const metadata: Record<string, unknown> = {
      session_id: this.sessionId,
      runtime: this.runtime,
      env: this.options.env,
      service: this.options.serviceName,
      app_version: this.options.appVersion,
      commit_sha: this.options.commitSha,
      deployment_id: this.options.deploymentId,
      region: this.options.region,
      host: this.options.host,
      runtime_version: this.options.runtimeVersion,
      pid,
      thread_id: threadId,
    };
    
    // Add context
    if (context.source) metadata.source = context.source;
    if (context.action) metadata.action = context.action;
    if (context.component) metadata.component = context.component;
    if (context.endpoint) metadata.endpoint = context.endpoint;
    if (context.userId) metadata.user_id = context.userId;
    if (context.tenantId) metadata.tenant_id = context.tenantId;
    if (context.orgId) metadata.org_id = context.orgId;
    if (context.resourceId) metadata.resource_id = context.resourceId;
    if (context.jobId) metadata.job_id = context.jobId;
    if (context.featureFlag) metadata.feature_flag = context.featureFlag;
    if (context.experiment) metadata.experiment = context.experiment;
    if (context.release) metadata.release = context.release;
    
    // Phase 1 Enhancements: Add new context fields
    if (context.ipAddress) metadata.ip_address = context.ipAddress;
    if (context.requestSize !== undefined) metadata.request_size = context.requestSize;
    if (context.responseSize !== undefined) metadata.response_size = context.responseSize;
    if (context.businessEntity) {
      metadata.business_entity_id = context.businessEntity.id;
      metadata.business_entity_type = context.businessEntity.type;
    }
    if (context.featureFlags) metadata.feature_flags = context.featureFlags;
    if (context.performanceMetrics) metadata.performance_metrics = context.performanceMetrics;
    if (context.errorCategory) metadata.error_category = context.errorCategory;
    if (context.errorFingerprint) metadata.error_fingerprint = context.errorFingerprint;
    if (context.correlationId) metadata.correlation_id = context.correlationId;
    if (context.tags) {
      // Merge tags into metadata
      Object.assign(metadata, Object.fromEntries(
        Object.entries(context.tags).map(([k, v]) => [`tag_${k}`, v])
      ));
    }
    
    // Phase 2 Enhancements: Add enhanced request/response tracking
    if (context.requestHeaders) metadata.request_headers = context.requestHeaders;
    if (context.responseHeaders) metadata.response_headers = context.responseHeaders;
    if (context.requestFingerprint) metadata.request_fingerprint = context.requestFingerprint;
    if (context.rateLimitInfo) metadata.rate_limit_info = context.rateLimitInfo;
    if (context.cacheStatus) metadata.cache_status = context.cacheStatus;
    
    // Add tracing
    if (this.options.enableTracing) {
      const requestId = context.requestId || getOrCreateRequestId();
      if (requestId) metadata.request_id = requestId;
      
      const traceId = context.traceId || 
        (this.options.opentelemetryEnabled ? getOpenTelemetryTraceId() : undefined);
      if (traceId) metadata.trace_id = traceId;
    }
    
    // Add custom metadata
    if (meta) {
      // Scrub sensitive data
      const scrubbed = scrubObject(
        meta,
        this.options.piiPatterns,
        this.options.scrubFields
      ) as Record<string, unknown>;
      const filtered = this.applyAllowlist(scrubbed);
      Object.assign(metadata, filtered);
      
      // Normalize actor identifiers from meta when not already present
      const candidateMeta = filtered as Record<string, unknown>;
      const aliasMap: Array<[string, string]> = [
        ['userId', 'user_id'],
        ['user_id', 'user_id'],
        ['tenantId', 'tenant_id'],
        ['tenant_id', 'tenant_id'],
        ['orgId', 'org_id'],
        ['org_id', 'org_id'],
        ['resourceId', 'resource_id'],
        ['resource_id', 'resource_id'],
        ['jobId', 'job_id'],
        ['job_id', 'job_id'],
      ];
      
      for (const [candidateKey, targetKey] of aliasMap) {
        const value = (candidateMeta as any)?.[candidateKey];
        if (value !== undefined && metadata[targetKey] === undefined) {
          metadata[targetKey] = value;
        }
      }
    }
    
    // Remove undefined entries for cleaner logs
    for (const key of Object.keys(metadata)) {
      if (metadata[key] === undefined) {
        delete metadata[key];
      }
    }
    
    return metadata;
  }

  /**
   * Logs a message at the specified level.
   */
  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    // Check sampling
    if (!this.shouldSample(level)) {
      return;
    }
    
    // Format message with category
    const category = formatCategoryFromContext(this.getContext());
    const formattedMessage = category ? `${category} - ${message}` : message;
    
    // Format metadata
    const metadata = this.formatMetadata(meta);
    
    const logEntry = this.createLogEntry(level, formattedMessage, metadata);
    
    // Log with Pino - merge metadata into the log object
    const pinoLevel = level === 'user_action' ? 'info' : level;
    (this.pinoLogger as any)[pinoLevel]({ ...metadata, msg: formattedMessage });
    
    // Emit to telemetry/metrics bridges
    this.emitOpenTelemetryLog(level, formattedMessage, metadata);
    this.emitMetrics(logEntry);
    
    // High-severity alerts
    if (this.isHighSeverity(level)) {
      this.notifyAlertHandler(logEntry);
    }
    
    // Also send to database handler if enabled
    if (this.databaseHandler && this.shouldLogToDatabase(level)) {
      this.databaseHandler.addLogEntry(logEntry);
    }
  }

  /**
   * Checks if a log level should be sent to database.
   */
  private shouldLogToDatabase(level: LogLevel): boolean {
    const dbLevel = this.options.databaseLevel || 'warn';
    const levelOrder: Record<LogLevel, number> = {
      trace: 0,
      debug: 1,
      info: 2,
      user_action: 2,
      notice: 3,
      success: 2,
      warn: 4,
      error: 5,
      failure: 4,
      fatal: 6,
    };
    
    return levelOrder[level] >= levelOrder[dbLevel];
  }

  /**
   * Creates a log entry for database handler.
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown>
  ): import('./types/logger').LogEntry {
    const context = this.getContext();
    
    return {
      timestamp: new Date().toISOString(),
      level,
      logger_name: this.pinoLogger.bindings().name as string || 'unknown',
      message,
      service: this.options.serviceName,
      env: this.options.env,
      source: context.source,
      action: context.action,
      component: context.component,
      user_id: context.userId,
      tenant_id: context.tenantId,
      org_id: context.orgId,
      resource_id: context.resourceId,
      job_id: context.jobId,
      feature_flag: context.featureFlag,
      experiment: context.experiment,
      release: context.release,
      request_id: metadata.request_id as string,
      trace_id: metadata.trace_id as string,
      session_id: this.sessionId,
      runtime: this.runtime,
      host: this.options.host,
      region: this.options.region,
      runtime_version: this.options.runtimeVersion,
      app_version: this.options.appVersion,
      commit_sha: this.options.commitSha,
      deployment_id: this.options.deploymentId,
      pid: metadata.pid as number,
      thread_id: metadata.thread_id as number,
      raw_log: JSON.stringify({ level, message, ...metadata }),
      meta: metadata,
      
      // Phase 1 Enhancements
      ip_address: context.ipAddress || metadata.ip_address as string,
      request_size: context.requestSize !== undefined ? context.requestSize : metadata.request_size as number,
      response_size: context.responseSize !== undefined ? context.responseSize : metadata.response_size as number,
      error_category: context.errorCategory || metadata.error_category as string,
      error_fingerprint: context.errorFingerprint || metadata.error_fingerprint as string,
      business_entity_id: context.businessEntity?.id || metadata.business_entity_id as string,
      business_entity_type: context.businessEntity?.type || metadata.business_entity_type as string,
      feature_flags: context.featureFlags || metadata.feature_flags as Record<string, unknown>,
      performance_metrics: context.performanceMetrics || metadata.performance_metrics as Record<string, unknown>,
      correlation_id: context.correlationId || metadata.correlation_id as string,
    };
  }

  /**
   * Emits log to OpenTelemetry if enabled.
   */
  private emitOpenTelemetryLog(level: LogLevel, message: string, metadata: Record<string, unknown>): void {
    if (!this.options.opentelemetryEnabled) {
      return;
    }
    
    const otelRecord = {
      body: message,
      severityText: level.toUpperCase(),
      severityNumber: CUSTOM_LEVELS[level],
      attributes: {
        ...metadata,
        service: this.options.serviceName,
        env: this.options.env,
      },
    };
    
    // Prefer user-supplied exporter hook
    if (this.options.otlpLogExporter) {
      try {
        void this.options.otlpLogExporter({ ...otelRecord, resource: { serviceName: this.options.serviceName } } as any);
      } catch {
        // Swallow exporter errors to avoid impacting main flow
      }
    }
    
    // Attempt to emit via @opentelemetry/api-logs if available
    try {
      const otelLogs = require('@opentelemetry/api-logs');
      const otelApi = require('@opentelemetry/api');
      const otelLogger = otelLogs.logs.getLogger(this.options.serviceName);
      const ctx = otelApi.context.active();
      const span = otelApi.trace.getSpan(ctx);
      const spanContext = span?.spanContext();
      
      const attributes = {
        ...otelRecord.attributes,
        ...(spanContext?.traceId ? { trace_id: spanContext.traceId, span_id: spanContext.spanId } : {}),
      };
      
      otelLogger.emit({
        body: otelRecord.body,
        severityText: otelRecord.severityText,
        severityNumber: otelRecord.severityNumber,
        attributes,
      });
    } catch {
      // Optional dependency; ignore if not present
    }
  }

  /**
   * Emits metrics hook if provided.
   */
  private emitMetrics(logEntry: import('./types/logger').LogEntry): void {
    if (!this.options.metricsHandler) {
      return;
    }
    
    try {
      void this.options.metricsHandler(logEntry);
    } catch {
      // Avoid breaking logging flow
    }
  }

  /**
   * Determines if the log level should trigger alerts.
   */
  private isHighSeverity(level: LogLevel): boolean {
    return ['error', 'fatal', 'failure'].includes(level);
  }

  /**
   * Sends high-severity events to alert handler if configured.
   */
  private notifyAlertHandler(logEntry: import('./types/logger').LogEntry): void {
    if (!this.options.alertHandler) {
      return;
    }
    
    try {
      void this.options.alertHandler(logEntry);
    } catch {
      // Do not throw on alert failures
    }
  }

  // Standard log methods
  trace(message: string, meta?: Record<string, unknown>): void {
    this.log('trace', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const serializedError = serializeError(error, this.options.sanitizeErrors);
    const errorCode = (serializedError as any).code || (error as any)?.code;
    const statusCode = (serializedError as any).statusCode || (error as any)?.statusCode;
    
    // Categorize and fingerprint error
    const errorCategory = categorizeError(
      error || new Error(message),
      errorCode,
      statusCode
    );
    
    // Extract file path and line from stack trace if available
    const stackTrace = (serializedError as any).stack;
    let filePath: string | undefined;
    let lineNumber: number | undefined;
    if (stackTrace && typeof stackTrace === 'string') {
      const firstLine = stackTrace.split('\n')[0];
      const match = firstLine.match(/at\s+(?:\S+\s+)?\(?([^:]+):(\d+):\d+\)?/);
      if (match) {
        filePath = match[1].trim();
        lineNumber = parseInt(match[2], 10);
      }
    }
    
    const errorFingerprint = fingerprintError(
      error || new Error(message),
      errorCode,
      filePath,
      lineNumber
    );
    
    // Set error context
    const context = this.getContext();
    setLogContext({
      ...context,
      errorCategory,
      errorFingerprint,
    });
    
    const errorMeta = {
      ...meta,
      error: serializedError,
      error_category: errorCategory,
      error_fingerprint: errorFingerprint,
    };
    
    this.log('error', message, errorMeta);
  }

  fatal(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const serializedError = serializeError(error, this.options.sanitizeErrors);
    const errorCode = (serializedError as any).code || (error as any)?.code;
    const statusCode = (serializedError as any).statusCode || (error as any)?.statusCode;
    
    // Categorize and fingerprint error
    const errorCategory = categorizeError(
      error || new Error(message),
      errorCode,
      statusCode
    );
    
    // Extract file path and line from stack trace if available
    const stackTrace = (serializedError as any).stack;
    let filePath: string | undefined;
    let lineNumber: number | undefined;
    if (stackTrace && typeof stackTrace === 'string') {
      const firstLine = stackTrace.split('\n')[0];
      const match = firstLine.match(/at\s+(?:\S+\s+)?\(?([^:]+):(\d+):\d+\)?/);
      if (match) {
        filePath = match[1].trim();
        lineNumber = parseInt(match[2], 10);
      }
    }
    
    const errorFingerprint = fingerprintError(
      error || new Error(message),
      errorCode,
      filePath,
      lineNumber
    );
    
    // Set error context
    const context = this.getContext();
    setLogContext({
      ...context,
      errorCategory,
      errorFingerprint,
    });
    
    const errorMeta = {
      ...meta,
      error: serializedError,
      error_category: errorCategory,
      error_fingerprint: errorFingerprint,
    };
    
    this.log('fatal', message, errorMeta);
  }

  // Custom log methods
  userAction(message: string, meta?: Record<string, unknown>): void {
    this.log('user_action', message, meta);
  }

  notice(message: string, meta?: Record<string, unknown>): void {
    this.log('notice', message, meta);
  }

  success(message: string, meta?: Record<string, unknown>): void {
    this.log('success', message, meta);
  }

  /**
   * Logs an audit entry with compliance markers.
   * 
   * @param message - Audit log message
   * @param meta - Additional metadata
   * @param complianceStandards - Compliance standards (GDPR, HIPAA, PCI-DSS, etc.)
   */
  audit(message: string, meta?: Record<string, unknown>, complianceStandards?: string[]): void {
    const context = this.getContext();
    const auditMeta = {
      ...meta,
      audit: true,
      compliance_standards: complianceStandards || [],
    };
    
    // Set audit context
    setLogContext({
      ...context,
      tags: {
        ...context.tags,
        audit: true,
      },
    });
    
    this.log('info', message, auditMeta);
  }

  failure(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const serializedError = serializeError(error, this.options.sanitizeErrors);
    const errorCode = (serializedError as any).code || (error as any)?.code;
    const statusCode = (serializedError as any).statusCode || (error as any)?.statusCode;
    
    // Categorize and fingerprint error (for failures too)
    const errorCategory = categorizeError(
      error || new Error(message),
      errorCode,
      statusCode
    );
    
    const errorFingerprint = fingerprintError(
      error || new Error(message),
      errorCode
    );
    
    const errorMeta = {
      ...meta,
      error: serializedError,
      error_category: errorCategory,
      error_fingerprint: errorFingerprint,
    };
    
    this.log('failure', message, errorMeta);
  }

  /**
   * Creates a child logger with additional context.
   */
  child(bindings: Record<string, unknown> = {}, context?: PartialLogContext): this {
    const childPino = this.pinoLogger.child(bindings);
    const mergedContext = {
      ...(this.options.defaultContext || {}),
      ...(context || {}),
    };
    
    const childOptions: LoggerOptions = {
      ...this.options,
      runtime: this.runtime,
      env: this.options.env,
      serviceName: this.options.serviceName,
      defaultContext: mergedContext,
    };
    
    const childLogger = new Logger(
      childPino.bindings().name as string,
      childOptions,
      {
        pinoLogger: childPino,
        databaseHandler: this.databaseHandler,
        inheritedContext: mergedContext,
      }
    );
    
    return childLogger as this;
  }

  /**
   * Returns a logger with merged default context without creating new transports.
   */
  withContext(context: PartialLogContext): this {
    return this.child({}, context);
  }

  /**
   * Mutates the current logger default context for subsequent logs.
   */
  addContext(context: PartialLogContext): void {
    this.options.defaultContext = {
      ...(this.options.defaultContext || {}),
      ...context,
    };
  }

  /**
   * Gets the underlying Pino logger instance.
   */
  getPinoLogger(): pino.Logger {
    return this.pinoLogger;
  }

  /**
   * Exposes internal counters for diagnostics.
   */
  getStats(): LoggerStats {
    return { ...this.stats };
  }

  /**
   * Gracefully shuts down the logger.
   * Flushes database handler and closes file streams.
   */
  async shutdown(): Promise<void> {
    if (this.databaseHandler) {
      await this.databaseHandler.stop();
    }
    // File streams are automatically closed by Pino
  }
}

/**
 * Creates a new logger instance.
 * 
 * @param name - Logger name (typically module/service name)
 * @param options - Logger configuration options
 * @returns Logger instance
 */
export function setupLogger(name: string, options: LoggerOptions): Logger {
  return new Logger(name, options);
}
