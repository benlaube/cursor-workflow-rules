/**
 * useGitHistory Hook
 * 
 * React hook for fetching git commit history for a file.
 * 
 * Dependencies: React
 */

import { useState, useEffect, useCallback } from 'react'
import type { GitCommit } from '../services/git-service'

/**
 * Hook state and actions.
 */
export interface UseGitHistoryReturn {
  history: GitCommit[]
  loading: boolean
  error: string | null
  loadHistory: (filePath: string, limit?: number) => Promise<void>
  getDiff: (filePath: string, commitHash: string) => Promise<string>
}

/**
 * Hook for managing git history.
 * 
 * @param initialPath - Optional initial file path to load history for
 * @param limit - Maximum number of commits to fetch (default: 20)
 * @returns History state and operations
 */
export function useGitHistory(
  initialPath?: string,
  limit: number = 20
): UseGitHistoryReturn {
  const [history, setHistory] = useState<GitCommit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load commit history for a file.
   */
  const loadHistory = useCallback(async (filePath: string, historyLimit?: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/docs/${encodeURIComponent(filePath)}/history?limit=${historyLimit || limit}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to load history')
      }
      
      const result = await response.json()
      setHistory(result.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load history')
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [limit])

  /**
   * Get diff for a specific commit.
   */
  const getDiff = useCallback(async (filePath: string, commitHash: string): Promise<string> => {
    try {
      // This would require an additional API endpoint for diffs
      // For now, return empty string
      // TODO: Implement diff endpoint if needed
      return ''
    } catch (err: any) {
      throw new Error(err.message || 'Failed to get diff')
    }
  }, [])

  // Load initial history if provided
  useEffect(() => {
    if (initialPath) {
      loadHistory(initialPath)
    }
  }, [initialPath, loadHistory])

  return {
    history,
    loading,
    error,
    loadHistory,
    getDiff,
  }
}

