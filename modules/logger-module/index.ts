import pino from 'pino';

export interface LoggerOptions {
  env: 'development' | 'production' | 'test';
  serviceName: string;
}

export class Logger {
  private logger: pino.Logger;

  constructor(options: LoggerOptions) {
    this.logger = pino({
      name: options.serviceName,
      level: options.env === 'development' ? 'debug' : 'info',
      transport: options.env === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      } : undefined,
    });
  }

  info(message: string, meta?: object) {
    this.logger.info(meta, message);
  }

  error(message: string, error?: Error, meta?: object) {
    this.logger.error({ err: error, ...meta }, message);
  }

  warn(message: string, meta?: object) {
    this.logger.warn(meta, message);
  }

  debug(message: string, meta?: object) {
    this.logger.debug(meta, message);
  }
}

export const createLogger = (serviceName: string) => {
  const env = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
  return new Logger({ env, serviceName });
};

