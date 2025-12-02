/**
 * File handler for session-based log files (Node.js only).
 * 
 * Writes logs to session-based files with rotation support.
 * Automatically disabled in browser/edge environments.
 */

import pino from 'pino';
import { isNode } from '../utils/environment';
import { getSessionLogPath } from '../session';
import type { LogLevel } from '../types/logger';
import type { FileRotationConfig } from '../types/options';

export interface FileHandlerOptions {
  level: LogLevel;
  logDir?: string;
  rotation?: FileRotationConfig;
}

/**
 * Creates a file stream handler for Pino (Node.js only).
 * 
 * @param options - File handler options
 * @returns Pino stream destination or null if not in Node.js
 */
export function createFileHandler(options: FileHandlerOptions): pino.StreamEntry | null {
  if (!isNode()) {
    return null; // File handler not available in browser/edge
  }
  
  const logPath = getSessionLogPath(options.logDir);
  if (!logPath) {
    return null; // Failed to create log path
  }
  
  // Create file stream
  const fs = require('fs');
  const stream = fs.createWriteStream(logPath, { flags: 'a' });
  
  // Set up rotation if configured
  if (options.rotation) {
    setupRotation(logPath, options.rotation);
  }
  
  return {
    level: options.level,
    stream: pino.destination({
      dest: logPath,
      sync: false,
      minLength: 0,
    }),
  };
}

/**
 * Sets up log rotation (basic implementation).
 * For production, consider using pino-roll or similar.
 */
function setupRotation(logPath: string, config: FileRotationConfig): void {
  // Basic rotation setup
  // For full rotation support, integrate with pino-roll or similar library
  const fs = require('fs');
  const path = require('path');
  const zlib = require('zlib');
  
  // Check file size if maxSize is configured
  if (config.maxSize) {
    const stats = fs.statSync(logPath);
    const maxBytes = parseSize(config.maxSize);
    
    if (stats.size > maxBytes) {
      // Rotate file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = `${logPath}.${timestamp}`;
      fs.renameSync(logPath, rotatedPath);
      
      // Compress if configured
      if (config.compress) {
        try {
          const gzip = zlib.createGzip();
          const source = fs.createReadStream(rotatedPath);
          const destination = fs.createWriteStream(`${rotatedPath}.gz`);
          source.pipe(gzip).pipe(destination);
        } catch {
          // Compression failures should not interrupt logging
        }
      }
      
      // Apply retention policy
      if (config.retention) {
        const retentionMs = parseDurationToMs(config.retention);
        if (retentionMs > 0) {
          try {
            const dir = path.dirname(logPath);
            const base = path.basename(logPath);
            const files = fs.readdirSync(dir);
            const now = Date.now();
            files
              .filter((file: string) => file.startsWith(base))
              .forEach((file: string) => {
                const fullPath = path.join(dir, file);
                const stats = fs.statSync(fullPath);
                if (now - stats.mtimeMs > retentionMs) {
                  fs.unlinkSync(fullPath);
                }
              });
          } catch {
            // Retention clean failures are non-fatal
          }
        }
      }
    }
  }
}

/**
 * Parses size string (e.g., "100MB") to bytes.
 */
function parseSize(size: string): number {
  const match = size.match(/^(\d+)([KMGT]?B?)$/i);
  if (!match) return 0;
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toUpperCase();
  
  const multipliers: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
  };
  
  return value * (multipliers[unit] || 1);
}

/**
 * Parses simple duration strings (e.g., "90d", "24h") to milliseconds.
 */
function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 0;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };
  
  return value * (multipliers[unit] || 0);
}
