/**
 * DocList Component
 * 
 * Tree view navigation of /docs folder structure.
 * 
 * Dependencies: React
 */

'use client'

import React, { useState, useEffect } from 'react'
import type { FileMetadata } from '../services/file-service'

export interface DocListProps {
  onSelectFile?: (filePath: string) => void
  onEditFile?: (filePath: string) => void
  selectedPath?: string
  className?: string
}

interface TreeNode {
  name: string
  path: string
  isDirectory: boolean
  children: TreeNode[]
  metadata?: FileMetadata
}

/**
 * List component for navigating documentation files.
 */
export function DocList({
  onSelectFile,
  onEditFile,
  selectedPath,
  className = '',
}: DocListProps) {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/docs')
      if (!response.ok) {
        throw new Error('Failed to load files')
      }
      
      const result = await response.json()
      setFiles(result.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const buildTree = (): TreeNode[] => {
    const tree: TreeNode[] = []
    const pathMap = new Map<string, TreeNode>()

    // Sort files by path
    const sortedFiles = [...files].sort((a, b) => 
      a.relativePath.localeCompare(b.relativePath)
    )

    for (const file of sortedFiles) {
      const parts = file.relativePath.split('/').filter(Boolean)
      let currentPath = ''
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isLast = i === parts.length - 1
        currentPath = currentPath ? `${currentPath}/${part}` : part
        
        if (!pathMap.has(currentPath)) {
          const node: TreeNode = {
            name: part,
            path: currentPath,
            isDirectory: !isLast || file.isDirectory,
            children: [],
            metadata: isLast ? file : undefined,
          }
          
          pathMap.set(currentPath, node)
          
          // Add to parent or root
          if (i === 0) {
            tree.push(node)
          } else {
            const parentPath = parts.slice(0, i).join('/')
            const parent = pathMap.get(parentPath)
            if (parent) {
              parent.children.push(node)
            }
          }
        }
      }
    }

    return tree
  }

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedPaths(newExpanded)
  }

  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedPaths.has(node.path)
    const isSelected = selectedPath === node.relativePath
    const hasChildren = node.children.length > 0

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 group ${
            isSelected ? 'bg-blue-100' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              if (hasChildren) {
                toggleExpand(node.path)
              }
              if (!node.isDirectory && onSelectFile) {
                onSelectFile(node.relativePath)
              }
            }}
          >
            {hasChildren && (
              <span className="w-4 text-gray-500 flex-shrink-0">
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            {!hasChildren && <span className="w-4 flex-shrink-0" />}
            <span className="text-sm flex-shrink-0">
              {node.isDirectory ? '📁' : '📄'}
            </span>
            <span className="text-sm truncate flex-1 min-w-0" title={node.name}>
              {node.name}
            </span>
          </div>
          {!node.isDirectory && onEditFile && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditFile(node.relativePath)
              }}
              className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-opacity flex-shrink-0"
              title="Edit file"
            >
              Edit
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-gray-500">Loading files...</div>
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

  const tree = buildTree()

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto">
        {tree.map((node) => renderNode(node))}
      </div>
    </div>
  )
}

