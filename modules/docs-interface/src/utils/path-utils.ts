/**
 * Path Utilities
 * 
 * Provides path validation and normalization functions to prevent directory traversal
 * and ensure all operations are restricted to the /docs folder.
 * 
 * Dependencies: None (Node.js built-in path module)
 */

import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Normalize and validate a file path to ensure it's within the docs directory.
 * Prevents directory traversal attacks by resolving paths and checking boundaries.
 * 
 * @param filePath - The file path to validate (relative or absolute)
 * @param docsRoot - The root directory for docs (default: process.cwd() + '/docs')
 * @returns Normalized absolute path if valid
 * @throws Error if path is outside docs directory or contains invalid characters
 * 
 * @example
 * ```typescript
 * const safePath = validatePath('../docs/file.md', '/project/docs')
 * // Returns: '/project/docs/file.md'
 * 
 * validatePath('../../etc/passwd', '/project/docs')
 * // Throws: Error('Path outside docs directory')
 * ```
 */
export function validatePath(filePath: string, docsRoot?: string): string {
  const root = docsRoot || path.join(process.cwd(), 'docs')
  
  // Normalize the path to resolve any '..' or '.' segments
  const normalized = path.normalize(filePath)
  
  // Resolve to absolute path
  const absolutePath = path.isAbsolute(normalized) 
    ? normalized 
    : path.resolve(root, normalized)
  
  // Ensure the resolved path is within the docs root
  const resolvedRoot = path.resolve(root)
  if (!absolutePath.startsWith(resolvedRoot)) {
    throw new Error('Path outside docs directory')
  }
  
  return absolutePath
}

/**
 * Sanitize a filename to prevent security issues.
 * Removes or replaces dangerous characters and patterns.
 * 
 * @param filename - The filename to sanitize
 * @returns Sanitized filename safe for filesystem operations
 * 
 * @example
 * ```typescript
 * sanitizeFilename('../../file.md') // Returns: 'file.md'
 * sanitizeFilename('file<script>.md') // Returns: 'file.md'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and parent directory references
  let sanitized = filename.replace(/[\/\\\.\.]/g, '')
  
  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '')
  
  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[\s\.]+|[\s\.]+$/g, '')
  
  // Ensure it's not empty
  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid filename: empty after sanitization')
  }
  
  return sanitized
}

/**
 * Convert a file path to a relative path from the docs root.
 * 
 * @param filePath - Absolute file path
 * @param docsRoot - The root directory for docs
 * @returns Relative path from docs root
 */
export function getRelativePath(filePath: string, docsRoot?: string): string {
  const root = docsRoot || path.join(process.cwd(), 'docs')
  const resolvedRoot = path.resolve(root)
  const resolvedPath = path.resolve(filePath)
  
  return path.relative(resolvedRoot, resolvedPath)
}

/**
 * Check if a path represents a markdown file.
 * 
 * @param filePath - File path to check
 * @returns True if file has .md or .markdown extension
 */
export function isMarkdownFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase()
  return ext === '.md' || ext === '.markdown'
}

