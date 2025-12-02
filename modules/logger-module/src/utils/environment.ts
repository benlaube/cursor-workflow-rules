/**
 * Runtime environment detection and feature availability utilities.
 * 
 * Detects the current runtime environment (Node.js, Browser, Edge) and
 * checks for feature availability to enable graceful degradation.
 */

export type Runtime = 'node' | 'browser' | 'edge';

/**
 * Detects the current runtime environment.
 * 
 * @returns The detected runtime environment
 * 
 * @example
 * ```typescript
 * const runtime = getRuntime(); // 'node' | 'browser' | 'edge'
 * ```
 */
export function getRuntime(): Runtime {
  // Node.js detection
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'node';
  }
  
  // Browser detection
  if (typeof window !== 'undefined' || typeof self !== 'undefined') {
    return 'browser';
  }
  
  // Edge runtime (Vercel Edge, Cloudflare Workers, Deno, etc.)
  return 'edge';
}

/**
 * Checks if the current runtime is Node.js.
 * 
 * @returns True if running in Node.js
 */
export function isNode(): boolean {
  return getRuntime() === 'node';
}

/**
 * Checks if the current runtime is a browser.
 * 
 * @returns True if running in a browser
 */
export function isBrowser(): boolean {
  return getRuntime() === 'browser';
}

/**
 * Checks if the current runtime is an edge runtime.
 * 
 * @returns True if running in an edge runtime
 */
export function isEdge(): boolean {
  return getRuntime() === 'edge';
}

/**
 * Feature availability flags for different runtimes.
 */
export interface FeatureAvailability {
  asyncLocalStorage: boolean;
  asyncContext: boolean;
  fileSystem: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  requestIdleCallback: boolean;
  setInterval: boolean;
  setTimeout: boolean;
}

/**
 * Checks if a specific feature is available in the current runtime.
 * 
 * @param feature - The feature to check
 * @returns True if the feature is available
 */
export function hasFeature(feature: keyof FeatureAvailability): boolean {
  const runtime = getRuntime();
  
  switch (feature) {
    case 'asyncLocalStorage':
      return runtime === 'node' && typeof (globalThis as any).AsyncLocalStorage !== 'undefined';
    
    case 'asyncContext':
      return runtime === 'browser' && typeof (globalThis as any).AsyncContext !== 'undefined';
    
    case 'fileSystem':
      return runtime === 'node' && typeof require !== 'undefined';
    
    case 'localStorage':
      return runtime === 'browser' && typeof localStorage !== 'undefined';
    
    case 'sessionStorage':
      return runtime === 'browser' && typeof sessionStorage !== 'undefined';
    
    case 'requestIdleCallback':
      return runtime === 'browser' && typeof requestIdleCallback !== 'undefined';
    
    case 'setInterval':
      return typeof setInterval !== 'undefined';
    
    case 'setTimeout':
      return typeof setTimeout !== 'undefined';
    
    default:
      return false;
  }
}

/**
 * Gets all available features for the current runtime.
 * 
 * @returns Object with feature availability flags
 */
export function getFeatureAvailability(): FeatureAvailability {
  return {
    asyncLocalStorage: hasFeature('asyncLocalStorage'),
    asyncContext: hasFeature('asyncContext'),
    fileSystem: hasFeature('fileSystem'),
    localStorage: hasFeature('localStorage'),
    sessionStorage: hasFeature('sessionStorage'),
    requestIdleCallback: hasFeature('requestIdleCallback'),
    setInterval: hasFeature('setInterval'),
    setTimeout: hasFeature('setTimeout'),
  };
}

/**
 * Gets runtime-specific default configuration values.
 * 
 * @returns Default configuration based on runtime
 */
export function getRuntimeDefaults() {
  const runtime = getRuntime();
  
  return {
    runtime,
    enableFile: runtime === 'node',
    consoleFormat: runtime === 'node' ? 'pretty' as const : 'json' as const,
    batchSize: runtime === 'edge' ? 25 : 50,
    flushInterval: runtime === 'edge' ? 2000 : 5000,
    maxQueueSize: runtime === 'edge' ? 100 : 1000,
    browserStorage: 'localStorage' as const,
    edgeOptimized: runtime === 'edge',
  };
}

