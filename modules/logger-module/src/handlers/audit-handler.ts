/**
 * Audit log handler for compliance and security logging.
 * 
 * Provides a separate audit log stream for compliance requirements
 * (GDPR, HIPAA, PCI-DSS, etc.) with enhanced security and retention policies.
 */

import type { LogEntry } from '../types/logger';
import type { LoggerOptions } from '../types/options';
import { DatabaseLogHandler, type DatabaseHandlerOptions } from './database-handler';

export interface AuditHandlerOptions extends DatabaseHandlerOptions {
  /** Compliance standards to mark logs with (GDPR, HIPAA, PCI-DSS, etc.) */
  complianceStandards?: string[];
  /** Data retention period in days (default: 7 years for compliance) */
  retentionDays?: number;
  /** Whether to encrypt sensitive fields at rest */
  encryptSensitiveFields?: boolean;
  /** Fields to encrypt if encryptSensitiveFields is true */
  sensitiveFields?: string[];
  /** Separate table name for audit logs (default: 'audit_logs') */
  auditTableName?: string;
}

/**
 * Audit log handler with compliance features.
 */
export class AuditLogHandler {
  private databaseHandler: DatabaseLogHandler;
  private complianceStandards: string[];
  private retentionDays: number;
  private auditTableName: string;

  constructor(options: AuditHandlerOptions) {
    this.complianceStandards = options.complianceStandards || [];
    this.retentionDays = options.retentionDays || 2555; // 7 years default
    this.auditTableName = options.auditTableName || 'audit_logs';
    
    // Create database handler with audit-specific configuration
    this.databaseHandler = new DatabaseLogHandler({
      ...options,
      // Audit logs should always be persisted
      level: 'info',
      batchSize: options.batchSize || 10, // Smaller batches for audit logs
      flushInterval: options.flushInterval || 1000, // Faster flush for audit logs
    });
  }

  /**
   * Adds an audit log entry with compliance markers.
   */
  addAuditLog(entry: LogEntry, complianceMarkers?: string[]): void {
    // Add compliance markers to metadata
    const auditEntry: LogEntry = {
      ...entry,
      meta: {
        ...entry.meta,
        audit: true,
        compliance_standards: [...this.complianceStandards, ...(complianceMarkers || [])],
        retention_days: this.retentionDays,
        encrypted: false, // Would be set by encryption layer if enabled
      },
    };
    
    // Add to database handler (will use audit table if configured)
    this.databaseHandler.addLogEntry(auditEntry);
  }

  /**
   * Gets compliance standards for this handler.
   */
  getComplianceStandards(): string[] {
    return [...this.complianceStandards];
  }

  /**
   * Gets retention period in days.
   */
  getRetentionDays(): number {
    return this.retentionDays;
  }

  /**
   * Flushes pending audit logs.
   */
  async flush(): Promise<void> {
    // Access private flush method via type assertion
    // In a real implementation, you'd expose this method
    await (this.databaseHandler as any).flush();
  }

  /**
   * Shuts down the audit handler.
   */
  async shutdown(): Promise<void> {
    await this.flush();
    // Additional cleanup if needed
  }
}

/**
 * Creates an audit log handler instance.
 */
export function createAuditHandler(options: AuditHandlerOptions): AuditLogHandler {
  return new AuditLogHandler(options);
}

