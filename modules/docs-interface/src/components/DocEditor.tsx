/**
 * DocEditor Component
 * 
 * Split-pane editor with live preview, auto-save, and save functionality.
 * 
 * Dependencies: React, useDocFile hook
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useDocFile } from '../hooks/useDocFile'
import { DocViewer } from './DocViewer'
import type { DocFileData } from '../hooks/useDocFile'

export interface DocEditorProps {
  filePath?: string
  onSave?: () => void
  onClose?: () => void
  className?: string
}

/**
 * Editor component with split-pane view (editor + preview).
 */
export function DocEditor({
  filePath,
  onSave,
  onClose,
  className = '',
}: DocEditorProps) {
  const {
    data,
    loading,
    error,
    hasUnsavedChanges,
    loadFile,
    saveFile,
    updateContent,
  } = useDocFile(filePath)

  const [localContent, setLocalContent] = useState('')
  const [showPreview, setShowPreview] = useState(true)

  // Sync local content with hook data
  useEffect(() => {
    if (data?.content !== undefined) {
      setLocalContent(data.content)
    }
  }, [data?.content])

  // Auto-save to localStorage
  useEffect(() => {
    if (filePath && localContent && localContent !== data?.content) {
      const key = `doc-draft-${filePath}`
      localStorage.setItem(key, localContent)
    }
  }, [localContent, filePath, data?.content])

  // Load draft from localStorage on mount
  useEffect(() => {
    if (filePath && data?.content) {
      const key = `doc-draft-${filePath}`
      const draft = localStorage.getItem(key)
      if (draft && draft !== data.content) {
        setLocalContent(draft)
        updateContent(draft)
      }
    }
  }, [filePath, data?.content, updateContent])

  const handleSave = async () => {
    if (!data) return

    try {
      await saveFile(localContent, data.metadata)
      
      // Clear draft from localStorage
      if (filePath) {
        const key = `doc-draft-${filePath}`
        localStorage.removeItem(key)
      }
      
      if (onSave) {
        onSave()
      }
    } catch (err) {
      console.error('Failed to save:', err)
    }
  }

  const handleContentChange = (newContent: string) => {
    setLocalContent(newContent)
    updateContent(newContent)
  }

  if (loading && !data) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-gray-500">No file loaded</div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-500">Unsaved changes</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-1 rounded ${
              hasUnsavedChanges
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Split Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r overflow-hidden flex flex-col`}>
          <textarea
            value={localContent}
            onChange={(e) => handleContentChange(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm border-none outline-none resize-none"
            placeholder="Start writing markdown..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 overflow-y-auto">
            <DocViewer
              data={{
                ...data,
                content: localContent,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

