/**
 * Standalone Log Viewer Service
 * 
 * Creates a standalone Express server for viewing logs.
 * Can run on a separate port from your main application.
 */

import express from 'express';
import { createLogViewerRouter, type LogViewerOptions } from './express';

export interface StandaloneLogViewerOptions extends LogViewerOptions {
  /** Port to run the service on (default: 3001) */
  port?: number;
  /** Enable CORS (default: true) */
  enableCors?: boolean;
  /** Custom Express app instance (optional) */
  app?: express.Application;
}

/**
 * Creates and starts a standalone log viewer service.
 * 
 * @param options - Log viewer configuration
 * @returns Express app instance
 * 
 * @example
 * ```typescript
 * import { startLogViewer } from './modules/logger-module/viewer/standalone';
 * 
 * startLogViewer({
 *   logDir: './logs',
 *   port: 3001,
 *   enableDatabase: true,
 *   supabaseClient: supabase,
 * });
 * // Service running at http://localhost:3001/logs
 * ```
 */
export function startLogViewer(options: StandaloneLogViewerOptions = {}): express.Application {
  const port = options.port || parseInt(process.env.LOG_VIEWER_PORT || '3001', 10);
  const app = options.app || express();
  
  // Enable CORS by default
  if (options.enableCors !== false) {
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
  }
  
  // JSON body parser
  app.use(express.json());
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'log-viewer', port });
  });
  
  // Log viewer routes
  const logViewerRouter = createLogViewerRouter(options);
  app.use('/logs', logViewerRouter);
  
  // Root redirect to /logs
  app.get('/', (req, res) => {
    res.redirect('/logs');
  });
  
  // Start server if not using custom app
  if (!options.app) {
    app.listen(port, () => {
      console.log(`Log viewer service running on http://localhost:${port}`);
      console.log(`  - View logs: http://localhost:${port}/logs`);
      console.log(`  - List files: http://localhost:${port}/logs/files`);
      console.log(`  - Summary: http://localhost:${port}/logs/summary`);
      if (options.enableDatabase) {
        console.log(`  - Database logs: http://localhost:${port}/logs/database`);
      }
    });
  }
  
  return app;
}

