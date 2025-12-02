/**
 * Request tracking utilities.
 * 
 * Provides helpers for tracking detailed request/response information,
 * including headers, fingerprints, rate limiting, and cache status.
 */

/**
 * Request fingerprint options.
 */
export interface RequestFingerprintOptions {
  /** Include method in fingerprint */
  includeMethod?: boolean;
  /** Include path in fingerprint */
  includePath?: boolean;
  /** Include headers in fingerprint */
  includeHeaders?: boolean;
  /** Include query parameters in fingerprint */
  includeQuery?: boolean;
  /** Headers to include in fingerprint (if includeHeaders is true) */
  headerKeys?: string[];
}

/**
 * Generates a request fingerprint for duplicate detection.
 * 
 * @param method - HTTP method
 * @param path - Request path
 * @param headers - Request headers
 * @param query - Query parameters
 * @param options - Fingerprint options
 * @returns SHA-256 hash (first 16 chars for readability)
 * 
 * @example
 * fingerprintRequest('GET', '/api/users', { 'user-agent': '...' }, { page: '1' })
 * // Returns: 'a1b2c3d4e5f6g7h8'
 */
export function fingerprintRequest(
  method: string,
  path: string,
  headers?: Record<string, string | string[] | undefined>,
  query?: Record<string, unknown>,
  options: RequestFingerprintOptions = {}
): string {
  const {
    includeMethod = true,
    includePath = true,
    includeHeaders = false,
    includeQuery = false,
    headerKeys = ['user-agent', 'accept', 'content-type'],
  } = options;
  
  const parts: string[] = [];
  
  if (includeMethod) {
    parts.push(method.toUpperCase());
  }
  
  if (includePath) {
    parts.push(path);
  }
  
  if (includeHeaders && headers) {
    const headerValues = headerKeys
      .map(key => {
        const value = headers[key.toLowerCase()] || headers[key];
        return value ? String(Array.isArray(value) ? value[0] : value) : '';
      })
      .filter(Boolean);
    if (headerValues.length > 0) {
      parts.push(headerValues.join('|'));
    }
  }
  
  if (includeQuery && query) {
    const queryString = Object.entries(query)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${String(v)}`)
      .join('&');
    if (queryString) {
      parts.push(queryString);
    }
  }
  
  const fingerprint = parts.join('|');
  
  // Generate hash
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const crypto = require('crypto');
      if (crypto && crypto.createHash) {
        const hash = crypto.createHash('sha256');
        hash.update(fingerprint);
        return hash.digest('hex').substring(0, 16);
      }
    } catch {
      // Fall through to fallback
    }
  }
  
  // Fallback: simple hash
  return simpleHash(fingerprint).substring(0, 16);
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

/**
 * Extracts relevant request headers for tracking.
 * 
 * @param headers - All request headers
 * @returns Object with relevant headers
 */
export function extractRequestHeaders(headers: Record<string, string | string[] | undefined>): {
  contentType?: string;
  accept?: string;
  userAgent?: string;
  referer?: string;
  origin?: string;
  authorization?: string; // Will be redacted
  [key: string]: string | undefined;
} {
  const normalized: Record<string, string | undefined> = {};
  
  // Normalize header keys (case-insensitive)
  const getHeader = (key: string): string | string[] | undefined => {
    const lowerKey = key.toLowerCase();
    return headers[lowerKey] || headers[key];
  };
  
  const contentType = getHeader('content-type');
  if (contentType) {
    normalized.contentType = Array.isArray(contentType) ? contentType[0] : contentType;
  }
  
  const accept = getHeader('accept');
  if (accept) {
    normalized.accept = Array.isArray(accept) ? accept[0] : accept;
  }
  
  const userAgent = getHeader('user-agent');
  if (userAgent) {
    normalized.userAgent = Array.isArray(userAgent) ? userAgent[0] : userAgent;
  }
  
  const referer = getHeader('referer');
  if (referer) {
    normalized.referer = Array.isArray(referer) ? referer[0] : referer;
  }
  
  const origin = getHeader('origin');
  if (origin) {
    normalized.origin = Array.isArray(origin) ? origin[0] : origin;
  }
  
  // Authorization header (redacted for security)
  const authorization = getHeader('authorization');
  if (authorization) {
    const authValue = Array.isArray(authorization) ? authorization[0] : authorization;
    normalized.authorization = authValue ? '[REDACTED]' : undefined;
  }
  
  return normalized;
}

/**
 * Extracts relevant response headers for tracking.
 * 
 * @param headers - All response headers
 * @returns Object with relevant headers
 */
export function extractResponseHeaders(headers: Record<string, string | string[] | undefined>): {
  contentType?: string;
  cacheControl?: string;
  etag?: string;
  lastModified?: string;
  expires?: string;
  contentEncoding?: string;
  [key: string]: string | undefined;
} {
  const normalized: Record<string, string | undefined> = {};
  
  // Normalize header keys (case-insensitive)
  const getHeader = (key: string): string | string[] | undefined => {
    const lowerKey = key.toLowerCase();
    return headers[lowerKey] || headers[key];
  };
  
  const contentType = getHeader('content-type');
  if (contentType) {
    normalized.contentType = Array.isArray(contentType) ? contentType[0] : contentType;
  }
  
  const cacheControl = getHeader('cache-control');
  if (cacheControl) {
    normalized.cacheControl = Array.isArray(cacheControl) ? cacheControl[0] : cacheControl;
  }
  
  const etag = getHeader('etag');
  if (etag) {
    normalized.etag = Array.isArray(etag) ? etag[0] : etag;
  }
  
  const lastModified = getHeader('last-modified');
  if (lastModified) {
    normalized.lastModified = Array.isArray(lastModified) ? lastModified[0] : lastModified;
  }
  
  const expires = getHeader('expires');
  if (expires) {
    normalized.expires = Array.isArray(expires) ? expires[0] : expires;
  }
  
  const contentEncoding = getHeader('content-encoding');
  if (contentEncoding) {
    normalized.contentEncoding = Array.isArray(contentEncoding) ? contentEncoding[0] : contentEncoding;
  }
  
  return normalized;
}

/**
 * Determines cache status from response headers.
 * 
 * @param headers - Response headers
 * @returns Cache status information
 */
export function getCacheStatus(headers: Record<string, string | string[] | undefined>): {
  hit?: boolean;
  miss?: boolean;
  status: 'hit' | 'miss' | 'unknown';
  cacheControl?: string;
  etag?: string;
} {
  const cacheControl = extractResponseHeaders(headers).cacheControl;
  const etag = extractResponseHeaders(headers).etag;
  
  // Check for cache hit indicators (typically from CDN/proxy headers)
  const cfCacheStatus = headers['cf-cache-status'] || headers['CF-Cache-Status'];
  const xCacheStatus = headers['x-cache-status'] || headers['X-Cache-Status'];
  
  let status: 'hit' | 'miss' | 'unknown' = 'unknown';
  let hit: boolean | undefined;
  let miss: boolean | undefined;
  
  if (cfCacheStatus) {
    const value = String(Array.isArray(cfCacheStatus) ? cfCacheStatus[0] : cfCacheStatus).toLowerCase();
    if (value === 'hit' || value === 'expired') {
      status = 'hit';
      hit = true;
    } else if (value === 'miss' || value === 'bypass') {
      status = 'miss';
      miss = true;
    }
  } else if (xCacheStatus) {
    const value = String(Array.isArray(xCacheStatus) ? xCacheStatus[0] : xCacheStatus).toLowerCase();
    if (value === 'hit') {
      status = 'hit';
      hit = true;
    } else if (value === 'miss') {
      status = 'miss';
      miss = true;
    }
  }
  
  return {
    hit,
    miss,
    status,
    cacheControl,
    etag,
  };
}

/**
 * Extracts rate limiting information from response headers.
 * 
 * @param headers - Response headers
 * @returns Rate limiting information
 */
export function getRateLimitInfo(headers: Record<string, string | string[] | undefined>): {
  limit?: number;
  remaining?: number;
  reset?: number;
  retryAfter?: number;
} {
  const getHeader = (key: string): string | undefined => {
    const lowerKey = key.toLowerCase();
    const value = headers[lowerKey] || headers[key];
    return value ? String(Array.isArray(value) ? value[0] : value) : undefined;
  };
  
  const limit = getHeader('x-ratelimit-limit') || getHeader('ratelimit-limit');
  const remaining = getHeader('x-ratelimit-remaining') || getHeader('ratelimit-remaining');
  const reset = getHeader('x-ratelimit-reset') || getHeader('ratelimit-reset');
  const retryAfter = getHeader('retry-after');
  
  return {
    limit: limit ? parseInt(limit, 10) : undefined,
    remaining: remaining ? parseInt(remaining, 10) : undefined,
    reset: reset ? parseInt(reset, 10) : undefined,
    retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
  };
}

