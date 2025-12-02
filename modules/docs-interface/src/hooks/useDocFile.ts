/**
 * useDocFile Hook
 * 
 * React hook for managing documentation file operations.
 * Handles loading, saving, and tracking unsaved changes.
 * 
 * Dependencies: React
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * File content and metadata.
 */
export interface DocFileData {
  content: string
  metadata: Record<string, any>
  fileMetadata?: {
    path: string
    relativePath: string
    name: string
    size: number
    lastModified: Date
  }
}

/**
 * Hook state and actions.
 */
export interface UseDocFileReturn {
  data: DocFileData | null
  loading: boolean
  error: string | null
  hasUnsavedChanges: boolean
  loadFile: (path: string) => Promise<void>
  saveFile: (content: string, metadata?: Record<string, any>) => Promise<void>
  updateContent: (content: string) => void
  reset: () => void
}

/**
 * Hook for managing a documentation file.
 * 
 * @param initialPath - Optional initial file path to load
 * @returns File state and operations
 */
export function useDocFile(initialPath?: string): UseDocFileReturn {
  const [data, setData] = useState<DocFileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalContent, setOriginalContent] = useState<string>('')

  /**
   * Load a file from the API.
   */
  const loadFile = useCallback(async (path: string) => {
    setLoading(true)
    setError(null)
    setHasUnsavedChanges(false)
    
    try {
      const response = await fetch(`/api/docs/${encodeURIComponent(path)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to load file')
      }
      
      const result = await response.json()
      const fileData: DocFileData = {
        content: result.data.content,
        metadata: result.data.metadata || {},
        fileMetadata: result.data.fileMetadata,
      }
      
      setData(fileData)
      setOriginalContent(fileData.content)
    } catch (err: any) {
      setError(err.message || 'Failed to load file')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Save file content to the API.
   */
  const saveFile = useCallback(async (
    content: string,
    metadata?: Record<string, any>
  ) => {
    if (!data?.fileMetadata?.path) {
      throw new Error('No file loaded')
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/docs/${encodeURIComponent(data.fileMetadata.path)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, metadata }),
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to save file')
      }
      
      // Reload file to get updated metadata
      await loadFile(data.fileMetadata.path)
      setHasUnsavedChanges(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save file')
      throw err
    } finally {
      setLoading(false)
    }
  }, [data, loadFile])

  /**
   * Update content locally (marks as unsaved).
   */
  const updateContent = useCallback((content: string) => {
    if (!data) return
    
    setData({
      ...data,
      content,
    })
    setHasUnsavedChanges(content !== originalContent)
  }, [data, originalContent])

  /**
   * Reset hook state.
   */
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setHasUnsavedChanges(false)
    setOriginalContent('')
  }, [])

  // Load initial file if provided
  useEffect(() => {
    if (initialPath) {
      loadFile(initialPath)
    }
  }, [initialPath, loadFile])

  return {
    data,
    loading,
    error,
    hasUnsavedChanges,
    loadFile,
    saveFile,
    updateContent,
    reset,
  }
}

