/**
 * PII (Personally Identifiable Information) scrubbing utilities.
 * 
 * Detects and redacts sensitive data from log entries.
 */

/**
 * Default PII detection patterns.
 */
export const DEFAULT_PII_PATTERNS: RegExp[] = [
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Social Security Numbers (US format)
  /\b\d{3}-\d{2}-\d{4}\b/g,
  /\b\d{9}\b/g,
  
  // Credit card numbers (basic pattern)
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  
  // Phone numbers (US format)
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g,
  
  // API keys/tokens (common patterns)
  /\b(api[_-]?key|token|secret|password)[=:]\s*[\w-]{20,}\b/gi,
  
  // JWT tokens
  /\beyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g,
];

/**
 * Scrubs PII from a string using provided patterns.
 * 
 * @param text - Text to scrub
 * @param patterns - Array of regex patterns to match PII (defaults to DEFAULT_PII_PATTERNS)
 * @param replacement - Replacement string (default: "[REDACTED]")
 * @returns Scrubbed text
 */
export function scrubPII(
  text: string,
  patterns: RegExp[] = DEFAULT_PII_PATTERNS,
  replacement: string = '[REDACTED]'
): string {
  let scrubbed = text;
  
  for (const pattern of patterns) {
    scrubbed = scrubbed.replace(pattern, replacement);
  }
  
  return scrubbed;
}

/**
 * Scrubs PII from an object recursively.
 * 
 * @param obj - Object to scrub
 * @param patterns - Array of regex patterns to match PII
 * @param scrubFields - Field names to automatically scrub (case-insensitive)
 * @param replacement - Replacement string (default: "[REDACTED]")
 * @returns Scrubbed object
 */
export function scrubObject(
  obj: unknown,
  patterns: RegExp[] = DEFAULT_PII_PATTERNS,
  scrubFields: string[] = [],
  replacement: string = '[REDACTED]'
): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return scrubPII(obj, patterns, replacement);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => scrubObject(item, patterns, scrubFields, replacement));
  }
  
  if (typeof obj === 'object') {
    const scrubbed: Record<string, unknown> = {};
    const scrubFieldsLower = scrubFields.map(f => f.toLowerCase());
    
    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();
      
      // Check if field should be automatically scrubbed
      if (scrubFieldsLower.some(field => keyLower.includes(field))) {
        scrubbed[key] = replacement;
      } else if (typeof value === 'string') {
        scrubbed[key] = scrubPII(value, patterns, replacement);
      } else {
        scrubbed[key] = scrubObject(value, patterns, scrubFields, replacement);
      }
    }
    
    return scrubbed;
  }
  
  return obj;
}

/**
 * Common field names that typically contain sensitive data.
 */
export const DEFAULT_SCRUB_FIELDS = [
  'password',
  'passwd',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'ssn',
  'socialSecurity',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'cvc',
  'email',
  'phone',
  'phoneNumber',
  'phone_number',
];

