/**
 * useDocSearch Hook
 * 
 * React hook for searching documentation files.
 * Provides debounced search with results.
 * 
 * Dependencies: React
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { SearchResult } from '../services/search-service'

/**
 * Hook state and actions.
 */
export interface UseDocSearchReturn {
  query: string
  results: SearchResult[]
  loading: boolean
  error: string | null
  setQuery: (query: string) => void
  search: (query: string) => Promise<void>
  clear: () => void
}

/**
 * Hook for searching documentation.
 * 
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns Search state and operations
 */
export function useDocSearch(debounceMs: number = 300): UseDocSearchReturn {
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  /**
   * Perform search.
   */
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/docs?search=${encodeURIComponent(searchQuery)}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Search failed')
      }
      
      const result = await response.json()
      setResults(result.data || [])
    } catch (err: any) {
      setError(err.message || 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Set query with debouncing.
   */
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      search(newQuery)
    }, debounceMs)
  }, [search, debounceMs])

  /**
   * Clear search.
   */
  const clear = useCallback(() => {
    setQueryState('')
    setResults([])
    setError(null)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return {
    query,
    results,
    loading,
    error,
    setQuery,
    search,
    clear,
  }
}

