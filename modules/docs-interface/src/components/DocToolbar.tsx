/**
 * DocToolbar Component
 * 
 * Toolbar with create, save, delete actions and view/edit toggle.
 * 
 * Dependencies: React
 */

'use client'

import React from 'react'

export interface DocToolbarProps {
  onCreate?: () => void
  onSave?: () => void
  onDelete?: () => void
  onToggleView?: (view: 'view' | 'edit') => void
  onToggleSearch?: () => void
  onOpenSettings?: () => void
  viewMode?: 'view' | 'edit'
  hasUnsavedChanges?: boolean
  canDelete?: boolean
  className?: string
}

/**
 * Toolbar component for documentation actions.
 */
export function DocToolbar({
  onCreate,
  onSave,
  onDelete,
  onToggleView,
  onToggleSearch,
  onOpenSettings,
  viewMode = 'view',
  hasUnsavedChanges = false,
  canDelete = false,
  className = '',
}: DocToolbarProps) {
  return (
    <div className={`flex items-center justify-between gap-2 p-2 border-b ${className}`}>
      <div className="flex items-center gap-2">
      {onCreate && (
        <button
          onClick={onCreate}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Create new document"
        >
          + New
        </button>
      )}
      
      {onSave && (
        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges}
          className={`px-3 py-1 rounded ${
            hasUnsavedChanges
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={hasUnsavedChanges ? 'Save changes' : 'No changes to save'}
        >
          Save
        </button>
      )}
      
      {onDelete && canDelete && (
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          title="Delete document"
        >
          Delete
        </button>
      )}
      
      {onToggleView && (
        <button
          onClick={() => onToggleView(viewMode === 'view' ? 'edit' : 'view')}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          title={`Switch to ${viewMode === 'view' ? 'edit' : 'view'} mode`}
        >
          {viewMode === 'view' ? 'Edit' : 'View'}
        </button>
      )}
      
      {onToggleSearch && (
        <button
          onClick={onToggleSearch}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          title="Toggle search"
        >
          Search
        </button>
      )}
      </div>
      
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
          title="Open settings"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>
      )}
    </div>
  )
}

