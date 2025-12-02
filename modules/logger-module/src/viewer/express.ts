/**
 * Express.js Log Viewer Middleware
 * 
 * Adds /logs routes to Express applications for viewing and analyzing logs.
 */

import express, { Request, Response, Router } from 'express';
import { getAnalyzedLogs, getLogFiles, getLogFileContent, queryDatabaseLogs, type LogViewerOptions } from './index';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Lightweight HTML log viewer page.
 */
function renderLogViewerPage(): string {
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Log Viewer</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: #111827;
      --card: #0b1224;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --border: #1e293b;
      --accent: #06b6d4;
      --warn: #f59e0b;
      --error: #f87171;
      --fatal: #ef4444;
      --success: #10b981;
      --notice: #60a5fa;
    }
    body {
      margin: 0;
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
      background: radial-gradient(circle at 20% 20%, rgba(6,182,212,0.08), transparent 25%), radial-gradient(circle at 80% 10%, rgba(96,165,250,0.06), transparent 22%), var(--bg);
      color: var(--text);
    }
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px 48px;
    }
    h1 { margin: 0 0 12px; font-size: 22px; }
    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.25);
    }
    .controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--muted); }
    select, input {
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--text);
      outline: none;
    }
    button {
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--accent);
      color: #0b1224;
      font-weight: 600;
      cursor: pointer;
    }
    .logs {
      margin-top: 12px;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    .row {
      display: grid;
      grid-template-columns: 120px 90px 110px 1fr;
      gap: 12px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      background: var(--card);
    }
    .row:nth-child(odd) { background: rgba(255,255,255,0.02); }
    .row:last-child { border-bottom: none; }
    .level {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.3px;
    }
    .level.trace, .level.debug { background: rgba(6,182,212,0.1); color: #5eead4; }
    .level.info { background: rgba(34,197,94,0.14); color: var(--success); }
    .level.notice, .level.user_action { background: rgba(96,165,250,0.14); color: var(--notice); }
    .level.success { background: rgba(16,185,129,0.12); color: var(--success); }
    .level.warn { background: rgba(245,158,11,0.16); color: var(--warn); }
    .level.failure, .level.error { background: rgba(248,113,113,0.18); color: var(--error); }
    .level.fatal { background: rgba(239,68,68,0.2); color: var(--fatal); }
    .meta { color: var(--muted); font-size: 12px; display: flex; flex-wrap: wrap; gap: 10px; }
    .message { white-space: pre-wrap; word-break: break-word; font-size: 13px; color: #e5e7eb; }
    .pill {
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(255,255,255,0.06);
      border: 1px solid var(--border);
      font-size: 11px;
      color: var(--muted);
    }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .small { font-size: 12px; color: var(--muted); }
    .empty { padding: 18px; text-align: center; color: var(--muted); }
  </style>
</head>
<body>
  <div class="page">
    <div class="flex-between">
      <div>
        <h1>Log Viewer</h1>
        <div class="small">Color-coded levels with client-side filters. Uses /logs/files endpoints.</div>
      </div>
      <button id="refreshBtn">Refresh</button>
    </div>
    <div class="panel">
      <div class="controls">
        <label>Log file
          <select id="fileSelect"></select>
        </label>
        <label>Level
          <select id="levelSelect">
            <option value="">All</option>
            <option>fatal</option><option>error</option><option>failure</option><option>warn</option>
            <option>notice</option><option>user_action</option><option>success</option>
            <option>info</option><option>debug</option><option>trace</option>
          </select>
        </label>
        <label>Component
          <input id="componentInput" placeholder="frontend, backend, worker..." />
        </label>
        <label>Text search
          <input id="searchInput" placeholder="message or metadata" />
        </label>
        <label>Limit lines
          <input id="limitInput" type="number" min="50" max="2000" value="400" />
        </label>
      </div>
      <div class="logs" id="logs"></div>
    </div>
  </div>
  <script>
    const fileSelect = document.getElementById('fileSelect');
    const levelSelect = document.getElementById('levelSelect');
    const componentInput = document.getElementById('componentInput');
    const searchInput = document.getElementById('searchInput');
    const limitInput = document.getElementById('limitInput');
    const logsEl = document.getElementById('logs');
    const refreshBtn = document.getElementById('refreshBtn');

    async function fetchFiles() {
      const res = await fetch('./files');
      const json = await res.json();
      if (!json.success) throw new Error('Failed to load files');
      fileSelect.innerHTML = '';
      json.data.forEach((f, idx) => {
        const opt = document.createElement('option');
        opt.value = f.name;
        opt.textContent = f.name;
        if (idx === 0) opt.selected = true;
        fileSelect.appendChild(opt);
      });
    }

    function colorForLevel(level) {
      const map = {
        fatal: 'fatal', error: 'error', failure: 'failure', warn: 'warn',
        notice: 'notice', user_action: 'notice', success: 'success',
        info: 'info', debug: 'debug', trace: 'debug'
      };
      return map[level] || 'info';
    }

    function renderRows(entries) {
      if (!entries.length) {
        logsEl.innerHTML = '<div class="empty">No logs found for current filters.</div>';
        return;
      }
      logsEl.innerHTML = entries.map(e => {
        const levelClass = colorForLevel(e.level);
        const metaBits = [];
        if (e.component) metaBits.push('component=' + e.component);
        if (e.source) metaBits.push('source=' + e.source);
        if (e.request_id) metaBits.push('req=' + e.request_id);
        if (e.trace_id) metaBits.push('trace=' + e.trace_id);
        if (e.user_id) metaBits.push('user=' + e.user_id);
        if (e.tenant_id) metaBits.push('tenant=' + e.tenant_id);
        if (e.endpoint) metaBits.push('endpoint=' + e.endpoint);
        const metaHtml = metaBits.map(b => '<span class="pill">' + b + '</span>').join(' ');
        return \`
          <div class="row">
            <div class="small">\${new Date(e.timestamp || Date.now()).toLocaleString()}</div>
            <div><span class="level \${levelClass}">\${e.level}</span></div>
            <div class="meta">\${metaHtml || ''}</div>
            <div class="message">\${e.message || e.msg || JSON.stringify(e)}</div>
          </div>
        \`;
      }).join('');
    }

    function parseLines(content) {
      const lines = content.split('\\n').filter(Boolean);
      const parsed = [];
      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          parsed.push(obj);
        } catch {
          parsed.push({ level: 'info', message: line, raw: line });
        }
      }
      return parsed;
    }

    function applyFilters(entries) {
      const level = levelSelect.value;
      const component = componentInput.value.trim().toLowerCase();
      const search = searchInput.value.trim().toLowerCase();
      return entries.filter(e => {
        if (level && e.level !== level) return false;
        if (component && (e.component || '').toLowerCase().indexOf(component) === -1) return false;
        if (search) {
          const blob = JSON.stringify(e).toLowerCase();
          if (!blob.includes(search)) return false;
        }
        return true;
      });
    }

    async function loadLogs() {
      const file = fileSelect.value;
      if (!file) return;
      const limit = parseInt(limitInput.value || '400', 10);
      const res = await fetch('./files/' + encodeURIComponent(file) + '?lines=' + limit);
      const json = await res.json();
      if (!json.success) throw new Error('Failed to load log file');
      const entries = parseLines(json.data.content);
      const filtered = applyFilters(entries);
      renderRows(filtered);
    }

    async function init() {
      await fetchFiles();
      await loadLogs();
    }

    refreshBtn.addEventListener('click', loadLogs);
    [fileSelect, levelSelect].forEach(el => el.addEventListener('change', loadLogs));
    [componentInput, searchInput, limitInput].forEach(el => el.addEventListener('input', () => {
      clearTimeout(window.__lvTimer);
      window.__lvTimer = setTimeout(loadLogs, 250);
    }));

    init().catch(err => {
      logsEl.innerHTML = '<div class="empty">Failed to load logs: ' + err.message + '</div>';
    });
  </script>
</body>
</html>
`;
}

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
   * GET /logs/ui
   * Serves a minimal HTML viewer with client-side filtering.
   */
  router.get('/ui', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(renderLogViewerPage());
  });
  
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
