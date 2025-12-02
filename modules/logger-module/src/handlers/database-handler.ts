/**
 * Database handler for batched log persistence (Universal).
 * 
 * Supports Supabase integration and generic callback-based persistence.
 * Uses runtime-aware batching (Node.js: 50/5s, Edge: 25/2s, Browser: 50/5s).
 */

import { getRuntime, hasFeature } from '../utils/environment';
import type { LogEntry } from '../types/logger';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RetryConfig } from '../types/options';

export interface DatabaseHandlerOptions {
  level: string;
  supabaseClient?: SupabaseClient;
  persistLog?: (logEntry: LogEntry) => Promise<void>;
  batchSize?: number;
  flushInterval?: number;
  maxQueueSize?: number;
  retryConfig?: RetryConfig;
}

/**
 * Database log handler with batching support.
 */
export class DatabaseLogHandler {
  private batchQueue: LogEntry[] = [];
  private batchSize: number;
  private flushInterval: number;
  private maxQueueSize: number;
  private retryConfig: Required<RetryConfig>;
  private flushTimer: ReturnType<typeof setInterval> | ReturnType<typeof setTimeout> | null = null;
  private isFlushing: boolean = false;
  private supabaseClient?: SupabaseClient;
  private persistLog?: (logEntry: LogEntry) => Promise<void>;
  private runtime: 'node' | 'browser' | 'edge';

  constructor(options: DatabaseHandlerOptions) {
    this.runtime = getRuntime();
    
    // Set runtime-aware defaults
    this.batchSize = options.batchSize || (this.runtime === 'edge' ? 25 : 50);
    this.flushInterval = options.flushInterval || (this.runtime === 'edge' ? 2000 : 5000);
    this.maxQueueSize = options.maxQueueSize || (this.runtime === 'edge' ? 100 : 1000);
    
    this.retryConfig = {
      maxRetries: options.retryConfig?.maxRetries || 3,
      initialDelay: options.retryConfig?.initialDelay || 1000,
      maxDelay: options.retryConfig?.maxDelay || 30000,
    };
    
    this.supabaseClient = options.supabaseClient;
    this.persistLog = options.persistLog;
    
    // Start background flush
    this.start();
  }

  /**
   * Adds a log entry to the batch queue.
   */
  addLogEntry(entry: LogEntry): void {
    // Check backpressure
    if (this.batchQueue.length >= this.maxQueueSize) {
      // Drop oldest entries or log warning
      this.batchQueue.shift();
    }
    
    this.batchQueue.push(entry);
    
    // Auto-flush if batch size reached
    if (this.batchQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Starts the background flush timer.
   */
  start(): void {
    if (this.flushTimer) {
      return; // Already started
    }
    
    if (this.runtime === 'browser' && hasFeature('requestIdleCallback')) {
      // Use requestIdleCallback in browser
      const scheduleFlush = () => {
        if (this.batchQueue.length > 0) {
          this.flush();
        }
        this.flushTimer = requestIdleCallback(scheduleFlush, { timeout: this.flushInterval });
      };
      this.flushTimer = requestIdleCallback(scheduleFlush, { timeout: this.flushInterval });
    } else {
      // Use setInterval/setTimeout
      const scheduleFlush = () => {
        if (this.batchQueue.length > 0) {
          this.flush();
        }
        this.flushTimer = setTimeout(scheduleFlush, this.flushInterval);
      };
      this.flushTimer = setTimeout(scheduleFlush, this.flushInterval);
    }
  }

  /**
   * Stops the background flush timer and flushes remaining logs.
   */
  async stop(): Promise<void> {
    if (this.flushTimer) {
      if (this.runtime === 'browser' && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(this.flushTimer as number);
      } else {
        clearTimeout(this.flushTimer as ReturnType<typeof setTimeout>);
      }
      this.flushTimer = null;
    }
    
    // Flush remaining logs
    await this.flush();
  }

  /**
   * Flushes the batch queue to the database.
   */
  async flush(): Promise<void> {
    if (this.isFlushing || this.batchQueue.length === 0) {
      return;
    }
    
    this.isFlushing = true;
    const batch = this.batchQueue.splice(0, this.batchSize);
    
    try {
      await this.flushBatch(batch);
    } catch (error) {
      // Retry with exponential backoff
      await this.retryFlush(batch);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Flushes a batch of logs.
   */
  private async flushBatch(batch: LogEntry[]): Promise<void> {
    if (this.supabaseClient) {
      // Use Supabase
      const { error } = await this.supabaseClient
        .from('logs')
        .insert(batch);
      
      if (error) {
        throw error;
      }
    } else if (this.persistLog) {
      // Use generic callback
      await Promise.all(batch.map(entry => this.persistLog!(entry)));
    } else {
      // No persistence method configured
      throw new Error('No database handler configured');
    }
  }

  /**
   * Retries flushing with exponential backoff.
   */
  private async retryFlush(batch: LogEntry[], attempt: number = 1): Promise<void> {
    if (attempt > this.retryConfig.maxRetries) {
      console.error('Failed to flush logs after max retries', { batchSize: batch.length });
      return;
    }
    
    const delay = Math.min(
      this.retryConfig.initialDelay * Math.pow(2, attempt - 1),
      this.retryConfig.maxDelay
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      await this.flushBatch(batch);
    } catch (error) {
      await this.retryFlush(batch, attempt + 1);
    }
  }
}

/**
 * Creates a database handler instance.
 */
export function createDatabaseHandler(options: DatabaseHandlerOptions): DatabaseLogHandler {
  return new DatabaseLogHandler(options);
}

