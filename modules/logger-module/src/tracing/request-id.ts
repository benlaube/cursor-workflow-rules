/**
 * Request ID generation and management.
 * 
 * Generates unique request IDs (UUID v4) for distributed tracing.
 */

/**
 * Generates a unique request ID using UUID v4.
 * 
 * @returns UUID v4 string
 */
export function generateRequestId(): string {
  // Use crypto.randomUUID if available (Node.js 15.6+, modern browsers)
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  
  // Try to use uuid package if available
  try {
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  } catch {
    // Fallback: Generate UUID v4 manually
    return generateUUIDv4();
  }
}

/**
 * Generates a UUID v4 manually (fallback for older environments).
 * 
 * @returns UUID v4 string
 */
function generateUUIDv4(): string {
  // Generate random hex values
  const hex = '0123456789abcdef';
  let uuid = '';
  
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4'; // Version 4
    } else if (i === 19) {
      uuid += hex[(Math.random() * 4) | 8]; // Variant bits
    } else {
      uuid += hex[Math.floor(Math.random() * 16)];
    }
  }
  
  return uuid;
}

/**
 * Gets or generates a request ID from the current context.
 * If no request ID exists in context, generates a new one and sets it.
 * 
 * @returns Request ID string
 */
export function getOrCreateRequestId(): string {
  // Dynamic import to avoid circular dependency
  const contextModule = require('../context');
  const context = contextModule.getLogContext();
  
  if (context?.requestId) {
    return context.requestId;
  }
  
  // Generate new request ID and set in context
  const requestId = generateRequestId();
  contextModule.setLogContext({ requestId });
  
  return requestId;
}

