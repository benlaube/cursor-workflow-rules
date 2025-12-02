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

/**
 * Gets the hostname/instance identifier when available.
 */
export function getHostName(): string | undefined {
  if (isNode()) {
    try {
      const os = require('os');
      return os.hostname();
    } catch {
      return undefined;
    }
  }
  
  const globalLocation = (globalThis as any).location;
  if (globalLocation?.hostname) {
    return globalLocation.hostname;
  }
  
  return undefined;
}

/**
 * Gets the runtime version string (Node.js, browser UA, or edge hint).
 */
export function getRuntimeVersionString(): string | undefined {
  if (isNode()) {
    return process.version;
  }
  
  const nav = (globalThis as any).navigator;
  if (nav?.userAgent) {
    return nav.userAgent;
  }
  
  const deno = (globalThis as any).Deno;
  if (deno?.version?.deno) {
    return `deno/${deno.version.deno}`;
  }
  
  return undefined;
}

/**
 * Gets region/zone information from common environment variables.
 */
export function getRegion(): string | undefined {
  const env = typeof process !== 'undefined' ? process.env : undefined;
  return env?.VERCEL_REGION ||
    env?.FLY_REGION ||
    env?.AWS_REGION ||
    env?.AWS_DEFAULT_REGION ||
    env?.GCP_REGION ||
    env?.AZURE_REGION ||
    env?.REGION;
}

/**
 * Gets a deployment identifier from common CI/CD environments.
 */
export function getDeploymentId(): string | undefined {
  const env = typeof process !== 'undefined' ? process.env : undefined;
  return env?.VERCEL_DEPLOYMENT_ID ||
    env?.RENDER_DEPLOY_ID ||
    env?.DEPLOYMENT_ID ||
    env?.RELEASE ||
    env?.RELEASE_REVISION ||
    env?.HEROKU_RELEASE_VERSION;
}

/**
 * Gets process/thread identifiers when available.
 */
export function getProcessIdentifiers(): { pid?: number; threadId?: number } {
  const pid = typeof process !== 'undefined' && process.pid ? process.pid : undefined;
  let threadId: number | undefined;
  
  if (isNode()) {
    try {
      const workerThreads = require('worker_threads');
      threadId = workerThreads?.threadId;
    } catch {
      threadId = undefined;
    }
  }
  
  return { pid, threadId };
}

/**
 * Gets the package/app version when available (Node.js only).
 */
export function getPackageVersion(): string | undefined {
  if (!isNode()) {
    return undefined;
  }
  
  return process.env.npm_package_version;
}
