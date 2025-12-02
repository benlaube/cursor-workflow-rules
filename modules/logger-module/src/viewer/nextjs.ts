/**
 * Next.js Log Viewer API Routes
 * 
 * Provides Next.js API route handlers for viewing and analyzing logs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyzedLogs, getLogFiles, getLogFileContent, queryDatabaseLogs, type LogViewerOptions } from './index';
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
    
    const result = await getAnalyzedLogs({
      ...defaultOptions,
      maxEntries: limit || defaultOptions.maxEntries,
      timeRange: timeRange || defaultOptions.timeRange,
      minLevel: minLevel || defaultOptions.minLevel,
    });
    
    return NextResponse.json({
      success: true,
      data: result.errors,
      summary: result.summary,
      meta: {
        logDir: defaultOptions.logDir,
        maxEntries: limit || defaultOptions.maxEntries,
        timeRange: timeRange || defaultOptions.timeRange,
        minLevel: minLevel || defaultOptions.minLevel,
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

