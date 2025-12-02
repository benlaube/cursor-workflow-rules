/**
 * Documentation File API Route
 * 
 * Handles operations on specific documentation files.
 * 
 * GET /api/docs/[path] - Get file content
 * PUT /api/docs/[path] - Update file content
 * DELETE /api/docs/[path] - Delete file
 * 
 * Dependencies: file-service, git-service
 */

import { NextRequest } from 'next/server'
import { createFileService } from '../../../../src/services/file-service'
import { createGitService } from '../../../../src/services/git-service'

// Dev-only check
if (process.env.NODE_ENV !== 'development') {
  console.warn('Docs API is only available in development mode')
}

// Configure docs root to be at project root (parent of modules directory)
import path from 'path'
const docsRoot = path.join(process.cwd(), '..', '..', 'docs')
const repoRoot = path.join(process.cwd(), '..', '..')

const fileService = createFileService({ docsRoot })
const gitService = createGitService({ repoRoot })

/**
 * GET /api/docs/[path]
 * Get a specific documentation file.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const filePath = decodeURIComponent(params.path)
    const { content, metadata } = await fileService.readFile(filePath)
    const fileMetadata = await fileService.getFileMetadata(filePath)
    
    return Response.json({
      data: {
        path: filePath,
        content,
        metadata,
        fileMetadata,
      },
    })
  } catch (error: any) {
    if (error.message.includes('ENOENT') || error.message.includes('not exist')) {
      return Response.json(
        {
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
          },
        },
        { status: 404 }
      )
    }
    
    console.error('Docs API Error:', error)
    return Response.json(
      {
        error: {
          code: 'DOCS_API_ERROR',
          message: error.message || 'Failed to read file',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/docs/[path]
 * Update a documentation file.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const filePath = decodeURIComponent(params.path)
    const body = await request.json()
    const { content, metadata } = body
    
    if (!content) {
      return Response.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'content is required',
          },
        },
        { status: 400 }
      )
    }
    
    await fileService.writeFile(filePath, content, metadata)
    
    // Auto-commit to git
    await gitService.autoCommit(filePath, 'update')
    
    return Response.json({
      data: { path: filePath },
      meta: { message: 'File updated successfully' },
    })
  } catch (error: any) {
    console.error('Docs API Error:', error)
    return Response.json(
      {
        error: {
          code: 'DOCS_API_ERROR',
          message: error.message || 'Failed to update file',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/docs/[path]
 * Delete a documentation file.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    const filePath = decodeURIComponent(params.path)
    
    await fileService.deleteFile(filePath)
    
    // Auto-commit to git
    await gitService.autoCommit(filePath, 'delete')
    
    return Response.json({
      data: { path: filePath },
      meta: { message: 'File deleted successfully' },
    })
  } catch (error: any) {
    if (error.message.includes('ENOENT') || error.message.includes('not exist')) {
      return Response.json(
        {
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
          },
        },
        { status: 404 }
      )
    }
    
    console.error('Docs API Error:', error)
    return Response.json(
      {
        error: {
          code: 'DOCS_API_ERROR',
          message: error.message || 'Failed to delete file',
        },
      },
      { status: 500 }
    )
  }
}

