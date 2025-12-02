/**
 * Error categorization and fingerprinting utilities.
 * 
 * Provides functions to categorize errors and generate fingerprints for grouping.
 */

import type { ErrorCategory } from '../types/logger';

/**
 * Categorizes an error based on its characteristics.
 * 
 * @param error - Error object or error message
 * @param errorCode - Optional error code
 * @param statusCode - Optional HTTP status code
 * @returns Error category
 * 
 * @example
 * categorizeError(new Error('Connection refused'), undefined, 503)
 * // Returns: 'network'
 */
export function categorizeError(
  error: Error | unknown,
  errorCode?: string,
  statusCode?: number
): ErrorCategory {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();
  const lowerCode = errorCode?.toLowerCase() || '';
  
  // Network errors
  if (
    statusCode === 503 ||
    statusCode === 504 ||
    /connection|timeout|network|econnrefused|etimedout|enotfound/i.test(lowerMessage) ||
    /network|connection|timeout/i.test(lowerCode)
  ) {
    return 'network';
  }
  
  // Authentication errors
  if (
    statusCode === 401 ||
    /unauthorized|authentication|auth|token|credential|login/i.test(lowerMessage) ||
    /unauthorized|auth|token/i.test(lowerCode)
  ) {
    return 'authentication';
  }
  
  // Authorization errors
  if (
    statusCode === 403 ||
    /forbidden|permission|access denied|unauthorized access/i.test(lowerMessage) ||
    /forbidden|permission|access/i.test(lowerCode)
  ) {
    return 'authorization';
  }
  
  // Rate limiting
  if (
    statusCode === 429 ||
    /rate limit|too many requests|throttle/i.test(lowerMessage) ||
    /rate_limit|throttle/i.test(lowerCode)
  ) {
    return 'rate_limit';
  }
  
  // Timeout errors
  if (
    statusCode === 408 ||
    /timeout|timed out|deadline exceeded/i.test(lowerMessage) ||
    /timeout|deadline/i.test(lowerCode)
  ) {
    return 'timeout';
  }
  
  // Database errors
  if (
    /database|sql|query|postgres|mysql|mongodb|prisma|sequelize|connection pool/i.test(lowerMessage) ||
    /database|sql|query/i.test(lowerCode) ||
    /^23\d{3}$/.test(errorCode || '') // PostgreSQL error codes 23xxx
  ) {
    return 'database';
  }
  
  // Validation errors
  if (
    statusCode === 400 ||
    statusCode === 422 ||
    /validation|invalid|bad request|malformed|schema|required field/i.test(lowerMessage) ||
    /validation|invalid|bad_request/i.test(lowerCode) ||
    /^22\d{3}$/.test(errorCode || '') // PostgreSQL error codes 22xxx (data exceptions)
  ) {
    return 'validation';
  }
  
  // Business logic errors
  if (
    statusCode === 409 ||
    /business rule|constraint|duplicate|already exists|conflict/i.test(lowerMessage) ||
    /business|constraint|duplicate|conflict/i.test(lowerCode) ||
    /^23\d{3}$/.test(errorCode || '') && /unique|foreign key/i.test(lowerMessage) // Unique/FK violations
  ) {
    return 'business_logic';
  }
  
  return 'unknown';
}

/**
 * Generates an error fingerprint for grouping similar errors.
 * 
 * @param error - Error object or error message
 * @param errorCode - Optional error code
 * @param filePath - Optional file path from stack trace
 * @param lineNumber - Optional line number from stack trace
 * @returns SHA-256 hash of error characteristics (first 16 chars for readability)
 * 
 * @example
 * fingerprintError(new Error('Connection refused'), 'ECONNREFUSED', '/path/to/file.ts', 42)
 * // Returns: 'a1b2c3d4e5f6g7h8'
 */
export function fingerprintError(
  error: Error | unknown,
  errorCode?: string,
  filePath?: string,
  lineNumber?: number
): string {
  const message = error instanceof Error ? error.message : String(error);
  
  // Extract key characteristics
  const characteristics = [
    errorCode || '',
    filePath || '',
    lineNumber?.toString() || '',
    // Normalize error message (remove variable parts)
    normalizeErrorMessage(message),
  ].filter(Boolean).join('|');
  
  // Generate hash (Node.js crypto if available, otherwise fallback)
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const crypto = require('crypto');
      if (crypto && crypto.createHash) {
        const hash = crypto.createHash('sha256');
        hash.update(characteristics);
        return hash.digest('hex').substring(0, 16); // First 16 chars for readability
      }
    } catch {
      // Fall through to fallback
    }
  }
  
  // Fallback: simple hash for environments without crypto
  return simpleHash(characteristics).substring(0, 16);
}

/**
 * Normalizes error message by removing variable parts (IDs, timestamps, etc.).
 * 
 * @param message - Error message
 * @returns Normalized message
 */
function normalizeErrorMessage(message: string): string {
  return message
    // Remove UUIDs
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<uuid>')
    // Remove timestamps
    .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/g, '<timestamp>')
    // Remove numbers (but keep structure)
    .replace(/\b\d+\b/g, '<number>')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Simple hash function for environments without crypto.
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

