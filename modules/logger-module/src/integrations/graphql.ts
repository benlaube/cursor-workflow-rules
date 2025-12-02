/**
 * GraphQL logging integration.
 * 
 * Provides middleware and utilities for logging GraphQL queries, mutations, and resolvers.
 */

import type { Logger } from '../logger';
import type { LogContext } from '../types/context';
import { setLogContext, getLogContext } from '../context';
import { createPerformanceMetrics } from '../helpers/performance-tracking';

/**
 * GraphQL operation information.
 */
export interface GraphQLOperation {
  /** Operation name */
  operationName?: string;
  /** Operation type (query, mutation, subscription) */
  operationType: 'query' | 'mutation' | 'subscription';
  /** GraphQL query string */
  query: string;
  /** Variables */
  variables?: Record<string, unknown>;
  /** Field names being accessed */
  fieldNames?: string[];
}

/**
 * GraphQL resolver information.
 */
export interface GraphQLResolver {
  /** Resolver name (field name) */
  fieldName: string;
  /** Parent type */
  parentType: string;
  /** Return type */
  returnType: string;
  /** Arguments */
  args?: Record<string, unknown>;
}

/**
 * Logs a GraphQL operation (query, mutation, subscription).
 * 
 * @param logger - Logger instance
 * @param operation - GraphQL operation information
 * @param duration - Operation duration in milliseconds
 * @param errors - GraphQL errors (if any)
 */
export async function logGraphQLOperation(
  logger: Logger,
  operation: GraphQLOperation,
  duration: number,
  errors?: Array<{ message: string; path?: (string | number)[] }>
): Promise<void> {
  const context = getLogContext() || {};
  
  // Create performance metrics
  const performanceMetrics = await createPerformanceMetrics(duration);
  
  // Set context for GraphQL operation
  setLogContext({
    ...context,
    source: 'user',
    action: `graphql_${operation.operationType}`,
    component: 'graphql',
    performanceMetrics,
    tags: {
      ...context.tags,
      operation_name: operation.operationName || 'anonymous',
      operation_type: operation.operationType,
    },
  });
  
  const level = errors && errors.length > 0 ? 'error' : 'info';
  const message = `GraphQL ${operation.operationType}: ${operation.operationName || 'anonymous'}`;
  
  logger[level](message, undefined, {
    graphql: {
      operationName: operation.operationName,
      operationType: operation.operationType,
      query: operation.query,
      variables: operation.variables,
      fieldNames: operation.fieldNames,
      duration,
      errors,
    },
  });
}

/**
 * Logs a GraphQL resolver execution.
 * 
 * @param logger - Logger instance
 * @param resolver - Resolver information
 * @param duration - Resolver duration in milliseconds
 * @param error - Error (if any)
 */
export async function logGraphQLResolver(
  logger: Logger,
  resolver: GraphQLResolver,
  duration: number,
  error?: Error
): Promise<void> {
  const context = getLogContext() || {};
  
  // Create performance metrics
  const performanceMetrics = await createPerformanceMetrics(duration);
  
  // Set context for resolver
  setLogContext({
    ...context,
    source: 'system',
    action: 'graphql_resolver',
    component: 'graphql',
    performanceMetrics,
    tags: {
      ...context.tags,
      resolver_field: resolver.fieldName,
      resolver_parent: resolver.parentType,
    },
  });
  
  const level = error ? 'error' : 'debug';
  const message = `GraphQL resolver: ${resolver.parentType}.${resolver.fieldName}`;
  
  logger[level](message, error, {
    graphql_resolver: {
      fieldName: resolver.fieldName,
      parentType: resolver.parentType,
      returnType: resolver.returnType,
      args: resolver.args,
      duration,
    },
  });
}

/**
 * Creates GraphQL logging middleware for Apollo Server.
 * 
 * @param logger - Logger instance
 * @returns Apollo Server plugin
 */
export function createGraphQLLoggingPlugin(logger: Logger) {
  return {
    requestDidStart() {
      const startTime = Date.now();
      let operation: GraphQLOperation | undefined;
      
      return {
        didResolveOperation(requestContext: any) {
          operation = {
            operationName: requestContext.operationName,
            operationType: requestContext.operation.operation as 'query' | 'mutation' | 'subscription',
            query: requestContext.request.query,
            variables: requestContext.request.variables,
            fieldNames: requestContext.operation.selectionSet?.selections?.map((s: any) => s.name?.value),
          };
        },
        
        willSendResponse(requestContext: any) {
          const duration = Date.now() - startTime;
          const errors = requestContext.errors;
          
          if (operation) {
            logGraphQLOperation(logger, operation, duration, errors);
          }
        },
      };
    },
  };
}

