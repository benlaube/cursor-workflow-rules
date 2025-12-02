/**
 * Documentation Interface Module
 * 
 * Public API exports for the documentation interface module.
 * 
 * Dependencies: All internal components, hooks, and services
 */

// Components
export { DocViewer } from './src/components/DocViewer'
export { DocEditor } from './src/components/DocEditor'
export { DocList } from './src/components/DocList'
export { DocSearch } from './src/components/DocSearch'
export { DocHistory } from './src/components/DocHistory'
export { DocToolbar } from './src/components/DocToolbar'
export { DocsInterface } from './src/components/DocsInterface'
export { DocsWelcome } from './src/components/DocsWelcome'

// Hooks
export { useDocFile } from './src/hooks/useDocFile'
export { useDocSearch } from './src/hooks/useDocSearch'
export { useGitHistory } from './src/hooks/useGitHistory'

// Services (for advanced usage)
export { FileService, createFileService } from './src/services/file-service'
export { GitService, createGitService } from './src/services/git-service'
export { SearchService, createSearchService } from './src/services/search-service'

// Types
export type { DocFileData, UseDocFileReturn } from './src/hooks/useDocFile'
export type { UseDocSearchReturn } from './src/hooks/useDocSearch'
export type { UseGitHistoryReturn } from './src/hooks/useGitHistory'
export type { FileMetadata } from './src/services/file-service'
export type { GitCommit } from './src/services/git-service'
export type { SearchResult } from './src/services/search-service'

