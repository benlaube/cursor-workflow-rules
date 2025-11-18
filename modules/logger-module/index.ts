/**
 * Configuration options for the Logger.
 */
export interface LoggerOptions {
  env: 'development' | 'production' | 'test';
  serviceName: string;
  /**
   * Optional: Callback to persist logs to a remote service (e.g., Datadog, Sentry).
   * This decouples the "how" of storage from the "what" of logging.
   */
  persistLog?: (logEntry: object) => Promise<void>;
}

// ... (existing imports and class structure)

  // Inside Logger class methods (info, error, etc.):
  // if (this.options.persistLog) {
  //   this.options.persistLog({ level: 'info', message, meta, timestamp: new Date() });
  // }
