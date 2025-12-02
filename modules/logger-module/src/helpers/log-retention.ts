/**
 * Log retention and archival utilities.
 * 
 * Provides helpers for managing log retention policies and archival.
 */

/**
 * Retention policy configuration.
 */
export interface RetentionPolicy {
  /** Retention period in days */
  retentionDays: number;
  /** Whether to archive before deletion */
  archiveBeforeDelete: boolean;
  /** Archive location (S3, GCS, etc.) */
  archiveLocation?: string;
  /** Compression format (gzip, zip, etc.) */
  compressionFormat?: 'gzip' | 'zip' | 'none';
}

/**
 * Default retention policies by log level.
 */
export const DEFAULT_RETENTION_POLICIES: Record<string, RetentionPolicy> = {
  // High-severity logs: keep longer
  fatal: {
    retentionDays: 2555, // 7 years
    archiveBeforeDelete: true,
  },
  error: {
    retentionDays: 1095, // 3 years
    archiveBeforeDelete: true,
  },
  // Medium-severity logs
  warn: {
    retentionDays: 365, // 1 year
    archiveBeforeDelete: false,
  },
  // Low-severity logs
  info: {
    retentionDays: 90, // 3 months
    archiveBeforeDelete: false,
  },
  debug: {
    retentionDays: 30, // 1 month
    archiveBeforeDelete: false,
  },
  trace: {
    retentionDays: 7, // 1 week
    archiveBeforeDelete: false,
  },
  // Audit logs: keep longest
  audit: {
    retentionDays: 2555, // 7 years
    archiveBeforeDelete: true,
  },
};

/**
 * Gets retention policy for a log level.
 * 
 * @param level - Log level
 * @param customPolicies - Custom retention policies (optional)
 * @returns Retention policy
 */
export function getRetentionPolicy(
  level: string,
  customPolicies?: Record<string, RetentionPolicy>
): RetentionPolicy {
  const policies = customPolicies || DEFAULT_RETENTION_POLICIES;
  return policies[level] || policies.info || { retentionDays: 90, archiveBeforeDelete: false };
}

/**
 * Checks if a log entry should be archived based on retention policy.
 * 
 * @param timestamp - Log entry timestamp
 * @param level - Log level
 * @param customPolicies - Custom retention policies (optional)
 * @returns True if should be archived
 */
export function shouldArchive(
  timestamp: Date | string,
  level: string,
  customPolicies?: Record<string, RetentionPolicy>
): boolean {
  const policy = getRetentionPolicy(level, customPolicies);
  if (!policy.archiveBeforeDelete) {
    return false;
  }
  
  const logDate = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const ageDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Archive when log is 80% of retention period old
  const archiveThreshold = policy.retentionDays * 0.8;
  return ageDays >= archiveThreshold;
}

/**
 * Checks if a log entry should be deleted based on retention policy.
 * 
 * @param timestamp - Log entry timestamp
 * @param level - Log level
 * @param customPolicies - Custom retention policies (optional)
 * @returns True if should be deleted
 */
export function shouldDelete(
  timestamp: Date | string,
  level: string,
  customPolicies?: Record<string, RetentionPolicy>
): boolean {
  const policy = getRetentionPolicy(level, customPolicies);
  const logDate = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const ageDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return ageDays >= policy.retentionDays;
}

/**
 * Generates archive filename for a date range.
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @param level - Log level (optional)
 * @returns Archive filename
 */
export function generateArchiveFilename(
  startDate: Date,
  endDate: Date,
  level?: string
): string {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  const levelPart = level ? `-${level}` : '';
  return `logs${levelPart}-${start}-to-${end}.json.gz`;
}

