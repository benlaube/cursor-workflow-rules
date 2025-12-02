/**
 * Console handler for colorized output (Node.js) or JSON (browser/edge).
 * 
 * Provides runtime-aware console logging with pretty formatting in Node.js
 * and JSON formatting in browser/edge environments.
 */

import pino from 'pino';
import { getRuntime, isNode } from '../utils/environment';
import type { LogLevel } from '../types/logger';

export interface ConsoleHandlerOptions {
  level: LogLevel;
  format?: 'pretty' | 'json' | 'compact';
  colorize?: boolean;
}

/**
 * Creates a console stream handler for Pino.
 * 
 * @param options - Console handler options
 * @returns Pino stream destination
 */
export function createConsoleHandler(options: ConsoleHandlerOptions): pino.StreamEntry {
  const runtime = getRuntime();
  const format = options.format || (runtime === 'node' ? 'pretty' : 'json');
  
  if (format === 'pretty' && isNode()) {
    // Use pino-pretty for Node.js
    try {
      const pinoPretty = require('pino-pretty');
      
      return {
        level: options.level,
        stream: pinoPretty({
          colorize: options.colorize ?? true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          customColors: 'debug:cyan,info:green,warn:yellow,error:red',
          customLevels: 'user_action:25,notice:35,success:32,failure:45',
        }),
      };
    } catch {
      // pino-pretty not available, fall back to JSON
      return createJsonStream(options);
    }
  } else if (format === 'compact') {
    // Compact format
    return {
      level: options.level,
      stream: pino.destination({
        sync: false,
        minLength: 0,
      }),
    };
  } else {
    // JSON format (default for browser/edge)
    return createJsonStream(options);
  }
}

/**
 * Creates a JSON stream for console output.
 */
function createJsonStream(options: ConsoleHandlerOptions): pino.StreamEntry {
  return {
    level: options.level,
    stream: pino.destination({
      sync: false,
    }),
  };
}

