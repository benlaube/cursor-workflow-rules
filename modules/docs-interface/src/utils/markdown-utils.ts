/**
 * Markdown Utilities
 * 
 * Provides markdown parsing and processing functions.
 * Handles frontmatter extraction and content processing.
 * 
 * Dependencies: gray-matter
 */

import matter from 'gray-matter'

/**
 * Document metadata extracted from frontmatter.
 */
export interface DocMetadata {
  title?: string
  description?: string
  created?: string
  lastUpdated?: string
  version?: string
  [key: string]: any
}

/**
 * Parsed document with content and metadata.
 */
export interface ParsedDoc {
  content: string
  metadata: DocMetadata
  raw: string
}

/**
 * Parse markdown file content, extracting frontmatter and content.
 * 
 * @param content - Raw markdown file content
 * @returns Parsed document with content and metadata
 * 
 * @example
 * ```typescript
 * const doc = parseMarkdown(`---
 * title: My Doc
 * version: 1.0
 * ---
 * # Content
 * `)
 * // Returns: { content: '# Content', metadata: { title: 'My Doc', version: '1.0' }, raw: '...' }
 * ```
 */
export function parseMarkdown(content: string): ParsedDoc {
  const parsed = matter(content)
  
  return {
    content: parsed.content,
    metadata: parsed.data as DocMetadata,
    raw: content,
  }
}

/**
 * Combine metadata and content back into markdown format.
 * 
 * @param content - Markdown content
 * @param metadata - Frontmatter metadata
 * @returns Complete markdown string with frontmatter
 * 
 * @example
 * ```typescript
 * const markdown = stringifyMarkdown('# Content', { title: 'My Doc' })
 * // Returns: '---\ntitle: My Doc\n---\n# Content'
 * ```
 */
export function stringifyMarkdown(content: string, metadata?: DocMetadata): string {
  if (!metadata || Object.keys(metadata).length === 0) {
    return content
  }
  
  return matter.stringify(content, metadata)
}

/**
 * Extract title from markdown content (first H1 or from metadata).
 * 
 * @param content - Markdown content
 * @param metadata - Optional frontmatter metadata
 * @returns Document title or null
 */
export function extractTitle(content: string, metadata?: DocMetadata): string | null {
  // Check metadata first
  if (metadata?.title) {
    return metadata.title
  }
  
  // Extract from first H1
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }
  
  return null
}

/**
 * Generate a default markdown template for new documents.
 * 
 * @param title - Document title
 * @param description - Optional description
 * @returns Markdown template with frontmatter
 */
export function generateDocTemplate(title: string, description?: string): string {
  const now = new Date().toISOString().split('T')[0]
  
  const metadata: DocMetadata = {
    title,
    description: description || '',
    created: now,
    lastUpdated: now,
    version: '1.0',
  }
  
  return stringifyMarkdown(`# ${title}\n\n${description || 'Documentation content goes here.'}`, metadata)
}

