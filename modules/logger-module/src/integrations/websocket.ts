/**
 * WebSocket logging integration.
 * 
 * Provides utilities for tracking WebSocket connections and messages.
 */

import type { Logger } from '../logger';
import { setLogContext, getLogContext } from '../context';
import { createPerformanceMetrics } from '../helpers/performance-tracking';

/**
 * WebSocket operation types.
 */
export type WebSocketOperation = 'connect' | 'disconnect' | 'message' | 'error' | 'close';

/**
 * WebSocket connection information.
 */
export interface WebSocketInfo {
  /** Connection ID */
  connectionId?: string;
  /** Operation type */
  operation: WebSocketOperation;
  /** Message size in bytes (if applicable) */
  messageSize?: number;
  /** Message count (for connection lifetime) */
  messageCount?: number;
  /** Duration in milliseconds (for connection lifetime) */
  duration?: number;
  /** Error (if any) */
  error?: Error;
  /** Close code (if disconnect/close) */
  closeCode?: number;
  /** Close reason (if disconnect/close) */
  closeReason?: string;
}

/**
 * Logs a WebSocket operation.
 * 
 * @param logger - Logger instance
 * @param info - WebSocket operation information
 */
export async function logWebSocketOperation(
  logger: Logger,
  info: WebSocketInfo
): Promise<void> {
  const context = getLogContext() || {};
  
  // Create performance metrics if duration provided
  const performanceMetrics = info.duration
    ? await createPerformanceMetrics(info.duration)
    : undefined;
  
  // Set context for WebSocket operation
  setLogContext({
    ...context,
    source: 'user',
    action: `ws_${info.operation}`,
    component: 'websocket',
    ...(performanceMetrics && { performanceMetrics }),
    tags: {
      ...context.tags,
      ws_connection_id: info.connectionId,
      ws_operation: info.operation,
    },
  });
  
  const level = info.error || info.operation === 'error' ? 'error' : 'info';
  const message = `WebSocket ${info.operation}${info.connectionId ? `: ${info.connectionId}` : ''}`;
  
  logger[level](message, info.error, {
    websocket: {
      connectionId: info.connectionId,
      operation: info.operation,
      messageSize: info.messageSize,
      messageCount: info.messageCount,
      duration: info.duration,
      closeCode: info.closeCode,
      closeReason: info.closeReason,
    },
  });
}

