/**
 * Express.js Log Viewer Middleware
 * 
 * Adds /logs routes to Express applications for viewing and analyzing logs.
 */

import express, { Request, Response, Router } from 'express';
import { getAnalyzedLogs, getLogFiles, getLogFileContent, queryDatabaseLogs, type LogViewerOptions } from './index';

/**
 * Creates Express router with log viewer routes.
 * 
 * @param options - Log viewer configuration
 * @returns Express router with /logs routes
 * 
 * @example
 * ```typescript
 * import express from 'express';
 * import { createLogViewerRouter } from './modules/logger-module/viewer/express';
 * 
 * const app = express();
 * const logViewer = createLogViewerRouter({
 *   logDir: './logs',
 *   enableDatabase: true,
 *   supabaseClient: supabase,
 * });
 * 
 * app.use('/logs', logViewer);
 * // Now accessible at http://localhost:3000/logs
 * ```
 */
export function createLogViewerRouter(options: LogViewerOptions = {}): Router {
  const router = Router();
  
  /**
   * GET /logs
   * Get analyzed logs with summary.
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const timeRange = req.query.timeRange ? parseInt(req.query.timeRange as string) : undefined;
      const minLevel = req.query.minLevel as 'error' | 'fatal' | 'warn' | 'info' | undefined;
      
      const result = await getAnalyzedLogs({
        ...options,
        maxEntries: limit || options.maxEntries,
        timeRange: timeRange || options.timeRange,
        minLevel: minLevel || options.minLevel,
      });
      
      res.json({
        success: true,
        data: result.errors,
        summary: result.summary,
        meta: {
          logDir: options.logDir || './logs',
          maxEntries: limit || options.maxEntries,
          timeRange: timeRange || options.timeRange,
          minLevel: minLevel || options.minLevel,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          code: 'LOG_VIEWER_ERROR',
        },
      });
    }
  });
  
  /**
   * GET /logs/files
   * List available log files.
   */
  router.get('/files', async (req: Request, res: Response) => {
    try {
      const logDir = options.logDir || './logs';
      const files = await getLogFiles(logDir);
      
      const fileInfo = files.map(file => {
        const stats = require('fs').statSync(file);
        return {
          path: file,
          name: require('path').basename(file),
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      });
      
      res.json({
        success: true,
        data: fileInfo,
        meta: {
          logDir,
          count: fileInfo.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          code: 'LOG_FILES_ERROR',
        },
      });
    }
  });
  
  /**
   * GET /logs/files/:filename
   * Get content of a specific log file.
   */
  router.get('/files/:filename', async (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      const logDir = options.logDir || './logs';
      const filePath = require('path').join(logDir, filename);
      
      // Security: ensure file is within log directory
      const resolvedPath = require('path').resolve(filePath);
      const resolvedLogDir = require('path').resolve(logDir);
      if (!resolvedPath.startsWith(resolvedLogDir)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
            code: 'ACCESS_DENIED',
          },
        });
      }
      
      const lines = req.query.lines ? parseInt(req.query.lines as string) : undefined;
      const content = await getLogFileContent(filePath, lines);
      
      res.json({
        success: true,
        data: {
          filename,
          path: filePath,
          content,
          lines: lines || content.split('\n').length,
        },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: 'LOG_FILE_NOT_FOUND',
        },
      });
    }
  });
  
  /**
   * GET /logs/database
   * Query database logs (if enabled).
   */
  router.get('/database', async (req: Request, res: Response) => {
    if (!options.enableDatabase || !options.supabaseClient) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Database logging not enabled',
          code: 'DATABASE_NOT_ENABLED',
        },
      });
    }
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const level = req.query.level as string | undefined;
      const component = req.query.component as string | undefined;
      
      const logs = await queryDatabaseLogs(options.supabaseClient, {
        limit,
        level,
        component,
      });
      
      res.json({
        success: true,
        data: logs,
        meta: {
          count: logs.length,
          limit,
          level,
          component,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          code: 'DATABASE_QUERY_ERROR',
        },
      });
    }
  });
  
  /**
   * GET /logs/summary
   * Get summary statistics.
   */
  router.get('/summary', async (req: Request, res: Response) => {
    try {
      const result = await getAnalyzedLogs(options);
      
      res.json({
        success: true,
        data: result.summary,
        meta: {
          logDir: options.logDir || './logs',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          code: 'LOG_SUMMARY_ERROR',
        },
      });
    }
  });
  
  return router;
}

