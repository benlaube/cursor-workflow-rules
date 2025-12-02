/**
 * Session management for universal runtime support.
 * 
 * Manages session IDs across different runtime environments:
 * - Node.js: Stores in environment variable and file system
 * - Browser: Stores in localStorage/sessionStorage
 * - Edge: Memory-only (request-scoped)
 */

import { getRuntime, isNode, isBrowser, hasFeature } from './utils/environment';
import type { BrowserStorage } from './types/runtime';

const SESSION_ID_KEY = 'LOGGER_SESSION_ID';

/**
 * Generates a unique session ID in YYYYMMDD_HHMMSS format.
 * 
 * @returns Session ID string
 */
function generateSessionId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

let sessionId: string | null = null;

/**
 * Gets or creates the current session ID.
 * 
 * @param storage - Browser storage type (only used in browser runtime)
 * @returns Current session ID
 */
export function getSessionId(storage: BrowserStorage = 'localStorage'): string {
  if (sessionId) {
    return sessionId;
  }
  
  const runtime = getRuntime();
  
  if (runtime === 'node') {
    // Node.js: Check environment variable first, then generate
    sessionId = process.env[SESSION_ID_KEY] || generateSessionId();
    process.env[SESSION_ID_KEY] = sessionId;
    return sessionId;
  } else if (runtime === 'browser') {
    // Browser: Check storage, then generate
    if (storage === 'localStorage' && hasFeature('localStorage')) {
      sessionId = localStorage.getItem(SESSION_ID_KEY) || generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      return sessionId;
    } else if (storage === 'sessionStorage' && hasFeature('sessionStorage')) {
      sessionId = sessionStorage.getItem(SESSION_ID_KEY) || generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      return sessionId;
    } else {
      // Memory-only fallback
      sessionId = generateSessionId();
      return sessionId;
    }
  } else {
    // Edge: Memory-only (request-scoped)
    sessionId = generateSessionId();
    return sessionId;
  }
}

/**
 * Gets the path to the session log file (Node.js only).
 * 
 * @param logDir - Custom log directory (default: './logs')
 * @returns Path to session log file, or null if not in Node.js
 */
export function getSessionLogPath(logDir: string = './logs'): string | null {
  if (!isNode()) {
    return null;
  }
  
  // Dynamic import for Node.js-only modules
  const path = require('path');
  const fs = require('fs');
  
  const sessionId = getSessionId();
  const logsPath = path.resolve(process.cwd(), logDir);
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logsPath)) {
    try {
      fs.mkdirSync(logsPath, { recursive: true });
    } catch (error) {
      // If directory creation fails, return null
      console.warn(`Failed to create log directory: ${logsPath}`, error);
      return null;
    }
  }
  
  return path.join(logsPath, `session_${sessionId}.log`);
}

/**
 * Clears the current session ID.
 * Useful for testing or when starting a new session.
 * 
 * @param storage - Browser storage type (only used in browser runtime)
 */
export function clearSession(storage: BrowserStorage = 'localStorage'): void {
  sessionId = null;
  
  const runtime = getRuntime();
  
  if (runtime === 'node') {
    delete process.env[SESSION_ID_KEY];
  } else if (runtime === 'browser') {
    if (storage === 'localStorage' && hasFeature('localStorage')) {
      localStorage.removeItem(SESSION_ID_KEY);
    } else if (storage === 'sessionStorage' && hasFeature('sessionStorage')) {
      sessionStorage.removeItem(SESSION_ID_KEY);
    }
  }
  // Edge: No cleanup needed (memory-only)
}

/**
 * Resets the session (generates a new session ID).
 * 
 * @param storage - Browser storage type (only used in browser runtime)
 * @returns New session ID
 */
export function resetSession(storage: BrowserStorage = 'localStorage'): string {
  clearSession(storage);
  return getSessionId(storage);
}

