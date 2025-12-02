/**
 * DocsInterface Component
 * 
 * Main component that combines all documentation interface features.
 * Shows welcome page on first visit, then the main interface.
 * 
 * Dependencies: All other components and hooks
 */

'use client'

import React, { useState, useEffect } from 'react'
import { DocList } from './DocList'
import { DocViewer } from './DocViewer'
import { DocEditor } from './DocEditor'
import { DocSearch } from './DocSearch'
import { DocHistory } from './DocHistory'
import { DocToolbar } from './DocToolbar'
import { DocsWelcome } from './DocsWelcome'
import { useDocFile } from '../hooks/useDocFile'

/**
 * Wrapper component that loads file data for DocViewer.
 */
function DocViewerWithLoader({ filePath }: { filePath: string }) {
  const { data, loading, error } = useDocFile(filePath)

  return (
    <div className="flex-1 overflow-y-auto">
      <DocViewer data={data} loading={loading} error={error} />
    </div>
  )
}

export interface DocsInterfaceProps {
  className?: string
}

/**
 * Main documentation interface component.
 * 
 * Shows welcome page on first visit, then the main interface.
 */
export function DocsInterface({ className = '' }: DocsInterfaceProps) {
  const [selectedFile, setSelectedFile] = useState<string | undefined>()
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const [showSearch, setShowSearch] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Check if user has visited before (first-time welcome)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('docs-interface-visited')
      setShowWelcome(!hasVisited)
    }
  }, [])
  
  // Handler to open settings from toolbar
  const handleOpenSettings = () => {
    setShowSettings(true)
  }
  
  // Handler to close settings and return to interface
  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const handleCreate = async () => {
    const filename = prompt('Enter filename (e.g., new-doc.md):')
    if (!filename) return

    const title = prompt('Enter document title:') || filename.replace('.md', '')
    const description = prompt('Enter description (optional):') || undefined

    try {
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: filename,
          title,
          description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to create file')
      }

      setSelectedFile(filename)
      setViewMode('edit')
    } catch (error: any) {
      alert(`Failed to create file: ${error.message}`)
    }
  }

  const handleDelete = async () => {
    if (!selectedFile) return

    if (!confirm(`Are you sure you want to delete ${selectedFile}?`)) {
      return
    }

    try {
      const response = await fetch(
        `/api/docs/${encodeURIComponent(selectedFile)}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to delete file')
      }

      setSelectedFile(undefined)
      setViewMode('view')
    } catch (error: any) {
      alert(`Failed to delete file: ${error.message}`)
    }
  }

  // Show welcome page on first visit
  if (showWelcome) {
    return (
      <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
        <DocsWelcome onGetStarted={() => {
          setShowWelcome(false)
          if (typeof window !== 'undefined') {
            localStorage.setItem('docs-interface-visited', 'true')
          }
        }} />
      </div>
    )
  }
  
  // Show settings page when requested
  if (showSettings) {
    return (
      <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
        <DocsWelcome onGetStarted={handleCloseSettings} />
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen ${className}`}>
      {/* Dev-only warning */}
      {process.env.NODE_ENV !== 'development' && (
        <div className="bg-yellow-100 border-b border-yellow-400 p-2 text-center text-sm text-yellow-800">
          ⚠️ Documentation interface is only available in development mode
        </div>
      )}

      {/* Toolbar */}
      <DocToolbar
        onCreate={handleCreate}
        onDelete={handleDelete}
        onToggleView={setViewMode}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onOpenSettings={handleOpenSettings}
        viewMode={viewMode}
        canDelete={!!selectedFile}
        hasUnsavedChanges={false}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col border-r">
          {showSearch ? (
            <div className="p-4 border-b">
              <DocSearch onSelectFile={(path) => {
                setSelectedFile(path)
                setShowSearch(false)
              }} />
            </div>
          ) : (
            <>
              <div className="p-2 border-b flex items-center justify-between bg-gray-50 flex-shrink-0">
                <span className="font-semibold text-sm">Documentation</span>
                <button
                  onClick={handleOpenSettings}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
                  title="Open Settings"
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
              <DocList
                onSelectFile={setSelectedFile}
                onEditFile={(path) => {
                  setSelectedFile(path)
                  setViewMode('edit')
                }}
                selectedPath={selectedFile}
              />
            </>
          )}
        </div>

        {/* Main Editor/Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            viewMode === 'edit' ? (
              <DocEditor
                filePath={selectedFile}
                onSave={() => {
                  // File saved, could show notification
                }}
              />
            ) : (
              <div className="flex flex-1 overflow-hidden">
                <DocViewerWithLoader filePath={selectedFile} />
                {showHistory && (
                  <div className="w-80 border-l overflow-y-auto">
                    <DocHistory filePath={selectedFile} />
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a file to view or edit
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

