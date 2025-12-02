/**
 * Performance baseline utilities.
 * 
 * Provides helpers for comparing current performance metrics against
 * historical baselines and detecting performance degradation.
 */

import type { PerformanceMetrics } from '../types/logger';

/**
 * Performance baseline data structure.
 */
export interface PerformanceBaseline {
  /** Operation name/identifier */
  operation: string;
  /** Average duration in milliseconds */
  avgDuration: number;
  /** P50 duration (median) */
  p50Duration: number;
  /** P95 duration */
  p95Duration: number;
  /** P99 duration */
  p99Duration: number;
  /** Average memory usage in bytes */
  avgMemory?: number;
  /** Sample count used for baseline */
  sampleCount: number;
  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Performance comparison result.
 */
export interface PerformanceComparison {
  /** Operation name */
  operation: string;
  /** Current metrics */
  current: PerformanceMetrics;
  /** Baseline metrics */
  baseline: PerformanceBaseline;
  /** Duration difference (current - baseline) */
  durationDelta: number;
  /** Duration percentage change */
  durationPercentChange: number;
  /** Whether performance degraded (slower than baseline) */
  degraded: boolean;
  /** Severity of degradation (none, minor, major, critical) */
  severity: 'none' | 'minor' | 'major' | 'critical';
  /** Alert threshold exceeded */
  alertThreshold?: 'p50' | 'p95' | 'p99';
}

/**
 * Stores performance baselines (in-memory, should be persisted in production).
 */
const baselines = new Map<string, PerformanceBaseline>();

/**
 * Updates or creates a performance baseline.
 * 
 * @param operation - Operation name/identifier
 * @param metrics - Current performance metrics
 * @param sampleCount - Number of samples to use for baseline (default: 100)
 */
export function updateBaseline(
  operation: string,
  metrics: PerformanceMetrics,
  sampleCount: number = 100
): void {
  const existing = baselines.get(operation);
  const duration = metrics.duration || 0;
  
  if (existing) {
    // Update existing baseline with exponential moving average
    const alpha = 0.1; // Smoothing factor
    const newAvg = existing.avgDuration * (1 - alpha) + duration * alpha;
    
    baselines.set(operation, {
      ...existing,
      avgDuration: newAvg,
      p50Duration: Math.max(existing.p50Duration, duration * 0.5), // Simplified
      p95Duration: Math.max(existing.p95Duration, duration * 0.95),
      p99Duration: Math.max(existing.p99Duration, duration * 0.99),
      avgMemory: metrics.memory?.heapUsed 
        ? (existing.avgMemory || 0) * (1 - alpha) + metrics.memory.heapUsed * alpha
        : existing.avgMemory,
      sampleCount: existing.sampleCount + 1,
      lastUpdated: new Date(),
    });
  } else {
    // Create new baseline
    baselines.set(operation, {
      operation,
      avgDuration: duration,
      p50Duration: duration * 0.5,
      p95Duration: duration * 0.95,
      p99Duration: duration * 0.99,
      avgMemory: metrics.memory?.heapUsed,
      sampleCount: 1,
      lastUpdated: new Date(),
    });
  }
}

/**
 * Gets a performance baseline for an operation.
 * 
 * @param operation - Operation name/identifier
 * @returns Baseline or undefined if not found
 */
export function getBaseline(operation: string): PerformanceBaseline | undefined {
  return baselines.get(operation);
}

/**
 * Compares current performance metrics against baseline.
 * 
 * @param operation - Operation name/identifier
 * @param current - Current performance metrics
 * @returns Comparison result or undefined if no baseline exists
 */
export function compareToBaseline(
  operation: string,
  current: PerformanceMetrics
): PerformanceComparison | undefined {
  const baseline = baselines.get(operation);
  if (!baseline) {
    return undefined;
  }
  
  const currentDuration = current.duration || 0;
  const durationDelta = currentDuration - baseline.avgDuration;
  const durationPercentChange = baseline.avgDuration > 0
    ? (durationDelta / baseline.avgDuration) * 100
    : 0;
  
  // Determine if degraded and severity
  let degraded = false;
  let severity: 'none' | 'minor' | 'major' | 'critical' = 'none';
  let alertThreshold: 'p50' | 'p95' | 'p99' | undefined;
  
  if (currentDuration > baseline.p99Duration) {
    degraded = true;
    severity = 'critical';
    alertThreshold = 'p99';
  } else if (currentDuration > baseline.p95Duration) {
    degraded = true;
    severity = 'major';
    alertThreshold = 'p95';
  } else if (currentDuration > baseline.p50Duration) {
    degraded = true;
    severity = 'minor';
    alertThreshold = 'p50';
  }
  
  return {
    operation,
    current,
    baseline,
    durationDelta,
    durationPercentChange,
    degraded,
    severity,
    alertThreshold,
  };
}

/**
 * Checks if performance has degraded and should alert.
 * 
 * @param operation - Operation name/identifier
 * @param current - Current performance metrics
 * @param threshold - Alert threshold ('p50', 'p95', 'p99', default: 'p95')
 * @returns True if performance degraded beyond threshold
 */
export function shouldAlert(
  operation: string,
  current: PerformanceMetrics,
  threshold: 'p50' | 'p95' | 'p99' = 'p95'
): boolean {
  const comparison = compareToBaseline(operation, current);
  if (!comparison) {
    return false;
  }
  
  const baselineValue = threshold === 'p50' 
    ? comparison.baseline.p50Duration
    : threshold === 'p95'
    ? comparison.baseline.p95Duration
    : comparison.baseline.p99Duration;
  
  return (current.duration || 0) > baselineValue;
}

/**
 * Gets all baselines.
 */
export function getAllBaselines(): PerformanceBaseline[] {
  return Array.from(baselines.values());
}

/**
 * Clears all baselines (useful for testing).
 */
export function clearBaselines(): void {
  baselines.clear();
}

