/**
 * Next.js Log Viewer API Routes
 * 
 * Provides Next.js API route handlers for viewing and analyzing logs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyzedLogs, getLogFiles, getLogFileContent, queryDatabaseLogs, exportLogsToCSV, exportLogsToJSON, downloadLogFile, type LogViewerOptions } from './index';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Default options for Next.js log viewer.
 */
const defaultOptions: LogViewerOptions = {
  logDir: './logs',
  maxEntries: 100,
  timeRange: 3600000,
  minLevel: 'error',
};

/**
 * GET /api/logs
 * Get analyzed logs with summary.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const timeRange = searchParams.get('timeRange') ? parseInt(searchParams.get('timeRange')!) : undefined;
    const minLevel = searchParams.get('minLevel') as 'error' | 'fatal' | 'warn' | 'info' | undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined;
    
    const result = await getAnalyzedLogs({
      ...defaultOptions,
      maxEntries: limit || defaultOptions.maxEntries,
      timeRange: timeRange || defaultOptions.timeRange,
      minLevel: minLevel || defaultOptions.minLevel,
      page,
      pageSize,
    });
    
    return NextResponse.json({
      success: true,
      data: result.errors,
      summary: result.summary,
      pagination: result.pagination,
      meta: {
        logDir: defaultOptions.logDir,
        maxEntries: limit || defaultOptions.maxEntries,
        timeRange: timeRange || defaultOptions.timeRange,
        minLevel: minLevel || defaultOptions.minLevel,
        page,
        pageSize,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: 'LOG_VIEWER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs/files
 * List available log files.
 */
export async function GET_FILES(request: NextRequest) {
  try {
    const logDir = defaultOptions.logDir || './logs';
    const files = await getLogFiles(logDir);
    
    const fileInfo = files.map(file => {
      const stats = fs.statSync(file);
      return {
        path: file,
        name: path.basename(file),
        size: stats.size,
        modified: stats.mtime.toISOString(),
      };
    });
    
    return NextResponse.json({
      success: true,
      data: fileInfo,
      meta: {
        logDir,
        count: fileInfo.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: 'LOG_FILES_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs/files/[filename]
 * Get content of a specific log file.
 */
export async function GET_FILE(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename;
    const logDir = defaultOptions.logDir || './logs';
    const filePath = path.join(logDir, filename);
    
    // Security: ensure file is within log directory
    const resolvedPath = path.resolve(filePath);
    const resolvedLogDir = path.resolve(logDir);
    if (!resolvedPath.startsWith(resolvedLogDir)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Access denied',
            code: 'ACCESS_DENIED',
          },
        },
        { status: 403 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const lines = searchParams.get('lines') ? parseInt(searchParams.get('lines')!) : undefined;
    const content = await getLogFileContent(filePath, lines);
    
    return NextResponse.json({
      success: true,
      data: {
        filename,
        path: filePath,
        content,
        lines: lines || content.split('\n').length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: 'LOG_FILE_NOT_FOUND',
        },
      },
      { status: 404 }
    );
  }
}

/**
 * GET /api/logs/database
 * Query database logs (if enabled).
 * 
 * Note: This requires options to be passed via a shared configuration or context.
 * For Next.js, you may want to create a route handler that imports and uses this
 * with proper options configuration.
 */
export async function GET_DATABASE(
  request: NextRequest,
  options?: LogViewerOptions
) {
  const finalOptions = { ...defaultOptions, ...options };
  
  if (!finalOptions.enableDatabase || !finalOptions.supabaseClient) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Database logging not enabled',
          code: 'DATABASE_NOT_ENABLED',
        },
      },
      { status: 400 }
    );
  }
  
    try {
      const searchParams = request.nextUrl.searchParams;
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
      const level = searchParams.get('level') as string | undefined;
      const component = searchParams.get('component') as string | undefined;
      const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
      const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined;
      
      const result = await queryDatabaseLogs(finalOptions.supabaseClient!, {
        limit: page || pageSize ? undefined : (limit || 100),
        level,
        component,
        page,
        pageSize: pageSize || limit || 100,
      });
      
      return NextResponse.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        meta: {
          count: result.data.length,
          limit: pageSize || limit || 100,
          level,
          component,
          page,
          pageSize,
        },
      });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: 'DATABASE_QUERY_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs/summary
 * Get summary statistics.
 */
export async function GET_SUMMARY(
  request: NextRequest,
  options?: LogViewerOptions
) {
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const result = await getAnalyzedLogs(finalOptions);
    
    return NextResponse.json({
      success: true,
      data: result.summary,
      meta: {
        logDir: finalOptions.logDir || './logs',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: 'LOG_SUMMARY_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs/ui
 * Serves the HTML log viewer interface.
 */
export async function GET_UI() {
  const html = renderLogViewerPage();
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

/**
 * GET /api/logs/export/csv
 * Export analyzed logs as CSV.
 */
export async function GET_EXPORT_CSV(
  request: NextRequest,
  options?: LogViewerOptions
) {
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const timeRange = searchParams.get('timeRange') ? parseInt(searchParams.get('timeRange')!) : undefined;
    const minLevel = searchParams.get('minLevel') as 'error' | 'fatal' | 'warn' | 'info' | undefined;
    
    const csv = await exportLogsToCSV({
      ...finalOptions,
      maxEntries: limit || finalOptions.maxEntries,
      timeRange: timeRange || finalOptions.timeRange,
      minLevel: minLevel || finalOptions.minLevel,
    });
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: 'EXPORT_CSV_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs/export/json
 * Export analyzed logs as JSON.
 */
export async function GET_EXPORT_JSON(
  request: NextRequest,
  options?: LogViewerOptions
) {
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const timeRange = searchParams.get('timeRange') ? parseInt(searchParams.get('timeRange')!) : undefined;
    const minLevel = searchParams.get('minLevel') as 'error' | 'fatal' | 'warn' | 'info' | undefined;
    
    const json = await exportLogsToJSON({
      ...finalOptions,
      maxEntries: limit || finalOptions.maxEntries,
      timeRange: timeRange || finalOptions.timeRange,
      minLevel: minLevel || finalOptions.minLevel,
    });
    
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="logs-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: 'EXPORT_JSON_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs/files/[filename]/download
 * Download a log file.
 */
export async function GET_DOWNLOAD_FILE(
  request: NextRequest,
  { params }: { params: { filename: string } },
  options?: LogViewerOptions
) {
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const filename = params.filename;
    const logDir = finalOptions.logDir || './logs';
    const filePath = path.join(logDir, filename);
    
    const fileData = await downloadLogFile(filePath, logDir);
    
    return new NextResponse(fileData.content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${fileData.filename}"`,
        'Content-Length': fileData.size.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: 'FILE_DOWNLOAD_ERROR',
        },
      },
      { status: 404 }
    );
  }
}

/**
 * Renders the HTML log viewer page (same as Express version with enhancements).
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
    .button-group { display: flex; gap: 8px; }
    .button-group button { flex: 1; }
    .button-secondary {
      background: var(--card);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .button-secondary:hover { background: rgba(255,255,255,0.05); }
    .checkbox-label { flex-direction: row; align-items: center; gap: 8px; }
    .checkbox-label input[type="checkbox"] { width: auto; margin: 0; }
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-top: 1px solid var(--border);
      background: var(--card);
    }
    .pagination-info { color: var(--muted); font-size: 12px; }
    .pagination-controls { display: flex; gap: 8px; }
    .pagination-controls button {
      padding: 6px 12px;
      font-size: 12px;
      min-width: 60px;
    }
    .pagination-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="flex-between">
      <div>
        <h1>Log Viewer</h1>
        <div class="small">Color-coded levels with client-side filters. Uses /api/logs/files endpoints.</div>
      </div>
      <div class="button-group">
        <button id="refreshBtn">Refresh</button>
        <button id="exportCsvBtn" class="button-secondary">Export CSV</button>
        <button id="exportJsonBtn" class="button-secondary">Export JSON</button>
      </div>
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
        <label class="checkbox-label">
          <input type="checkbox" id="regexToggle" />
          <span>Regex search</span>
        </label>
        <label>Start date
          <input id="startDateInput" type="date" />
        </label>
        <label>End date
          <input id="endDateInput" type="date" />
        </label>
        <label>Limit lines
          <input id="limitInput" type="number" min="50" max="2000" value="400" />
        </label>
        <label class="checkbox-label">
          <input type="checkbox" id="multiFileToggle" />
          <span>Search all files</span>
        </label>
      </div>
      <div class="logs" id="logs"></div>
      <div class="pagination" id="pagination" style="display: none;">
        <div class="pagination-info" id="paginationInfo"></div>
        <div class="pagination-controls">
          <button id="prevPageBtn" disabled>Previous</button>
          <button id="nextPageBtn" disabled>Next</button>
        </div>
      </div>
    </div>
  </div>
  <script>
    const fileSelect = document.getElementById('fileSelect');
    const levelSelect = document.getElementById('levelSelect');
    const componentInput = document.getElementById('componentInput');
    const searchInput = document.getElementById('searchInput');
    const limitInput = document.getElementById('limitInput');
    const regexToggle = document.getElementById('regexToggle');
    const startDateInput = document.getElementById('startDateInput');
    const endDateInput = document.getElementById('endDateInput');
    const multiFileToggle = document.getElementById('multiFileToggle');
    const logsEl = document.getElementById('logs');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const paginationEl = document.getElementById('pagination');
    const paginationInfo = document.getElementById('paginationInfo');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');

    let currentPage = 1;
    let currentPageSize = 100;
    let totalPages = 1;
    let allEntries = [];

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
        paginationEl.style.display = 'none';
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
      const search = searchInput.value.trim();
      const useRegex = regexToggle.checked;
      const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
      const endDate = endDateInput.value ? new Date(endDateInput.value + 'T23:59:59') : null;

      let filtered = entries.filter(e => {
        if (level && e.level !== level) return false;
        if (component && (e.component || '').toLowerCase().indexOf(component) === -1) return false;
        if (startDate || endDate) {
          const logDate = e.timestamp ? new Date(e.timestamp) : new Date();
          if (startDate && logDate < startDate) return false;
          if (endDate && logDate > endDate) return false;
        }
        if (search) {
          const blob = JSON.stringify(e);
          if (useRegex) {
            try {
              const regex = new RegExp(search, 'i');
              if (!regex.test(blob)) return false;
            } catch {
              if (!blob.toLowerCase().includes(search.toLowerCase())) return false;
            }
          } else {
            if (!blob.toLowerCase().includes(search.toLowerCase())) return false;
          }
        }
        return true;
      });

      return filtered;
    }

    function updatePagination(filteredEntries) {
      const total = filteredEntries.length;
      totalPages = Math.ceil(total / currentPageSize);
      
      if (totalPages > 1) {
        paginationEl.style.display = 'flex';
        const start = (currentPage - 1) * currentPageSize + 1;
        const end = Math.min(currentPage * currentPageSize, total);
        paginationInfo.textContent = \`Showing \${start}-\${end} of \${total} logs\`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage >= totalPages;
      } else {
        paginationEl.style.display = 'none';
      }
    }

    function getPaginatedEntries(filteredEntries) {
      const start = (currentPage - 1) * currentPageSize;
      const end = start + currentPageSize;
      return filteredEntries.slice(start, end);
    }

    async function loadLogs() {
      const file = fileSelect.value;
      if (!file && !multiFileToggle.checked) return;
      
      try {
        let allParsed = [];
        
        if (multiFileToggle.checked) {
          const filesRes = await fetch('./files');
          const filesJson = await filesRes.json();
          if (!filesJson.success) throw new Error('Failed to load files');
          
          const limit = parseInt(limitInput.value || '400', 10);
          for (const fileInfo of filesJson.data) {
            try {
              const res = await fetch('./files/' + encodeURIComponent(fileInfo.name) + '?lines=' + limit);
              const json = await res.json();
              if (json.success) {
                const entries = parseLines(json.data.content);
                allParsed.push(...entries);
              }
            } catch (err) {
              console.warn('Failed to load file:', fileInfo.name, err);
            }
          }
        } else {
          const limit = parseInt(limitInput.value || '400', 10);
          const res = await fetch('./files/' + encodeURIComponent(file) + '?lines=' + limit);
          const json = await res.json();
          if (!json.success) throw new Error('Failed to load log file');
          allParsed = parseLines(json.data.content);
        }
        
        allEntries = allParsed;
        const filtered = applyFilters(allEntries);
        updatePagination(filtered);
        const paginated = getPaginatedEntries(filtered);
        renderRows(paginated);
      } catch (err) {
        logsEl.innerHTML = '<div class="empty">Failed to load logs: ' + err.message + '</div>';
        paginationEl.style.display = 'none';
      }
    }

    function exportLogs(format) {
      const filtered = applyFilters(allEntries);
      const params = new URLSearchParams();
      params.set('limit', limitInput.value || '400');
      if (levelSelect.value) params.set('minLevel', levelSelect.value);
      if (startDateInput.value) params.set('startTime', startDateInput.value);
      if (endDateInput.value) params.set('endTime', endDateInput.value);
      
      const url = \`./export/\${format}?\${params.toString()}\`;
      window.open(url, '_blank');
    }

    function goToPage(page) {
      if (page < 1 || page > totalPages) return;
      currentPage = page;
      const filtered = applyFilters(allEntries);
      updatePagination(filtered);
      const paginated = getPaginatedEntries(filtered);
      renderRows(paginated);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function init() {
      await fetchFiles();
      await loadLogs();
    }

    refreshBtn.addEventListener('click', () => {
      currentPage = 1;
      loadLogs();
    });
    exportCsvBtn.addEventListener('click', () => exportLogs('csv'));
    exportJsonBtn.addEventListener('click', () => exportLogs('json'));
    prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    
    [fileSelect, levelSelect].forEach(el => el.addEventListener('change', () => {
      currentPage = 1;
      loadLogs();
    }));
    
    [componentInput, searchInput, limitInput, regexToggle, startDateInput, endDateInput, multiFileToggle].forEach(el => {
      el.addEventListener('input', () => {
        currentPage = 1;
        clearTimeout(window.__lvTimer);
        window.__lvTimer = setTimeout(loadLogs, 250);
      });
      el.addEventListener('change', () => {
        currentPage = 1;
        loadLogs();
      });
    });

    init().catch(err => {
      logsEl.innerHTML = '<div class="empty">Failed to load logs: ' + err.message + '</div>';
    });
  </script>
</body>
</html>
`;
}

