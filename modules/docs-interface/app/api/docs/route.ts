/**
 * Documentation API Route
 * 
 * Handles listing and searching documentation files.
 * 
 * GET /api/docs - List all files
 * GET /api/docs?search=query - Search files
 * 
 * Dependencies: file-service, search-service
 */

import { NextRequest } from 'next/server'
import { createFileService } from '../../../src/services/file-service'
import { createSearchService } from '../../../src/services/search-service'

// Dev-only check
if (process.env.NODE_ENV !== 'development') {
  console.warn('Docs API is only available in development mode')
}

// Configure docs root to be at project root (parent of modules directory)
// process.cwd() is the Next.js app directory (modules/docs-interface)
// We need to go up to the project root to find the docs folder
import path from 'path'
const docsRoot = path.join(process.cwd(), '..', '..', 'docs')

const fileService = createFileService({ docsRoot })
const searchService = createSearchService({ fileService })

/**
 * GET /api/docs
 * List all documentation files or search if query parameter provided.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get('search')
    
    if (searchQuery) {
      // Perform search
      const results = await searchService.search(searchQuery)
      return Response.json({
        data: results,
        meta: {
          count: results.length,
          query: searchQuery,
        },
      })
    } else {
      // List all files
      const files = await fileService.listFiles()
      return Response.json({
        data: files,
        meta: {
          count: files.length,
        },
      })
    }
  } catch (error: any) {
    console.error('Docs API Error:', error)
    return Response.json(
      {
        error: {
          code: 'DOCS_API_ERROR',
          message: error.message || 'Failed to process request',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/docs
 * Create a new documentation file.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path: filePath, title, description } = body
    
    if (!filePath || !title) {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'path and title are required',
          },
        },
        { status: 400 }
      )
    }
    
    await fileService.createFile(filePath, title, description)
    
    // Auto-commit to git
    const { createGitService } = await import('../../../src/services/git-service')
    const repoRoot = path.join(process.cwd(), '..', '..')
    const gitService = createGitService({ repoRoot })
    await gitService.autoCommit(filePath, 'create')
    
    return Response.json({
      data: { path: filePath, title },
      meta: { message: 'File created successfully' },
    })
  } catch (error: any) {
    console.error('Docs API Error:', error)
    return Response.json(
      {
        error: {
          code: 'DOCS_API_ERROR',
          message: error.message || 'Failed to create file',
        },
      },
      { status: 500 }
    )
  }
}

