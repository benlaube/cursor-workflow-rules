/**
 * File Service
 * 
 * Provides file system operations for reading, writing, and managing markdown files
 * in the /docs folder. Includes path validation and safety checks.
 * 
 * Dependencies: Node.js fs/promises, path-utils, markdown-utils
 */

import fs from 'fs/promises'
import path from 'path'
import { validatePath, sanitizeFilename, isMarkdownFile, getRelativePath } from '../utils/path-utils'
import { parseMarkdown, stringifyMarkdown, generateDocTemplate, type DocMetadata } from '../utils/markdown-utils'

/**
 * File metadata information.
 */
export interface FileMetadata {
  path: string
  relativePath: string
  name: string
  size: number
  lastModified: Date
  isDirectory: boolean
  metadata?: DocMetadata
}

/**
 * File service configuration.
 */
export interface FileServiceConfig {
  docsRoot?: string
}

/**
 * File service class for managing documentation files.
 */
export class FileService {
  private docsRoot: string

  constructor(config: FileServiceConfig = {}) {
    this.docsRoot = config.docsRoot || path.join(process.cwd(), 'docs')
  }

  /**
   * Read a markdown file and return its content and metadata.
   * 
   * @param filePath - Relative or absolute path to the file
   * @returns File content and parsed metadata
   * @throws Error if file doesn't exist or path is invalid
   */
  async readFile(filePath: string): Promise<{ content: string; metadata: DocMetadata }> {
    const safePath = validatePath(filePath, this.docsRoot)
    
    if (!isMarkdownFile(safePath)) {
      throw new Error('File must be a markdown file (.md or .markdown)')
    }
    
    const content = await fs.readFile(safePath, 'utf-8')
    const parsed = parseMarkdown(content)
    
    return {
      content: parsed.content,
      metadata: parsed.metadata,
    }
  }

  /**
   * Write content to a markdown file.
   * Creates the file if it doesn't exist, updates if it does.
   * 
   * @param filePath - Relative or absolute path to the file
   * @param content - Markdown content (without frontmatter)
   * @param metadata - Optional frontmatter metadata
   * @throws Error if path is invalid or write fails
   */
  async writeFile(
    filePath: string,
    content: string,
    metadata?: DocMetadata
  ): Promise<void> {
    const safePath = validatePath(filePath, this.docsRoot)
    
    if (!isMarkdownFile(safePath)) {
      throw new Error('File must be a markdown file (.md or .markdown)')
    }
    
    // Ensure directory exists
    const dir = path.dirname(safePath)
    await fs.mkdir(dir, { recursive: true })
    
    // Update lastUpdated in metadata
    const updatedMetadata: DocMetadata = {
      ...metadata,
      lastUpdated: new Date().toISOString().split('T')[0],
    }
    
    const fullContent = stringifyMarkdown(content, updatedMetadata)
    await fs.writeFile(safePath, fullContent, 'utf-8')
  }

  /**
   * Delete a markdown file.
   * 
   * @param filePath - Relative or absolute path to the file
   * @throws Error if file doesn't exist or path is invalid
   */
  async deleteFile(filePath: string): Promise<void> {
    const safePath = validatePath(filePath, this.docsRoot)
    
    if (!isMarkdownFile(safePath)) {
      throw new Error('File must be a markdown file (.md or .markdown)')
    }
    
    await fs.unlink(safePath)
  }

  /**
   * Create a new markdown file with a template.
   * 
   * @param filePath - Relative or absolute path to the new file
   * @param title - Document title
   * @param description - Optional description
   * @throws Error if file already exists or path is invalid
   */
  async createFile(
    filePath: string,
    title: string,
    description?: string
  ): Promise<void> {
    const safePath = validatePath(filePath, this.docsRoot)
    
    if (!isMarkdownFile(safePath)) {
      throw new Error('File must be a markdown file (.md or .markdown)')
    }
    
    // Check if file already exists
    try {
      await fs.access(safePath)
      throw new Error('File already exists')
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
    
    const template = generateDocTemplate(title, description)
    await this.writeFile(filePath, template.split('---\n')[2] || template, {
      title,
      description,
      created: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      version: '1.0',
    })
  }

  /**
   * List all markdown files in the docs directory recursively.
   * 
   * @param folderPath - Optional subfolder to list (default: root)
   * @returns Array of file metadata
   */
  async listFiles(folderPath: string = ''): Promise<FileMetadata[]> {
    const targetPath = folderPath 
      ? validatePath(folderPath, this.docsRoot)
      : this.docsRoot
    
    const files: FileMetadata[] = []
    
    async function traverseDir(dir: string, relativeDir: string = ''): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.join(relativeDir, entry.name)
        
        if (entry.isDirectory()) {
          // Recursively traverse subdirectories
          await traverseDir(fullPath, relativePath)
        } else if (isMarkdownFile(entry.name)) {
          // Get file stats
          const stats = await fs.stat(fullPath)
          
          // Try to read metadata
          let metadata: DocMetadata | undefined
          try {
            const content = await fs.readFile(fullPath, 'utf-8')
            const parsed = parseMarkdown(content)
            metadata = parsed.metadata
          } catch {
            // If we can't read metadata, continue without it
          }
          
          files.push({
            path: fullPath,
            relativePath,
            name: entry.name,
            size: stats.size,
            lastModified: stats.mtime,
            isDirectory: false,
            metadata,
          })
        }
      }
    }
    
    await traverseDir(targetPath, folderPath)
    return files
  }

  /**
   * Get file metadata without reading the full content.
   * 
   * @param filePath - Relative or absolute path to the file
   * @returns File metadata
   */
  async getFileMetadata(filePath: string): Promise<FileMetadata> {
    const safePath = validatePath(filePath, this.docsRoot)
    const stats = await fs.stat(safePath)
    
    let metadata: DocMetadata | undefined
    try {
      const content = await fs.readFile(safePath, 'utf-8')
      const parsed = parseMarkdown(content)
      metadata = parsed.metadata
    } catch {
      // Continue without metadata if read fails
    }
    
    return {
      path: safePath,
      relativePath: getRelativePath(safePath, this.docsRoot),
      name: path.basename(safePath),
      size: stats.size,
      lastModified: stats.mtime,
      isDirectory: stats.isDirectory(),
      metadata,
    }
  }

  /**
   * Check if a file exists.
   * 
   * @param filePath - Relative or absolute path to the file
   * @returns True if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const safePath = validatePath(filePath, this.docsRoot)
      await fs.access(safePath)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Create a file service instance with default configuration.
 */
export function createFileService(config?: FileServiceConfig): FileService {
  return new FileService(config)
}

