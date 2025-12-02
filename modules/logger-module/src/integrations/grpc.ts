/**
 * gRPC logging integration.
 * 
 * Provides middleware and utilities for logging gRPC calls and responses.
 */

import type { Logger } from '../logger';
import type { LogContext } from '../types/context';
import { setLogContext, getLogContext } from '../context';
import { createPerformanceMetrics } from '../helpers/performance-tracking';

/**
 * gRPC call information.
 */
export interface GRPCCall {
  /** Service name */
  service: string;
  /** Method name */
  method: string;
  /** Full method path (service.method) */
  methodPath: string;
  /** Request metadata */
  metadata?: Record<string, string>;
  /** Request payload (may be redacted) */
  request?: unknown;
  /** Response payload (may be redacted) */
  response?: unknown;
  /** Status code */
  statusCode?: number;
  /** Status message */
  statusMessage?: string;
}

/**
 * Logs a gRPC call.
 * 
 * @param logger - Logger instance
 * @param call - gRPC call information
 * @param duration - Call duration in milliseconds
 * @param error - Error (if any)
 */
export async function logGRPCCall(
  logger: Logger,
  call: GRPCCall,
  duration: number,
  error?: Error
): Promise<void> {
  const context = getLogContext() || {};
  
  // Create performance metrics
  const performanceMetrics = await createPerformanceMetrics(duration);
  
  // Set context for gRPC call
  setLogContext({
    ...context,
    source: 'system',
    action: 'grpc_call',
    component: 'grpc',
    endpoint: call.methodPath,
    performanceMetrics,
    tags: {
      ...context.tags,
      grpc_service: call.service,
      grpc_method: call.method,
    },
  });
  
  const level = error || (call.statusCode && call.statusCode !== 0) ? 'error' : 'info';
  const message = `gRPC call: ${call.methodPath}`;
  
  logger[level](message, error, {
    grpc: {
      service: call.service,
      method: call.method,
      methodPath: call.methodPath,
      metadata: call.metadata,
      statusCode: call.statusCode,
      statusMessage: call.statusMessage,
      duration,
    },
  });
}

/**
 * Creates gRPC logging interceptor.
 * 
 * @param logger - Logger instance
 * @returns gRPC interceptor function
 */
export function createGRPCInterceptor(logger: Logger) {
  return async (call: any, callback: any) => {
    const startTime = Date.now();
    const methodPath = `${call.service}/${call.method}`;
    
    try {
      const result = await callback();
      const duration = Date.now() - startTime;
      
      await logGRPCCall(logger, {
        service: call.service,
        method: call.method,
        methodPath,
        metadata: call.metadata?.getMap(),
        statusCode: 0, // Success
        response: result,
      }, duration);
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      await logGRPCCall(logger, {
        service: call.service,
        method: call.method,
        methodPath,
        metadata: call.metadata?.getMap(),
        statusCode: error.code || 2, // UNKNOWN
        statusMessage: error.message,
      }, duration, error);
      
      throw error;
    }
  };
}

