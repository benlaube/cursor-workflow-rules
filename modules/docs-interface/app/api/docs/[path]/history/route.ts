/**
 * Documentation File History API Route
 * 
 * Handles git history retrieval for documentation files.
 * 
 * GET /api/docs/[path]/history - Get commit history for a file
 * 
 * Dependencies: git-service
 */

import { NextRequest } from 'next/server'
import { createGitService } from '../../../../../src/services/git-service'

// Dev-only check
if (process.env.NODE_ENV !== 'development') {
  console.warn('Docs API is only available in development mode')
}

// Configure git service to use project root
import path from 'path'
const repoRoot = path.join(process.cwd(), '..', '..')
const gitService = createGitService({ repoRoot })

/**
 * GET /api/docs/[path]/history
 * Get git commit history for a specific file.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const filePath = decodeURIComponent(params.path)
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    
    const history = await gitService.getFileHistory(filePath, limit)
    
    return Response.json({
      data: history,
      meta: {
        count: history.length,
        filePath,
      },
    })
  } catch (error: any) {
    // If not a git repo, return empty array
    if (error.message.includes('Not a git repository') || error.message.includes('not a git')) {
      return Response.json({
        data: [],
        meta: {
          message: 'Not a git repository',
        },
      })
    }
    
    console.error('Docs History API Error:', error)
    return Response.json(
      {
        error: {
          code: 'DOCS_API_ERROR',
          message: error.message || 'Failed to get file history',
        },
      },
      { status: 500 }
    )
  }
}

