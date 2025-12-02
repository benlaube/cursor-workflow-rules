/**
 * Documentation Interface Module Tests
 * 
 * Unit tests for file service, git service, and search service.
 * 
 * Dependencies: Vitest (or your test framework)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validatePath, sanitizeFilename, isMarkdownFile } from '../src/utils/path-utils'
import { parseMarkdown, stringifyMarkdown, generateDocTemplate } from '../src/utils/markdown-utils'

describe('Path Utils', () => {
  describe('validatePath', () => {
    it('should validate a valid path within docs directory', () => {
      const path = 'example.md'
      expect(() => validatePath(path)).not.toThrow()
    })

    it('should reject paths outside docs directory', () => {
      const path = '../../../etc/passwd'
      expect(() => validatePath(path)).toThrow('Path outside docs directory')
    })

    it('should normalize path separators', () => {
      const path = 'folder\\file.md'
      expect(() => validatePath(path)).not.toThrow()
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      expect(sanitizeFilename('../file.md')).toBe('filemd')
    })

    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('file<script>.md')).toBe('filemd')
    })

    it('should throw on empty filename', () => {
      expect(() => sanitizeFilename('')).toThrow('Invalid filename')
    })
  })

  describe('isMarkdownFile', () => {
    it('should identify .md files', () => {
      expect(isMarkdownFile('file.md')).toBe(true)
    })

    it('should identify .markdown files', () => {
      expect(isMarkdownFile('file.markdown')).toBe(true)
    })

    it('should reject non-markdown files', () => {
      expect(isMarkdownFile('file.txt')).toBe(false)
    })
  })
})

describe('Markdown Utils', () => {
  describe('parseMarkdown', () => {
    it('should parse markdown with frontmatter', () => {
      const content = `---
title: Test
version: 1.0
---
# Content
`
      const result = parseMarkdown(content)
      expect(result.metadata.title).toBe('Test')
      expect(result.metadata.version).toBe('1.0')
      expect(result.content.trim()).toBe('# Content')
    })

    it('should parse markdown without frontmatter', () => {
      const content = '# Content'
      const result = parseMarkdown(content)
      expect(result.content).toBe('# Content')
      expect(Object.keys(result.metadata)).toHaveLength(0)
    })
  })

  describe('stringifyMarkdown', () => {
    it('should combine metadata and content', () => {
      const content = '# Content'
      const metadata = { title: 'Test', version: '1.0' }
      const result = stringifyMarkdown(content, metadata)
      expect(result).toContain('title: Test')
      expect(result).toContain('# Content')
    })

    it('should return content only if no metadata', () => {
      const content = '# Content'
      const result = stringifyMarkdown(content)
      expect(result).toBe('# Content')
    })
  })

  describe('generateDocTemplate', () => {
    it('should generate template with title', () => {
      const template = generateDocTemplate('Test Doc', 'Description')
      expect(template).toContain('title: Test Doc')
      expect(template).toContain('description: Description')
      expect(template).toContain('# Test Doc')
    })
  })
})

// Note: File service, git service, and search service tests would require
// mocking file system and git operations, which is more complex.
// These would be integration tests rather than unit tests.

