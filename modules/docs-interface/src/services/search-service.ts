/**
 * Search Service
 * 
 * Provides full-text search functionality across markdown files.
 * Searches both file content and filenames.
 * 
 * Dependencies: fuse.js, file-service
 */

import Fuse from 'fuse.js'
import { FileService, type FileMetadata } from './file-service'

/**
 * Search result with context snippet.
 */
export interface SearchResult {
  file: FileMetadata
  matches: Array<{
    field: 'content' | 'filename' | 'metadata'
    value: string
    indices?: [number, number][]
  }>
  score: number
}

/**
 * Search service configuration.
 */
export interface SearchServiceConfig {
  fileService: FileService
  minScore?: number
  limit?: number
}

/**
 * Search service class for full-text search.
 */
export class SearchService {
  private fileService: FileService
  private minScore: number
  private limit: number
  private index: Fuse<FileMetadata> | null = null
  private filesCache: FileMetadata[] | null = null

  constructor(config: SearchServiceConfig) {
    this.fileService = config.fileService
    this.minScore = config.minScore ?? 0.6
    this.limit = config.limit ?? 50
  }

  /**
   * Build or rebuild the search index from all files.
   * 
   * @param force - Force rebuild even if cache exists
   */
  async buildIndex(force: boolean = false): Promise<void> {
    if (this.index && !force) {
      return
    }
    
    // Load all files
    this.filesCache = await this.fileService.listFiles()
    
    // Configure Fuse.js for markdown search
    const fuseOptions: Fuse.IFuseOptions<FileMetadata> = {
      keys: [
        { name: 'name', weight: 0.3 },
        { name: 'relativePath', weight: 0.2 },
        // Note: We'll search content separately since it's not in FileMetadata
      ],
      threshold: this.minScore,
      includeScore: true,
      includeMatches: true,
    }
    
    this.index = new Fuse(this.filesCache, fuseOptions)
  }

  /**
   * Search across filenames and paths.
   * 
   * @param query - Search query
   * @returns Array of matching files
   */
  async searchFilenames(query: string): Promise<SearchResult[]> {
    await this.buildIndex()
    
    if (!this.index || !this.filesCache) {
      return []
    }
    
    const results = this.index.search(query, { limit: this.limit })
    
    return results
      .filter(result => result.score !== undefined && result.score <= this.minScore)
      .map(result => ({
        file: result.item,
        matches: result.matches?.map(match => ({
          field: match.key === 'name' || match.key === 'relativePath' 
            ? 'filename' as const
            : 'metadata' as const,
          value: match.value || '',
          indices: match.indices,
        })) || [],
        score: result.score || 1,
      }))
  }

  /**
   * Search in file content (requires reading files).
   * 
   * @param query - Search query
   * @returns Array of matching files with content snippets
   */
  async searchContent(query: string): Promise<SearchResult[]> {
    const files = await this.fileService.listFiles()
    const results: SearchResult[] = []
    
    // Search in each file's content
    for (const file of files.slice(0, 100)) { // Limit to prevent too many reads
      try {
        const { content, metadata } = await this.fileService.readFile(file.relativePath)
        
        // Simple text search with context
        const lowerQuery = query.toLowerCase()
        const lowerContent = content.toLowerCase()
        
        if (lowerContent.includes(lowerQuery)) {
          // Find all matches
          const matches: Array<{ field: 'content'; value: string; indices?: [number, number][] }> = []
          
          let index = 0
          while ((index = lowerContent.indexOf(lowerQuery, index)) !== -1) {
            // Extract context around match (100 chars before and after)
            const start = Math.max(0, index - 100)
            const end = Math.min(content.length, index + query.length + 100)
            const snippet = content.substring(start, end)
            
            matches.push({
              field: 'content',
              value: snippet,
              indices: [[index - start, index - start + query.length]],
            })
            
            index += query.length
          }
          
          if (matches.length > 0) {
            results.push({
              file,
              matches,
              score: 0.5, // Content matches get lower score than filename matches
            })
          }
        }
        
        // Also search in metadata
        const metadataStr = JSON.stringify(metadata).toLowerCase()
        if (metadataStr.includes(lowerQuery)) {
          results.push({
            file,
            matches: [{
              field: 'metadata',
              value: JSON.stringify(metadata),
            }],
            score: 0.4,
          })
        }
      } catch (error) {
        // Skip files that can't be read
        continue
      }
    }
    
    // Sort by score and limit
    return results
      .sort((a, b) => a.score - b.score)
      .slice(0, this.limit)
  }

  /**
   * Comprehensive search across filenames, paths, and content.
   * 
   * @param query - Search query
   * @returns Combined search results
   */
  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }
    
    // Search filenames first (faster)
    const filenameResults = await this.searchFilenames(query)
    
    // Search content (slower, but more comprehensive)
    const contentResults = await this.searchContent(query)
    
    // Combine and deduplicate results
    const resultMap = new Map<string, SearchResult>()
    
    // Add filename results (higher priority)
    for (const result of filenameResults) {
      resultMap.set(result.file.path, result)
    }
    
    // Merge content results
    for (const result of contentResults) {
      const existing = resultMap.get(result.file.path)
      if (existing) {
        // Merge matches
        existing.matches.push(...result.matches)
        // Keep better (lower) score
        existing.score = Math.min(existing.score, result.score)
      } else {
        resultMap.set(result.file.path, result)
      }
    }
    
    // Sort by score and return
    return Array.from(resultMap.values())
      .sort((a, b) => a.score - b.score)
      .slice(0, this.limit)
  }

  /**
   * Clear the search index cache.
   */
  clearCache(): void {
    this.index = null
    this.filesCache = null
  }
}

/**
 * Create a search service instance.
 */
export function createSearchService(config: SearchServiceConfig): SearchService {
  return new SearchService(config)
}

