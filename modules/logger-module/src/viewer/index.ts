/**
 * Log Viewer - API Routes and Middleware
 * 
 * Provides HTTP endpoints for viewing and analyzing logs.
 * Can be integrated into Express/Next.js apps or run as standalone service.
 */

import { analyzeLogs, categorizeError, type LogError } from '../../error-handler/log-analyzer';
import type { Logger } from '../logger';
import * as path from 'path';
import * as fs from 'fs';

export interface LogViewerOptions {
  /** Log directory path (default: './logs') */
  logDir?: string;
  /** Logger instance for logging viewer operations */
  logger?: Logger;
  /** Enable database log queries (requires Supabase client) */
  enableDatabase?: boolean;
  /** Supabase client for database queries */
  supabaseClient?: any;
  /** Maximum entries to return (default: 100) */
  maxEntries?: number;
  /** Time range in milliseconds (default: 3600000 = 1 hour) */
  timeRange?: number;
  /** Minimum log level to include (default: 'error') */
  minLevel?: 'error' | 'fatal' | 'warn' | 'info';
}

/**
 * Default options for log viewer.
 */
const DEFAULT_OPTIONS: Required<Omit<LogViewerOptions, 'logger' | 'supabaseClient'>> = {
  logDir: './logs',
  enableDatabase: false,
  maxEntries: 100,
  timeRange: 3600000, // 1 hour
  minLevel: 'error',
};

/**
 * Get log files from directory.
 */
export async function getLogFiles(logDir: string): Promise<string[]> {
  try {
    if (!fs.existsSync(logDir)) {
      return [];
    }
    
    const files = fs.readdirSync(logDir);
    return files
      .filter(file => file.endsWith('.log'))
      .map(file => path.join(logDir, file))
      .sort((a, b) => {
        // Sort by modification time (newest first)
        const statA = fs.statSync(a);
        const statB = fs.statSync(b);
        return statB.mtime.getTime() - statA.mtime.getTime();
      });
  } catch (error) {
    return [];
  }
}

/**
 * Get log file content.
 */
export async function getLogFileContent(filePath: string, lines?: number): Promise<string> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (lines) {
      const allLines = content.split('\n');
      return allLines.slice(-lines).join('\n');
    }
    return content;
  } catch (error: any) {
    throw new Error(`Failed to read log file: ${error.message}`);
  }
}

/**
 * Analyze logs and return formatted results.
 */
export async function getAnalyzedLogs(options: LogViewerOptions = {}): Promise<{
  errors: LogError[];
  summary: {
    total: number;
    autoFixable: number;
    proposeFix: number;
    investigate: number;
    byLevel: Record<string, number>;
  };
}> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  
  const result = await analyzeLogs({
    logDir: finalOptions.logDir,
    maxEntries: finalOptions.maxEntries,
    timeRange: finalOptions.timeRange,
    minLevel: finalOptions.minLevel,
  });
  
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  
  const errors = result.value;
  const summary = {
    total: errors.length,
    autoFixable: 0,
    proposeFix: 0,
    investigate: 0,
    byLevel: {} as Record<string, number>,
  };
  
  for (const error of errors) {
    const category = categorizeError(error);
    if (category === 'auto-fix') summary.autoFixable++;
    else if (category === 'propose-fix') summary.proposeFix++;
    else summary.investigate++;
    
    const level = error.level || 'unknown';
    summary.byLevel[level] = (summary.byLevel[level] || 0) + 1;
  }
  
  return { errors, summary };
}

/**
 * Query database logs (if Supabase is enabled).
 */
export async function queryDatabaseLogs(
  supabaseClient: any,
  options: {
    limit?: number;
    level?: string;
    component?: string;
    startTime?: Date;
    endTime?: Date;
  } = {}
): Promise<any[]> {
  if (!supabaseClient) {
    throw new Error('Supabase client not provided');
  }
  
  let query = supabaseClient
    .from('logs')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.level) {
    query = query.eq('level', options.level);
  }
  
  if (options.component) {
    query = query.eq('component', options.component);
  }
  
  if (options.startTime) {
    query = query.gte('timestamp', options.startTime.toISOString());
  }
  
  if (options.endTime) {
    query = query.lte('timestamp', options.endTime.toISOString());
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
  
  return data || [];
}

