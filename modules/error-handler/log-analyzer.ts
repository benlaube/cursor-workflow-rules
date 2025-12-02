import { AppError, Result, ok, err } from './index';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Represents an error extracted from log files.
 */
export interface LogError {
  /** Error message */
  message: string;
  /** Stack trace if available */
  stackTrace?: string;
  /** File path from stack trace */
  filePath?: string;
  /** Line number from stack trace */
  lineNumber?: number;
  /** Error code if available */
  errorCode?: string;
  /** Timestamp of the error */
  timestamp?: string;
  /** Log level (error, fatal, etc.) */
  level?: string;
  /** Additional context/metadata */
  context?: Record<string, unknown>;
  /** Number of times this error occurred */
  count?: number;
}

/**
 * Options for log analysis.
 */
export interface LogAnalyzerOptions {
  /** Directory to search for log files (default: './logs') */
  logDir?: string;
  /** Maximum number of log entries to read (default: 1000) */
  maxEntries?: number;
  /** Time range to analyze (in milliseconds, default: last hour) */
  timeRange?: number;
  /** Minimum log level to analyze (default: 'error') */
  minLevel?: 'error' | 'fatal' | 'warn';
  /** Pattern to match log files (default: '*.log') */
  filePattern?: string;
  /** Whether to parse stack traces (default: true) */
  parseStackTraces?: boolean;
}

/**
 * Default options for log analyzer.
 */
const DEFAULT_OPTIONS: Required<Omit<LogAnalyzerOptions, 'logDir'>> = {
  maxEntries: 1000,
  timeRange: 3600000, // 1 hour
  minLevel: 'error',
  filePattern: '*.log',
  parseStackTraces: true,
};

/**
 * Extracts file path and line number from a stack trace line.
 * 
 * @param stackLine - A line from a stack trace
 * @returns Object with filePath and lineNumber, or null if not found
 * 
 * @example
 * parseStackLine("at Object.foo (/path/to/file.ts:42:10)")
 * // Returns: { filePath: "/path/to/file.ts", lineNumber: 42 }
 */
export function parseStackLine(stackLine: string): { filePath: string; lineNumber: number } | null {
  // Match patterns like:
  // - "at Object.foo (/path/to/file.ts:42:10)"
  // - "at /path/to/file.ts:42:10"
  // - "    at /path/to/file.ts:42:10"
  const match = stackLine.match(/at\s+(?:\S+\s+)?\(?([^:]+):(\d+):\d+\)?/);
  if (match) {
    const filePath = match[1].trim();
    const lineNumber = parseInt(match[2], 10);
    if (filePath && !isNaN(lineNumber)) {
      return { filePath, lineNumber };
    }
  }
  return null;
}

/**
 * Parses a stack trace to extract file paths and line numbers.
 * 
 * @param stackTrace - Full stack trace string
 * @returns Array of file paths and line numbers
 */
export function parseStackTrace(stackTrace: string): Array<{ filePath: string; lineNumber: number }> {
  const lines = stackTrace.split('\n');
  const results: Array<{ filePath: string; lineNumber: number }> = [];
  
  for (const line of lines) {
    const parsed = parseStackLine(line);
    if (parsed) {
      results.push(parsed);
    }
  }
  
  return results;
}

/**
 * Extracts error code from error message or metadata.
 * 
 * @param message - Error message
 * @param context - Additional context/metadata
 * @returns Error code if found, undefined otherwise
 */
export function extractErrorCode(message: string, context?: Record<string, unknown>): string | undefined {
  // Try to extract from context first
  if (context?.code && typeof context.code === 'string') {
    return context.code;
  }
  
  if (context?.errorCode && typeof context.errorCode === 'string') {
    return context.errorCode;
  }
  
  // Try to extract from message (e.g., "ERROR_CODE: message")
  const codeMatch = message.match(/^([A-Z_]+):\s*/);
  if (codeMatch) {
    return codeMatch[1];
  }
  
  // Try to extract HTTP status codes
  const httpMatch = message.match(/\b(\d{3})\b/);
  if (httpMatch) {
    const status = parseInt(httpMatch[1], 10);
    if (status >= 400 && status < 600) {
      return `HTTP_${status}`;
    }
  }
  
  return undefined;
}

/**
 * Parses a single log line to extract error information.
 * 
 * @param logLine - A line from a log file
 * @returns LogError if error found, null otherwise
 */
export function parseLogLine(logLine: string): LogError | null {
  try {
    // Try to parse as JSON (structured logging)
    const parsed = JSON.parse(logLine);
    
    // Check if it's an error level log
    const level = parsed.level?.toLowerCase();
    if (level !== 'error' && level !== 'fatal' && level !== 'warn') {
      return null;
    }
    
    const message = parsed.message || parsed.msg || '';
    const stackTrace = parsed.stack || parsed.stackTrace || parsed.err?.stack;
    const timestamp = parsed.time || parsed.timestamp || parsed['@timestamp'];
    
    // Extract file path and line from stack trace
    let filePath: string | undefined;
    let lineNumber: number | undefined;
    
    if (stackTrace && typeof stackTrace === 'string') {
      const stackInfo = parseStackLine(stackTrace.split('\n')[0]);
      if (stackInfo) {
        filePath = stackInfo.filePath;
        lineNumber = stackInfo.lineNumber;
      }
    }
    
    const errorCode = extractErrorCode(message, parsed);
    
    return {
      message,
      stackTrace: stackTrace as string | undefined,
      filePath,
      lineNumber,
      errorCode,
      timestamp: timestamp as string | undefined,
      level,
      context: parsed,
    };
  } catch {
    // Not JSON, try to parse as plain text
    // Look for error patterns
    if (!/error|fatal|exception|failed/i.test(logLine)) {
      return null;
    }
    
    // Try to extract stack trace from plain text
    const stackMatch = logLine.match(/at\s+.*\(([^:]+):(\d+):\d+\)/);
    let filePath: string | undefined;
    let lineNumber: number | undefined;
    
    if (stackMatch) {
      filePath = stackMatch[1];
      lineNumber = parseInt(stackMatch[2], 10);
    }
    
    return {
      message: logLine.trim(),
      filePath,
      lineNumber,
    };
  }
}

/**
 * Reads and analyzes log files to extract errors.
 * 
 * @param options - Log analyzer options
 * @returns Result containing array of LogError objects
 * 
 * @example
 * const result = await analyzeLogs({ logDir: './logs', maxEntries: 100 });
 * if (result.ok) {
 *   console.log(`Found ${result.value.length} errors`);
 * }
 */
export async function analyzeLogs(
  options: LogAnalyzerOptions = {}
): Promise<Result<LogError[], AppError>> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const logDir = finalOptions.logDir || './logs';
  
  try {
    // Check if log directory exists
    if (!fs.existsSync(logDir)) {
      return ok([]); // No logs to analyze
    }
    
    // Find log files
    const files = fs.readdirSync(logDir);
    const logFiles = files.filter(file => {
      if (finalOptions.filePattern === '*.log') {
        return file.endsWith('.log');
      }
      // Simple pattern matching (could be enhanced with glob)
      const pattern = finalOptions.filePattern.replace('*', '.*');
      return new RegExp(pattern).test(file);
    });
    
    if (logFiles.length === 0) {
      return ok([]);
    }
    
    const errors: LogError[] = [];
    const errorMap = new Map<string, LogError>(); // For deduplication
    
    // Read each log file
    for (const logFile of logFiles) {
      const filePath = path.join(logDir, logFile);
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        // Read last N lines (most recent errors)
        const startLine = Math.max(0, lines.length - finalOptions.maxEntries);
        const recentLines = lines.slice(startLine);
        
        for (const line of recentLines) {
          if (!line.trim()) continue;
          
          const error = parseLogLine(line);
          if (error) {
            // Check time range if timestamp available
            if (error.timestamp && finalOptions.timeRange) {
              const errorTime = new Date(error.timestamp).getTime();
              const now = Date.now();
              if (now - errorTime > finalOptions.timeRange) {
                continue; // Skip old errors
              }
            }
            
            // Deduplicate similar errors
            const key = `${error.message}|${error.filePath}|${error.lineNumber}`;
            if (errorMap.has(key)) {
              const existing = errorMap.get(key)!;
              existing.count = (existing.count || 1) + 1;
            } else {
              error.count = 1;
              errorMap.set(key, error);
              errors.push(error);
            }
          }
        }
      } catch (fileError: any) {
        // Skip files that can't be read
        console.warn(`Failed to read log file ${logFile}:`, fileError.message);
      }
    }
    
    // Sort by count (most frequent first) or timestamp (most recent first)
    errors.sort((a, b) => {
      if (a.count && b.count && a.count !== b.count) {
        return b.count - a.count; // Most frequent first
      }
      if (a.timestamp && b.timestamp) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Most recent first
      }
      return 0;
    });
    
    return ok(errors);
  } catch (error: any) {
    return err(new AppError(
      `Failed to analyze logs: ${error.message}`,
      'LOG_ANALYSIS_FAILED'
    ));
  }
}

/**
 * Categorizes errors for auto-fix vs propose-fix strategies.
 * 
 * @param error - LogError to categorize
 * @returns Category: 'auto-fix', 'propose-fix', or 'investigate'
 */
export function categorizeError(error: LogError): 'auto-fix' | 'propose-fix' | 'investigate' {
  const message = error.message.toLowerCase();
  const errorCode = error.errorCode?.toLowerCase();
  
  // Auto-fixable errors
  if (
    /syntax error|parse error|unexpected token/i.test(message) ||
    /cannot find module|cannot resolve|module not found/i.test(message) ||
    /type error|type mismatch|is not assignable/i.test(message) ||
    /missing required|required field|undefined is not/i.test(message) ||
    /permission denied|eacces|enoent/i.test(message) ||
    errorCode === 'syntax_error' ||
    errorCode === 'module_not_found' ||
    errorCode === 'type_error'
  ) {
    return 'auto-fix';
  }
  
  // Propose fix (logic errors, business rules)
  if (
    /logic error|business rule|validation failed/i.test(message) ||
    /null pointer|undefined is not a function/i.test(message) ||
    errorCode === 'validation_error' ||
    errorCode === 'business_rule_violation'
  ) {
    return 'propose-fix';
  }
  
  // Requires investigation
  return 'investigate';
}

