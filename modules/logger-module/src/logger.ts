/**
 * Main Logger class with Pino integration and universal runtime support.
 * 
 * Provides structured logging with multi-dimensional categorization,
 * context propagation, and multi-destination output.
 */

import pino from 'pino';
import { getRuntime, getRuntimeDefaults } from './utils/environment';
import { getSessionId } from './session';
import { getLogContext } from './context';
import { formatCategoryFromContext } from './formatters';
import { getOrCreateRequestId } from './tracing/request-id';
import { getOpenTelemetryTraceId } from './tracing/opentelemetry';
import { scrubObject, DEFAULT_SCRUB_FIELDS } from './security/pii-scrubber';
import { serializeError } from './helpers/serialize-error';
import { createConsoleHandler } from './handlers/console-handler';
import { createFileHandler } from './handlers/file-handler';
import { createDatabaseHandler, DatabaseLogHandler } from './handlers/database-handler';
import type { LoggerOptions, LogLevel } from './types/options';
import type { ILogger } from './types/logger-interface';
import type { LogContext } from './types/context';
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

/**
 * Main Logger class.
 * 
 * Implements ILogger interface for dependency injection and type safety.
 */
export class Logger implements ILogger {
  private pinoLogger: pino.Logger;
  private options: Required<Omit<LoggerOptions, 'supabaseClient' | 'persistLog' | 'piiPatterns' | 'scrubFields' | 'defaultContext'>> & {
    supabaseClient?: LoggerOptions['supabaseClient'];
    persistLog?: LoggerOptions['persistLog'];
    piiPatterns: RegExp[];
    scrubFields: string[];
    defaultContext?: LogContext;
  };
  private runtime: 'node' | 'browser' | 'edge';
  private sessionId: string;
  private databaseHandler?: DatabaseLogHandler;

  constructor(name: string, options: LoggerOptions) {
    // Validate options
    const validated = LoggerOptionsSchema.parse(options);
    
    // Detect runtime
    this.runtime = validated.runtime === 'auto' || !validated.runtime
      ? getRuntime()
      : validated.runtime;
    
    // Get runtime defaults and merge with options
    const defaults = getRuntimeDefaults();
    this.options = {
      ...defaults,
      ...validated,
      runtime: this.runtime,
      piiPatterns: validated.piiPatterns || [],
      scrubFields: validated.scrubFields || DEFAULT_SCRUB_FIELDS,
      defaultContext: validated.defaultContext,
      // Set defaults for undefined values
      level: validated.level || (validated.env === 'production' ? 'info' : 'debug'),
      consoleLevel: validated.consoleLevel || (validated.env === 'production' ? 'info' : 'debug'),
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
    };
    
    // Get session ID
    this.sessionId = getSessionId(this.options.browserStorage);
    
    // Initialize Pino logger
    this.pinoLogger = this.createPinoLogger(name);
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
    
    // Database handler (set up separately, not as Pino stream)
    if (this.options.enableDatabase) {
      this.databaseHandler = createDatabaseHandler({
        level: this.options.databaseLevel || 'warn',
        supabaseClient: this.options.supabaseClient,
        persistLog: this.options.persistLog,
        batchSize: this.options.batchSize,
        flushInterval: this.options.flushInterval,
        maxQueueSize: this.options.maxQueueSize,
        retryConfig: this.options.retryConfig,
      });
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
    return Math.random() * this.options.samplingRate < 1;
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
    const metadata: Record<string, unknown> = {
      session_id: this.sessionId,
      runtime: this.runtime,
    };
    
    // Add context
    if (context.source) metadata.source = context.source;
    if (context.action) metadata.action = context.action;
    if (context.component) metadata.component = context.component;
    if (context.endpoint) metadata.endpoint = context.endpoint;
    
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
      
      Object.assign(metadata, scrubbed);
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
    
    // Log with Pino - merge metadata into the log object
    const pinoLevel = level === 'user_action' ? 'info' : level;
    (this.pinoLogger as any)[pinoLevel]({ ...metadata, msg: formattedMessage });
    
    // Also send to database handler if enabled
    if (this.databaseHandler && this.shouldLogToDatabase(level)) {
      const logEntry = this.createLogEntry(level, formattedMessage, metadata);
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
      source: context.source,
      action: context.action,
      component: context.component,
      request_id: metadata.request_id as string,
      trace_id: metadata.trace_id as string,
      session_id: this.sessionId,
      runtime: this.runtime,
      raw_log: JSON.stringify({ level, message, ...metadata }),
      meta: metadata,
    };
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
    const errorMeta = error instanceof Error
      ? { ...meta, error: serializeError(error, this.options.sanitizeErrors) }
      : { ...meta, error: serializeError(error, this.options.sanitizeErrors) };
    
    this.log('error', message, errorMeta);
  }

  fatal(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorMeta = error instanceof Error
      ? { ...meta, error: serializeError(error, this.options.sanitizeErrors) }
      : { ...meta, error: serializeError(error, this.options.sanitizeErrors) };
    
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

  failure(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorMeta = error instanceof Error
      ? { ...meta, error: serializeError(error, this.options.sanitizeErrors) }
      : { ...meta, error: serializeError(error, this.options.sanitizeErrors) };
    
    this.log('failure', message, errorMeta);
  }

  /**
   * Creates a child logger with additional context.
   */
  child(bindings: Record<string, unknown>): this {
    // Create a new logger instance with merged context
    const childLogger = new Logger(this.pinoLogger.bindings().name as string, this.options);
    // Note: Full child logger implementation would require more Pino integration
    return childLogger;
  }

  /**
   * Gets the underlying Pino logger instance.
   */
  getPinoLogger(): pino.Logger {
    return this.pinoLogger;
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

