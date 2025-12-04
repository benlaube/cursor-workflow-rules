/**
 * Log Viewer - API Routes and Middleware
 * 
 * Provides HTTP endpoints for viewing and analyzing logs.
 * Can be integrated into Express/Next.js apps or run as standalone service.
 */

import type { Logger } from '../logger';
import * as path from 'path';
import * as fs from 'fs';

/**
 * LogError interface (matches error-handler module).
 * If error-handler is available, import from there instead.
 */
export interface LogError {
  message: string;
  stackTrace?: string;
  filePath?: string;
  lineNumber?: number;
  errorCode?: string;
  timestamp?: string;
  level?: string;
  context?: Record<string, unknown>;
  count?: number;
}

/**
 * Try to import analyzeLogs and categorizeError from error-handler module.
 * Falls back to basic implementation if not available.
 */
let analyzeLogs: any;
let categorizeError: any;

try {
  // Try to import from error-handler (adjust path based on project structure)
  const errorHandler = require('../../../error-handler/log-analyzer');
  analyzeLogs = errorHandler.analyzeLogs;
  categorizeError = errorHandler.categorizeError;
} catch {
  // Fallback: will need to be provided via options or use basic implementation
  analyzeLogs = null;
  categorizeError = null;
}

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
  /** Custom analyzeLogs function (if error-handler not available) */
  analyzeLogsFn?: (options: any) => Promise<{ ok: boolean; value?: LogError[]; error?: any }>;
  /** Custom categorizeError function (if error-handler not available) */
  categorizeErrorFn?: (error: LogError) => 'auto-fix' | 'propose-fix' | 'investigate';
  /** Page number for pagination (1-based, default: 1) */
  page?: number;
  /** Page size for pagination (default: 100) */
  pageSize?: number;
}

/**
 * Default options for log viewer.
 */
const DEFAULT_OPTIONS: Partial<LogViewerOptions> = {
  logDir: './logs',
  enableDatabase: false,
  maxEntries: 100,
  timeRange: 3600000, // 1 hour
  minLevel: 'error',
};

/**
 * Simple in-memory cache for file listings and analyzed logs.
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Global cache instances
const fileListCache = new SimpleCache();
const analyzedLogsCache = new SimpleCache();

/**
 * Get log files from directory with caching.
 */
export async function getLogFiles(logDir: string, useCache: boolean = true): Promise<string[]> {
  const cacheKey = `files:${logDir}`;
  
  if (useCache) {
    const cached = fileListCache.get<string[]>(cacheKey);
    if (cached) return cached;
  }
  
  try {
    if (!fs.existsSync(logDir)) {
      return [];
    }
    
    const files = fs.readdirSync(logDir);
    const result = files
      .filter(file => file.endsWith('.log'))
      .map(file => path.join(logDir, file))
      .sort((a, b) => {
        // Sort by modification time (newest first)
        const statA = fs.statSync(a);
        const statB = fs.statSync(b);
        return statB.mtime.getTime() - statA.mtime.getTime();
      });
    
    // Cache for 30 seconds
    if (useCache) {
      fileListCache.set(cacheKey, result, 30000);
    }
    
    return result;
  } catch (error) {
    return [];
  }
}

/**
 * Clear file list cache (useful when new log files are created).
 */
export function clearFileListCache(logDir?: string): void {
  if (logDir) {
    fileListCache.delete(`files:${logDir}`);
  } else {
    fileListCache.clear();
  }
}

/**
 * Get log file content with streaming support for large files.
 */
export async function getLogFileContent(
  filePath: string,
  lines?: number,
  useStreaming: boolean = true
): Promise<string> {
  try {
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const useStream = useStreaming && fileSize > 10 * 1024 * 1024; // 10MB threshold
    
    if (useStream && lines) {
      // For large files, read only the last N lines using streaming
      return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        let buffer = '';
        
        stream.on('data', (chunk: string | Buffer) => {
          const chunkStr = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
          buffer += chunkStr;
          const allLines = buffer.split('\n');
          // Keep only the last (lines + 1) lines in buffer (extra for incomplete line)
          buffer = allLines.slice(-(lines + 1)).join('\n');
        });
        
        stream.on('end', () => {
          const allLines = buffer.split('\n');
          const result = allLines.slice(-lines).join('\n');
          resolve(result);
        });
        
        stream.on('error', (err) => {
          reject(new Error(`Failed to read log file: ${err.message}`));
        });
      });
    } else {
      // For small files or when streaming is disabled, read normally
      const content = fs.readFileSync(filePath, 'utf-8');
      if (lines) {
        const allLines = content.split('\n');
        return allLines.slice(-lines).join('\n');
      }
      return content;
    }
  } catch (error: any) {
    throw new Error(`Failed to read log file: ${error.message}`);
  }
}

/**
 * Analyze logs and return formatted results with pagination support and caching.
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
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const page = options.page || 1;
  const pageSize = options.pageSize || finalOptions.maxEntries || 100;
  
  // Create cache key from options (exclude pagination for cache key)
  const cacheKey = `analyzed:${finalOptions.logDir}:${finalOptions.timeRange}:${finalOptions.minLevel}:${finalOptions.maxEntries}`;
  
  // Check cache (only if not using pagination, as pagination changes results)
  let cachedResult: { errors: LogError[] } | null = null;
  if (!options.page && !options.pageSize) {
    cachedResult = analyzedLogsCache.get<{ errors: LogError[] }>(cacheKey);
  }
  
  // Use provided function or try to use imported one
  const analyzeFn = options.analyzeLogsFn || analyzeLogs;
  const categorizeFn = options.categorizeErrorFn || categorizeError;
  
  if (!analyzeFn) {
    throw new Error('analyzeLogs function not available. Please provide analyzeLogsFn in options or install error-handler module.');
  }
  
  // If pagination is requested, fetch more entries than needed to calculate total
  // Otherwise, use the original maxEntries limit
  const fetchLimit = options.page || options.pageSize ? undefined : finalOptions.maxEntries;
  
  let result: { ok: boolean; value?: LogError[]; error?: any };
  
  if (cachedResult) {
    // Use cached data, but need to format it for the analyzeFn return type
    result = { ok: true, value: cachedResult.errors };
  } else {
    result = await analyzeFn({
      logDir: finalOptions.logDir,
      maxEntries: fetchLimit,
      timeRange: finalOptions.timeRange,
      minLevel: finalOptions.minLevel,
    });
    
    // Cache the result for 10 seconds (only if not using pagination)
    if (!options.page && !options.pageSize && result.ok && result.value) {
      analyzedLogsCache.set(cacheKey, { errors: result.value }, 10000);
    }
  }
  
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  
  const allErrors = result.value || [];
  const total = allErrors.length;
  
  // Apply pagination if requested
  let errors: LogError[];
  let pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | undefined;
  
  if (options.page || options.pageSize) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    errors = allErrors.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(total / pageSize);
    pagination = {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  } else {
    errors = allErrors;
  }
  
  const summary = {
    total,
    autoFixable: 0,
    proposeFix: 0,
    investigate: 0,
    byLevel: {} as Record<string, number>,
  };
  
  // Only categorize if function is available (categorize all errors, not just paginated ones)
  if (categorizeFn) {
    for (const error of allErrors) {
      const category = categorizeFn(error);
      if (category === 'auto-fix') summary.autoFixable++;
      else if (category === 'propose-fix') summary.proposeFix++;
      else summary.investigate++;
      
      const level = error.level || 'unknown';
      summary.byLevel[level] = (summary.byLevel[level] || 0) + 1;
    }
  }
  
  return { errors, summary, ...(pagination && { pagination }) };
}

/**
 * Query database logs (if Supabase is enabled) with pagination support.
 */
export async function queryDatabaseLogs(
  supabaseClient: any,
  options: {
    limit?: number;
    level?: string;
    levels?: string[]; // Multi-level filtering
    component?: string;
    source?: string;
    action?: string;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  data: any[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  if (!supabaseClient) {
    throw new Error('Supabase client not provided');
  }
  
  const page = options.page || 1;
  const pageSize = options.pageSize || options.limit || 100;
  
  // Build base query
  let query = supabaseClient
    .from('logs')
    .select('*', { count: 'exact' })
    .order('timestamp', { ascending: false });
  
  // Single level filter (backward compatible)
  if (options.level) {
    query = query.eq('level', options.level);
  }
  
  // Multi-level filtering
  if (options.levels && options.levels.length > 0) {
    query = query.in('level', options.levels);
  }
  
  if (options.component) {
    query = query.eq('component', options.component);
  }
  
  if (options.source) {
    query = query.eq('source', options.source);
  }
  
  if (options.action) {
    query = query.eq('action', options.action);
  }
  
  if (options.startTime) {
    query = query.gte('timestamp', options.startTime.toISOString());
  }
  
  if (options.endTime) {
    query = query.lte('timestamp', options.endTime.toISOString());
  }
  
  // Apply pagination if requested
  if (options.page || options.pageSize) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;
    query = query.range(startIndex, endIndex);
  } else if (options.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
  
  const logs = data || [];
  
  // Build pagination metadata if pagination was requested
  let pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | undefined;
  
  if (options.page || options.pageSize) {
    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);
    pagination = {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
  
  return {
    data: logs,
    ...(pagination && { pagination }),
  };
}

/**
 * Get aggregated log statistics.
 * 
 * @param supabaseClient - Supabase client
 * @param options - Query options
 * @returns Aggregated statistics by level, component, source, etc.
 */
export async function getLogStats(
  supabaseClient: any,
  options: {
    startTime?: Date;
    endTime?: Date;
    component?: string;
    source?: string;
  } = {}
): Promise<{
  byLevel: Record<string, number>;
  byComponent: Record<string, number>;
  bySource: Record<string, number>;
  total: number;
  errorCount: number;
  warningCount: number;
}> {
  if (!supabaseClient) {
    throw new Error('Supabase client not provided');
  }
  
  // Build base query
  let query = supabaseClient
    .from('logs')
    .select('level, component, source');
  
  if (options.component) {
    query = query.eq('component', options.component);
  }
  
  if (options.source) {
    query = query.eq('source', options.source);
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
  
  const logs = data || [];
  const stats = {
    byLevel: {} as Record<string, number>,
    byComponent: {} as Record<string, number>,
    bySource: {} as Record<string, number>,
    total: logs.length,
    errorCount: 0,
    warningCount: 0,
  };
  
  for (const log of logs) {
    // Count by level
    const level = log.level || 'unknown';
    stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
    
    if (level === 'error' || level === 'fatal' || level === 'failure') {
      stats.errorCount++;
    } else if (level === 'warn') {
      stats.warningCount++;
    }
    
    // Count by component
    if (log.component) {
      stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1;
    }
    
    // Count by source
    if (log.source) {
      stats.bySource[log.source] = (stats.bySource[log.source] || 0) + 1;
    }
  }
  
  return stats;
}

/**
 * Get error trends over time.
 * 
 * @param supabaseClient - Supabase client
 * @param options - Query options
 * @returns Error counts grouped by time period
 */
export async function getErrorTrends(
  supabaseClient: any,
  options: {
    startTime?: Date;
    endTime?: Date;
    interval?: 'hour' | 'day' | 'week'; // Time interval for grouping
    component?: string;
  } = {}
): Promise<Array<{
  period: string;
  count: number;
  errorCount: number;
  warningCount: number;
}>> {
  if (!supabaseClient) {
    throw new Error('Supabase client not provided');
  }
  
  const interval = options.interval || 'hour';
  
  // Build base query
  let query = supabaseClient
    .from('logs')
    .select('timestamp, level');
  
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
  
  const logs = data || [];
  
  // Group by time interval
  const trends: Record<string, { count: number; errorCount: number; warningCount: number }> = {};
  
  for (const log of logs) {
    const timestamp = new Date(log.timestamp);
    let period: string;
    
    if (interval === 'hour') {
      period = timestamp.toISOString().slice(0, 13) + ':00:00Z'; // YYYY-MM-DDTHH:00:00Z
    } else if (interval === 'day') {
      period = timestamp.toISOString().slice(0, 10) + 'T00:00:00Z'; // YYYY-MM-DDT00:00:00Z
    } else {
      // Week: get Monday of the week
      const day = timestamp.getUTCDay();
      const diff = timestamp.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      const monday = new Date(timestamp.setUTCDate(diff));
      period = monday.toISOString().slice(0, 10) + 'T00:00:00Z';
    }
    
    if (!trends[period]) {
      trends[period] = { count: 0, errorCount: 0, warningCount: 0 };
    }
    
    trends[period].count++;
    const level = log.level || '';
    if (level === 'error' || level === 'fatal' || level === 'failure') {
      trends[period].errorCount++;
    } else if (level === 'warn') {
      trends[period].warningCount++;
    }
  }
  
  // Convert to array and sort by period
  return Object.entries(trends)
    .map(([period, counts]) => ({ period, ...counts }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Get most frequent errors.
 * 
 * @param supabaseClient - Supabase client
 * @param options - Query options
 * @returns Top errors sorted by frequency
 */
export async function getTopErrors(
  supabaseClient: any,
  options: {
    limit?: number;
    startTime?: Date;
    endTime?: Date;
    component?: string;
  } = {}
): Promise<Array<{
  message: string;
  level: string;
  component?: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
}>> {
  if (!supabaseClient) {
    throw new Error('Supabase client not provided');
  }
  
  const limit = options.limit || 10;
  
  // Build base query for error-level logs
  let query = supabaseClient
    .from('logs')
    .select('message, level, component, timestamp')
    .in('level', ['error', 'fatal', 'failure'])
    .order('timestamp', { ascending: false });
  
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
  
  const logs = data || [];
  
  // Group by message and count occurrences
  const errorMap: Record<string, {
    message: string;
    level: string;
    component?: string;
    count: number;
    firstSeen: string;
    lastSeen: string;
  }> = {};
  
  for (const log of logs) {
    const message = log.message || 'Unknown error';
    const key = `${message}|${log.component || ''}`;
    
    if (!errorMap[key]) {
      errorMap[key] = {
        message,
        level: log.level || 'error',
        component: log.component,
        count: 0,
        firstSeen: log.timestamp,
        lastSeen: log.timestamp,
      };
    }
    
    errorMap[key].count++;
    
    // Update timestamps
    const logTime = new Date(log.timestamp);
    const firstSeen = new Date(errorMap[key].firstSeen);
    const lastSeen = new Date(errorMap[key].lastSeen);
    
    if (logTime < firstSeen) {
      errorMap[key].firstSeen = log.timestamp;
    }
    if (logTime > lastSeen) {
      errorMap[key].lastSeen = log.timestamp;
    }
  }
  
  // Convert to array, sort by count, and limit
  return Object.values(errorMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Export logs to CSV format.
 * 
 * @param options - Log viewer options (same as getAnalyzedLogs)
 * @returns CSV string with headers and log data
 */
export async function exportLogsToCSV(options: LogViewerOptions = {}): Promise<string> {
  const result = await getAnalyzedLogs(options);
  
  // CSV headers
  const headers = [
    'timestamp',
    'level',
    'message',
    'source',
    'action',
    'component',
    'request_id',
    'trace_id',
    'session_id',
    'user_id',
    'tenant_id',
    'file_path',
    'line_number',
    'error_code',
    'stack_trace',
  ];
  
  // Build CSV rows
  const rows = result.errors.map(error => {
    const row = [
      error.timestamp || '',
      error.level || '',
      (error.message || '').replace(/"/g, '""'), // Escape quotes
      (error.context as any)?.source || '',
      (error.context as any)?.action || '',
      (error.context as any)?.component || '',
      (error.context as any)?.request_id || '',
      (error.context as any)?.trace_id || '',
      (error.context as any)?.session_id || '',
      (error.context as any)?.user_id || '',
      (error.context as any)?.tenant_id || '',
      error.filePath || '',
      error.lineNumber?.toString() || '',
      error.errorCode || '',
      (error.stackTrace || '').replace(/"/g, '""').replace(/\n/g, ' '), // Escape and flatten
    ];
    
    // Wrap each field in quotes and join with commas
    return row.map(field => `"${field}"`).join(',');
  });
  
  // Combine headers and rows
  return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
}

/**
 * Export logs to JSON format.
 * 
 * @param options - Log viewer options (same as getAnalyzedLogs)
 * @returns JSON string with logs and metadata
 */
export async function exportLogsToJSON(options: LogViewerOptions = {}): Promise<string> {
  const result = await getAnalyzedLogs(options);
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    summary: result.summary,
    logs: result.errors,
    metadata: {
      logDir: options.logDir || './logs',
      maxEntries: options.maxEntries || 100,
      timeRange: options.timeRange || 3600000,
      minLevel: options.minLevel || 'error',
    },
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Prepare log file for download with security checks.
 * 
 * @param filePath - Path to the log file
 * @param logDir - Base log directory (for security validation)
 * @returns File content and metadata
 * @throws Error if file is outside log directory or cannot be read
 */
export async function downloadLogFile(
  filePath: string,
  logDir: string = './logs'
): Promise<{ content: string; filename: string; size: number }> {
  // Security: ensure file is within log directory
  const resolvedPath = path.resolve(filePath);
  const resolvedLogDir = path.resolve(logDir);
  
  if (!resolvedPath.startsWith(resolvedLogDir)) {
    throw new Error('Access denied: File is outside log directory');
  }
  
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }
  
  const content = await getLogFileContent(filePath);
  const stats = fs.statSync(filePath);
  const filename = path.basename(filePath);
  
  return {
    content,
    filename,
    size: stats.size,
  };
}

