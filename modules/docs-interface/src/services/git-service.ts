/**
 * Git Service
 * 
 * Provides git operations for auto-committing documentation changes.
 * Handles commit creation, history retrieval, and diff viewing.
 * 
 * Dependencies: simple-git
 */

import simpleGit, { SimpleGit, LogResult } from 'simple-git'
import path from 'path'

/**
 * Git commit information.
 */
export interface GitCommit {
  hash: string
  date: Date
  message: string
  author: string
  refs: string
}

/**
 * Git service configuration.
 */
export interface GitServiceConfig {
  repoRoot?: string
  authorName?: string
  authorEmail?: string
}

/**
 * Git service class for managing git operations.
 */
export class GitService {
  private git: SimpleGit
  private repoRoot: string
  private authorName: string
  private authorEmail: string

  constructor(config: GitServiceConfig = {}) {
    this.repoRoot = config.repoRoot || process.cwd()
    this.authorName = config.authorName || 'Docs Interface'
    this.authorEmail = config.authorEmail || 'docs@localhost'
    
    this.git = simpleGit(this.repoRoot)
  }

  /**
   * Check if the current directory is a git repository.
   * 
   * @returns True if git repo exists
   */
  async isGitRepo(): Promise<boolean> {
    try {
      await this.git.status()
      return true
    } catch {
      return false
    }
  }

  /**
   * Get the current git status.
   * 
   * @returns Status information or null if not a git repo
   */
  async getStatus(): Promise<{ files: string[]; isClean: boolean } | null> {
    if (!(await this.isGitRepo())) {
      return null
    }
    
    try {
      const status = await this.git.status()
      return {
        files: status.files.map(f => f.path),
        isClean: status.isClean(),
      }
    } catch (error: any) {
      throw new Error(`Failed to get git status: ${error.message}`)
    }
  }

  /**
   * Stage a file for commit.
   * 
   * @param filePath - Path to file relative to repo root
   */
  async stageFile(filePath: string): Promise<void> {
    if (!(await this.isGitRepo())) {
      throw new Error('Not a git repository')
    }
    
    try {
      await this.git.add(filePath)
    } catch (error: any) {
      throw new Error(`Failed to stage file: ${error.message}`)
    }
  }

  /**
   * Commit staged changes with a message.
   * 
   * @param message - Commit message
   * @param filePath - Optional specific file path for commit message context
   * @returns Commit hash
   */
  async commit(message: string, filePath?: string): Promise<string> {
    if (!(await this.isGitRepo())) {
      throw new Error('Not a git repository')
    }
    
    try {
      // Check if there are staged changes
      const status = await this.git.status()
      if (status.staged.length === 0) {
        throw new Error('No staged changes to commit')
      }
      
      // Create commit with author info
      const commitMessage = filePath 
        ? `${message} (${filePath})`
        : message
      
      const result = await this.git
        .addConfig('user.name', this.authorName)
        .addConfig('user.email', this.authorEmail)
        .commit(commitMessage)
      
      return result.commit || ''
    } catch (error: any) {
      throw new Error(`Failed to commit: ${error.message}`)
    }
  }

  /**
   * Auto-commit a file change (stage + commit).
   * 
   * @param filePath - Path to file relative to repo root
   * @param action - Action type (create, update, delete)
   * @returns Commit hash
   */
  async autoCommit(filePath: string, action: 'create' | 'update' | 'delete'): Promise<string> {
    if (!(await this.isGitRepo())) {
      // Silently fail if not a git repo (dev environment might not have git)
      return ''
    }
    
    try {
      const messages = {
        create: `docs: create ${filePath}`,
        update: `docs: update ${filePath}`,
        delete: `docs: delete ${filePath}`,
      }
      
      await this.stageFile(filePath)
      return await this.commit(messages[action], filePath)
    } catch (error: any) {
      // Log but don't throw - git operations shouldn't block file operations
      console.warn(`Git auto-commit failed: ${error.message}`)
      return ''
    }
  }

  /**
   * Get commit history for a specific file.
   * 
   * @param filePath - Path to file relative to repo root
   * @param limit - Maximum number of commits to return
   * @returns Array of commit information
   */
  async getFileHistory(filePath: string, limit: number = 20): Promise<GitCommit[]> {
    if (!(await this.isGitRepo())) {
      return []
    }
    
    try {
      const log = await this.git.log({
        file: filePath,
        maxCount: limit,
      })
      
      return log.all.map((commit): GitCommit => ({
        hash: commit.hash,
        date: new Date(commit.date),
        message: commit.message,
        author: commit.author_name,
        refs: commit.refs,
      }))
    } catch (error: any) {
      throw new Error(`Failed to get file history: ${error.message}`)
    }
  }

  /**
   * Get the diff for a file between two commits.
   * 
   * @param filePath - Path to file relative to repo root
   * @param fromHash - Starting commit hash (default: HEAD~1)
   * @param toHash - Ending commit hash (default: HEAD)
   * @returns Diff string
   */
  async getFileDiff(
    filePath: string,
    fromHash?: string,
    toHash?: string
  ): Promise<string> {
    if (!(await this.isGitRepo())) {
      return ''
    }
    
    try {
      const from = fromHash || 'HEAD~1'
      const to = toHash || 'HEAD'
      
      const diff = await this.git.diff([from, to, '--', filePath])
      return diff
    } catch (error: any) {
      throw new Error(`Failed to get file diff: ${error.message}`)
    }
  }

  /**
   * Get the diff for a file at a specific commit.
   * 
   * @param filePath - Path to file relative to repo root
   * @param commitHash - Commit hash
   * @returns Diff string showing what changed in that commit
   */
  async getCommitDiff(filePath: string, commitHash: string): Promise<string> {
    if (!(await this.isGitRepo())) {
      return ''
    }
    
    try {
      const diff = await this.git.show([commitHash, '--', filePath])
      return diff
    } catch (error: any) {
      throw new Error(`Failed to get commit diff: ${error.message}`)
    }
  }

  /**
   * Checkout a specific version of a file from a commit.
   * WARNING: This will overwrite the current file.
   * 
   * @param filePath - Path to file relative to repo root
   * @param commitHash - Commit hash to restore from
   */
  async restoreFile(filePath: string, commitHash: string): Promise<void> {
    if (!(await this.isGitRepo())) {
      throw new Error('Not a git repository')
    }
    
    try {
      await this.git.checkout([commitHash, '--', filePath])
    } catch (error: any) {
      throw new Error(`Failed to restore file: ${error.message}`)
    }
  }
}

/**
 * Create a git service instance with default configuration.
 */
export function createGitService(config?: GitServiceConfig): GitService {
  return new GitService(config)
}

