/**
 * Message Queue logging integration.
 * 
 * Provides utilities for logging message queue operations (RabbitMQ, Kafka, etc.).
 */

import type { Logger } from '../logger';
import { setLogContext, getLogContext } from '../context';
import { extractContextFromMessage, injectContextToMessage } from '../helpers/context-propagation';
import { createPerformanceMetrics } from '../helpers/performance-tracking';

/**
 * Message queue operation types.
 */
export type MessageQueueOperation = 'publish' | 'consume' | 'ack' | 'nack' | 'reject';

/**
 * Message queue information.
 */
export interface MessageQueueInfo {
  /** Queue/exchange name */
  queueName: string;
  /** Routing key (if applicable) */
  routingKey?: string;
  /** Operation type */
  operation: MessageQueueOperation;
  /** Message size in bytes */
  messageSize?: number;
  /** Message ID */
  messageId?: string;
  /** Correlation ID */
  correlationId?: string;
  /** Retry count */
  retryCount?: number;
  /** Queue system (rabbitmq, kafka, etc.) */
  queueSystem?: string;
}

/**
 * Logs a message queue operation.
 * 
 * @param logger - Logger instance
 * @param info - Message queue operation information
 * @param duration - Operation duration in milliseconds
 * @param error - Error (if any)
 */
export async function logMessageQueueOperation(
  logger: Logger,
  info: MessageQueueInfo,
  duration: number,
  error?: Error
): Promise<void> {
  const context = getLogContext() || {};
  
  // Extract context from message if available
  const messageContext = info.correlationId 
    ? extractContextFromMessage({ correlation_id: info.correlationId })
    : {};
  
  // Create performance metrics
  const performanceMetrics = await createPerformanceMetrics(duration);
  
  // Set context for message queue operation
  setLogContext({
    ...context,
    ...messageContext,
    source: 'system',
    action: `mq_${info.operation}`,
    component: 'message_queue',
    correlationId: info.correlationId || context.correlationId,
    performanceMetrics,
    tags: {
      ...context.tags,
      queue_name: info.queueName,
      queue_system: info.queueSystem || 'unknown',
      operation: info.operation,
    },
  });
  
  const level = error ? 'error' : 'info';
  const message = `MQ ${info.operation}: ${info.queueName}${info.routingKey ? ` (${info.routingKey})` : ''}`;
  
  logger[level](message, error, {
    message_queue: {
      queueName: info.queueName,
      routingKey: info.routingKey,
      operation: info.operation,
      messageSize: info.messageSize,
      messageId: info.messageId,
      correlationId: info.correlationId,
      retryCount: info.retryCount,
      queueSystem: info.queueSystem,
      duration,
    },
  });
}

/**
 * Injects context into message metadata for propagation.
 * 
 * @param context - Log context to inject
 * @param messageMetadata - Message metadata object (mutated)
 * @returns Message metadata with context injected
 */
export function injectContextToQueueMessage(
  context: Partial<import('../types/context').LogContext>,
  messageMetadata: Record<string, unknown> = {}
): Record<string, unknown> {
  return injectContextToMessage(context, messageMetadata);
}

