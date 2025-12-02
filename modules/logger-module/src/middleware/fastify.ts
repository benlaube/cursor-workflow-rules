/**
 * Fastify plugin for automatic request/response logging.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { Logger } from '../logger';
import { setRequestContext, updateResponseContext, calculateDuration, type RequestInfo, type ResponseInfo } from './base';
import { logApiCall } from '../helpers/log-api-call';
import { getOpenTelemetryTraceId } from '../tracing/opentelemetry';

/**
 * Creates a Fastify plugin for logging.
 * 
 * @param logger - Logger instance
 * @returns Fastify plugin function
 */
export function createFastifyPlugin(logger: Logger) {
  return async (fastify: FastifyInstance) => {
    fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();
      (request as any).startTime = startTime;
      
      // Get trace ID if available
      const traceId = getOpenTelemetryTraceId();
      
      // Get IP address
      const ipAddress = request.ip ||
        (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (request.headers['x-real-ip'] as string) ||
        request.socket?.remoteAddress;
      
      // Calculate request size
      const contentLength = request.headers['content-length'];
      const requestSize = contentLength 
        ? parseInt(String(contentLength), 10) 
        : request.body 
          ? JSON.stringify(request.body).length 
          : undefined;
      
      // Set request context
      const requestInfo: RequestInfo = {
        method: request.method,
        path: request.url,
        url: request.url,
        headers: request.headers as Record<string, string>,
        query: request.query as Record<string, unknown>,
        body: request.body,
        ipAddress,
        requestSize,
      };
      
      setRequestContext(requestInfo, traceId);
      
      // Log request
      logApiCall(
        logger,
        'debug',
        `HTTP Request: ${request.method} ${request.url}`,
        'user',
        request.url,
        request.method,
        {
          userAgent: request.headers['user-agent'],
        }
      );
    });
    
    fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = (request as any).startTime || Date.now();
      const duration = calculateDuration(startTime);
      
      // Calculate response size
      const contentLength = reply.getHeader('content-length');
      const responseSize = contentLength 
        ? parseInt(String(contentLength), 10) 
        : undefined;
      
      // Update context with response info
      const responseInfo: ResponseInfo = {
        statusCode: reply.statusCode,
        duration,
        headers: reply.getHeaders() as Record<string, string>,
        responseSize,
      };
      
      await updateResponseContext(responseInfo, startTime);
      
      // Log response
      const level = reply.statusCode >= 500 ? 'error' : reply.statusCode >= 400 ? 'warn' : 'info';
      
      logApiCall(
        logger,
        level,
        `HTTP Response: ${request.method} ${request.url} | Status: ${reply.statusCode} | Duration: ${duration}ms`,
        'user',
        request.url,
        request.method,
        {
          statusCode: reply.statusCode,
          duration,
          bytesOut: responseSize,
        }
      );
    });
  };
}

