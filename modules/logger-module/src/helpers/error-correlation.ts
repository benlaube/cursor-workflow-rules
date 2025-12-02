/**
 * Error correlation utilities.
 * 
 * Provides helpers for linking related errors across services and
 * calculating error impact scores.
 */

import type { LogEntry } from '../types/logger';

/**
 * Error correlation information.
 */
export interface ErrorCorrelation {
  /** Correlation ID linking related errors */
  correlationId: string;
  /** Related error IDs */
  relatedErrorIds: string[];
  /** Service names involved */
  services: string[];
  /** First occurrence timestamp */
  firstOccurrence: Date;
  /** Last occurrence timestamp */
  lastOccurrence: Date;
  /** Total occurrence count */
  occurrenceCount: number;
  /** Affected user count (if available) */
  affectedUsers?: number;
}

/**
 * Error impact score calculation.
 */
export interface ErrorImpact {
  /** Impact score (0-100) */
  score: number;
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Factors contributing to score */
  factors: {
    /** Frequency factor (0-30) */
    frequency: number;
    /** User impact factor (0-30) */
    userImpact: number;
    /** Service impact factor (0-20) */
    serviceImpact: number;
    /** Duration factor (0-20) */
    duration: number;
  };
  /** Affected user count */
  affectedUsers: number;
  /** Affected services */
  affectedServices: string[];
}

/**
 * Stores error correlations (in-memory, should be persisted in production).
 */
const errorCorrelations = new Map<string, ErrorCorrelation>();

/**
 * Links related errors by correlation ID.
 * 
 * @param errorId - Current error ID
 * @param correlationId - Correlation ID
 * @param serviceName - Service name
 * @param userId - User ID (optional)
 */
export function linkError(
  errorId: string,
  correlationId: string,
  serviceName: string,
  userId?: string
): void {
  const existing = errorCorrelations.get(correlationId);
  const now = new Date();
  
  if (existing) {
    // Update existing correlation
    if (!existing.relatedErrorIds.includes(errorId)) {
      existing.relatedErrorIds.push(errorId);
    }
    if (!existing.services.includes(serviceName)) {
      existing.services.push(serviceName);
    }
    existing.lastOccurrence = now;
    existing.occurrenceCount += 1;
  } else {
    // Create new correlation
    errorCorrelations.set(correlationId, {
      correlationId,
      relatedErrorIds: [errorId],
      services: [serviceName],
      firstOccurrence: now,
      lastOccurrence: now,
      occurrenceCount: 1,
      affectedUsers: userId ? 1 : undefined,
    });
  }
}

/**
 * Gets error correlation for a correlation ID.
 * 
 * @param correlationId - Correlation ID
 * @returns Error correlation or undefined if not found
 */
export function getErrorCorrelation(correlationId: string): ErrorCorrelation | undefined {
  return errorCorrelations.get(correlationId);
}

/**
 * Calculates error impact score.
 * 
 * @param correlation - Error correlation
 * @param errorEntries - Related error log entries
 * @returns Error impact score
 */
export function calculateErrorImpact(
  correlation: ErrorCorrelation,
  errorEntries: LogEntry[]
): ErrorImpact {
  const now = new Date();
  const durationHours = (now.getTime() - correlation.firstOccurrence.getTime()) / (1000 * 60 * 60);
  
  // Frequency factor (0-30): Based on occurrence count and time span
  const frequencyRate = correlation.occurrenceCount / Math.max(durationHours, 1);
  const frequencyScore = Math.min(30, frequencyRate * 2); // Max 30 points
  
  // User impact factor (0-30): Based on affected users
  const affectedUsers = correlation.affectedUsers || 1;
  const userImpactScore = Math.min(30, Math.log10(affectedUsers + 1) * 10);
  
  // Service impact factor (0-20): Based on number of services affected
  const serviceImpactScore = Math.min(20, correlation.services.length * 5);
  
  // Duration factor (0-20): Based on how long the error has been occurring
  const durationScore = Math.min(20, durationHours / 24); // 1 day = 20 points
  
  const totalScore = frequencyScore + userImpactScore + serviceImpactScore + durationScore;
  
  // Determine severity
  let severity: 'low' | 'medium' | 'high' | 'critical';
  if (totalScore >= 80) {
    severity = 'critical';
  } else if (totalScore >= 60) {
    severity = 'high';
  } else if (totalScore >= 40) {
    severity = 'medium';
  } else {
    severity = 'low';
  }
  
  return {
    score: Math.min(100, Math.round(totalScore)),
    severity,
    factors: {
      frequency: Math.round(frequencyScore),
      userImpact: Math.round(userImpactScore),
      serviceImpact: Math.round(serviceImpactScore),
      duration: Math.round(durationScore),
    },
    affectedUsers,
    affectedServices: [...correlation.services],
  };
}

/**
 * Gets all error correlations.
 */
export function getAllErrorCorrelations(): ErrorCorrelation[] {
  return Array.from(errorCorrelations.values());
}

/**
 * Clears all error correlations (useful for testing).
 */
export function clearErrorCorrelations(): void {
  errorCorrelations.clear();
}

