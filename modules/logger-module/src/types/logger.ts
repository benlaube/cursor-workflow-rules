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

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  logger_name: string;
  message: string;
  source?: string;
  action?: string;
  component?: string;
  request_id?: string;
  trace_id?: string;
  session_id: string;
  runtime: 'node' | 'browser' | 'edge';
  raw_log?: string;
  meta?: Record<string, unknown>;
}

