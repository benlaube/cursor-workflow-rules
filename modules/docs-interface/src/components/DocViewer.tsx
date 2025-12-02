/**
 * DocViewer Component
 * 
 * Markdown renderer with syntax highlighting and metadata display.
 * 
 * Dependencies: React, react-markdown, remark-gfm, rehype-highlight
 */

'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { DocFileData } from '../hooks/useDocFile'

export interface DocViewerProps {
  data: DocFileData | null
  loading?: boolean
  error?: string | null
  className?: string
}

/**
 * Viewer component for rendering markdown documentation.
 */
export function DocViewer({
  data,
  loading = false,
  error = null,
  className = '',
}: DocViewerProps) {
  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-gray-500">Loading...</div>
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

  if (!data) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-gray-500">No document selected</div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Metadata */}
      {data.fileMetadata && (
        <div className="mb-6 pb-4 border-b text-sm text-gray-500">
          <div className="font-semibold text-gray-700 mb-2">
            {data.metadata?.title || data.fileMetadata.name}
          </div>
          {data.metadata?.description && (
            <div className="mb-2">{data.metadata.description}</div>
          )}
          <div className="flex gap-4 flex-wrap">
            {data.metadata?.version && (
              <span>Version: {data.metadata.version}</span>
            )}
            {data.metadata?.created && (
              <span>Created: {data.metadata.created}</span>
            )}
            {data.metadata?.lastUpdated && (
              <span>Updated: {data.metadata.lastUpdated}</span>
            )}
            {data.fileMetadata.lastModified && (
              <span>
                Last Modified: {new Date(data.fileMetadata.lastModified).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Markdown Content */}
      <div className="prose prose-slate max-w-none" style={{
        '--tw-prose-headings-mt': '2rem',
        '--tw-prose-headings-mb': '1rem',
        '--tw-prose-p-margin-top': '1.5rem',
        '--tw-prose-p-margin-bottom': '1.5rem',
      } as React.CSSProperties}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <pre className={`${className} my-4`} {...props}>
                  <code className={className}>{children}</code>
                </pre>
              ) : (
                <code className={`${className} px-1 py-0.5 rounded`} {...props}>
                  {children}
                </code>
              )
            },
            p: ({ children }) => <p style={{ marginTop: '1.5rem', marginBottom: '1.5rem', lineHeight: '1.75' }}>{children}</p>,
            h1: ({ children }) => <h1 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '2.25rem', fontWeight: 'bold' }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.875rem', fontWeight: 'bold' }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{children}</h3>,
            h4: ({ children }) => <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: 'bold' }}>{children}</h4>,
            ul: ({ children }) => <ul style={{ marginTop: '1.5rem', marginBottom: '1.5rem', marginLeft: '1.5rem', listStyleType: 'disc' }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ marginTop: '1.5rem', marginBottom: '1.5rem', marginLeft: '1.5rem', listStyleType: 'decimal' }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{children}</li>,
            blockquote: ({ children }) => <blockquote style={{ marginTop: '1.5rem', marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '4px solid #d1d5db', fontStyle: 'italic' }}>{children}</blockquote>,
            hr: () => <hr style={{ marginTop: '2rem', marginBottom: '2rem', borderColor: '#d1d5db' }} />,
            table: ({ children }) => <table style={{ marginTop: '1.5rem', marginBottom: '1.5rem', borderCollapse: 'collapse', width: '100%' }}>{children}</table>,
            th: ({ children }) => <th style={{ border: '1px solid #d1d5db', padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', fontWeight: '600' }}>{children}</th>,
            td: ({ children }) => <td style={{ border: '1px solid #d1d5db', padding: '0.5rem 1rem' }}>{children}</td>,
          }}
        >
          {data.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

