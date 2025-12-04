/**
 * Next.js Log Viewer Router Helper
 * 
 * Provides flexible route configuration for Next.js App Router and Pages Router.
 * Supports both patterns for maximum compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { LogViewerOptions } from './index';
import { GET, GET_FILES, GET_FILE, GET_DATABASE, GET_SUMMARY, GET_UI } from './nextjs';

/**
 * Next.js App Router route configuration.
 * 
 * Use this in your Next.js App Router route files:
 * 
 * @example
 * ```typescript
 * // app/api/logs/route.ts
 * import { createNextJsLogViewerRoutes } from './modules/logger-module/viewer/nextjs-router';
 * 
 * const options = {
 *   logDir: './logs',
 *   enableDatabase: true,
 *   supabaseClient: supabase,
 * };
 * 
 * export const GET = createNextJsLogViewerRoutes(options).GET;
 * ```
 * 
 * @example
 * ```typescript
 * // app/api/logs/files/route.ts
 * import { createNextJsLogViewerRoutes } from './modules/logger-module/viewer/nextjs-router';
 * 
 * export const GET = createNextJsLogViewerRoutes().GET_FILES;
 * ```
 * 
 * @example
 * ```typescript
 * // app/api/logs/files/[filename]/route.ts
 * import { createNextJsLogViewerRoutes } from './modules/logger-module/viewer/nextjs-router';
 * 
 * export async function GET(
 *   request: NextRequest,
 *   { params }: { params: { filename: string } }
 * ) {
 *   return createNextJsLogViewerRoutes().GET_FILE(request, { params });
 * }
 * ```
 */
export function createNextJsLogViewerRoutes(options?: LogViewerOptions) {
  return {
    /**
     * GET /api/logs
     * Get analyzed logs with summary.
     */
    GET: (request: NextRequest) => GET(request),

    /**
     * GET /api/logs/files
     * List available log files.
     */
    GET_FILES: (request: NextRequest) => GET_FILES(request),

    /**
     * GET /api/logs/files/[filename]
     * Get content of a specific log file.
     */
    GET_FILE: (request: NextRequest, { params }: { params: { filename: string } }) =>
      GET_FILE(request, { params }),

    /**
     * GET /api/logs/database
     * Query database logs (if enabled).
     */
    GET_DATABASE: (request: NextRequest) => GET_DATABASE(request, options),

    /**
     * GET /api/logs/summary
     * Get summary statistics.
     */
    GET_SUMMARY: (request: NextRequest) => GET_SUMMARY(request, options),

    /**
     * GET /api/logs/ui
     * Serves the HTML log viewer interface.
     */
    GET_UI: () => GET_UI(),
  };
}

/**
 * Individual route handlers for flexible usage.
 * 
 * Use these when you need more control over route configuration.
 */
export const nextJsLogViewerHandlers = {
  GET,
  GET_FILES,
  GET_FILE,
  GET_DATABASE,
  GET_SUMMARY,
  GET_UI,
};

/**
 * Pages Router API handler (for Next.js Pages Router).
 * 
 * Use this in your Pages Router API routes:
 * 
 * @example
 * ```typescript
 * // pages/api/logs/index.ts
 * import { createPagesRouterHandler } from './modules/logger-module/viewer/nextjs-router';
 * 
 * export default createPagesRouterHandler({
 *   logDir: './logs',
 *   enableDatabase: true,
 *   supabaseClient: supabase,
 * });
 * ```
 */
export function createPagesRouterHandler(options?: LogViewerOptions) {
  return async (req: any, res: any) => {
    const request = new NextRequest(req.url, {
      method: req.method,
      headers: req.headers,
    });

    try {
      let response: NextResponse;

      if (req.url.includes('/files/') && req.query.filename) {
        // Handle /api/logs/files/[filename]
        response = await GET_FILE(request, { params: { filename: req.query.filename } });
      } else if (req.url.includes('/files')) {
        // Handle /api/logs/files
        response = await GET_FILES(request);
      } else if (req.url.includes('/database')) {
        // Handle /api/logs/database
        response = await GET_DATABASE(request, options);
      } else if (req.url.includes('/summary')) {
        // Handle /api/logs/summary
        response = await GET_SUMMARY(request, options);
      } else if (req.url.includes('/ui')) {
        // Handle /api/logs/ui
        response = GET_UI();
      } else {
        // Handle /api/logs
        response = await GET(request);
      }

      // Convert NextResponse to Pages Router response
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const body = await response.text();
      res.send(body);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          code: 'LOG_VIEWER_ERROR',
        },
      });
    }
  };
}

