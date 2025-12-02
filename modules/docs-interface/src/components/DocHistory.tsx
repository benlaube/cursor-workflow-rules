/**
 * DocHistory Component
 * 
 * Display git commit history for a file with diffs.
 * 
 * Dependencies: React, useGitHistory hook
 */

'use client'

import React, { useState } from 'react'
import { useGitHistory } from '../hooks/useGitHistory'
import type { GitCommit } from '../services/git-service'

export interface DocHistoryProps {
  filePath?: string
  onRestore?: (commitHash: string) => void
  className?: string
}

/**
 * History component for displaying git commit history.
 */
export function DocHistory({
  filePath,
  onRestore,
  className = '',
}: DocHistoryProps) {
  const { history, loading, error, loadHistory } = useGitHistory(filePath)
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null)

  React.useEffect(() => {
    if (filePath) {
      loadHistory(filePath)
    }
  }, [filePath, loadHistory])

  const handleRestore = (commitHash: string) => {
    if (onRestore) {
      onRestore(commitHash)
    }
  }

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-gray-500">Loading history...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-gray-500">
          No commit history available. This may not be a git repository.
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="font-semibold mb-4">Commit History</div>
      <div className="space-y-2">
        {history.map((commit) => (
          <div
            key={commit.hash}
            className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
              selectedCommit === commit.hash ? 'bg-blue-50 border-blue-300' : ''
            }`}
            onClick={() => setSelectedCommit(
              selectedCommit === commit.hash ? null : commit.hash
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-mono text-xs text-gray-500 mb-1">
                  {commit.hash.substring(0, 7)}
                </div>
                <div className="font-semibold mb-1">{commit.message}</div>
                <div className="text-sm text-gray-600">
                  {commit.author} • {new Date(commit.date).toLocaleString()}
                </div>
              </div>
              {onRestore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Restore this version? This will overwrite the current file.')) {
                      handleRestore(commit.hash)
                    }
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

