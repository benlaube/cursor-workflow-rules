/**
 * DocSearch Component
 * 
 * Search interface with input, results list, and navigation.
 * 
 * Dependencies: React, useDocSearch hook
 */

'use client'

import React from 'react'
import { useDocSearch } from '../hooks/useDocSearch'
import type { SearchResult } from '../services/search-service'

export interface DocSearchProps {
  onSelectFile?: (filePath: string) => void
  className?: string
}

/**
 * Search component for documentation.
 */
export function DocSearch({ onSelectFile, className = '' }: DocSearchProps) {
  const { query, results, loading, error, setQuery, clear } = useDocSearch()

  const handleSelect = (result: SearchResult) => {
    if (onSelectFile) {
      onSelectFile(result.file.relativePath)
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documentation..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-gray-500 hover:text-gray-700"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-2 text-sm text-gray-500">Searching...</div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-500">{error}</div>
      )}

      {results.length > 0 && (
        <div className="mt-2 border rounded-lg max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              onClick={() => handleSelect(result)}
              className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
            >
              <div className="font-semibold text-blue-600">
                {result.file.name}
              </div>
              <div className="text-sm text-gray-500">
                {result.file.relativePath}
              </div>
              {result.matches.length > 0 && (
                <div className="mt-1 text-sm text-gray-600">
                  {result.matches[0].value.substring(0, 150)}
                  {result.matches[0].value.length > 150 ? '...' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="mt-2 text-sm text-gray-500">No results found</div>
      )}
    </div>
  )
}

