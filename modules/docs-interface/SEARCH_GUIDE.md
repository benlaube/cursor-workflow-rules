# Search Functionality Guide

## How Search Works

The documentation interface includes a comprehensive full-text search system that searches across filenames, file paths, and file content.

### Search Architecture

**Frontend:**

- `DocSearch` component - Search UI with input and results list
- `useDocSearch` hook - React hook with debounced search (300ms delay)
- Calls `/api/docs?search=query` API endpoint

**Backend:**

- `SearchService` - Full-text search service using Fuse.js
- `FileService` - File reading and metadata access
- API route: `app/api/docs/route.ts` handles search requests

### Search Process

1. **User Types Query**
   - Input is debounced (300ms delay)
   - Prevents excessive API calls while typing

2. **API Request**
   - Frontend calls: `GET /api/docs?search=query`
   - Backend receives query parameter

3. **Search Execution**
   - **Filename Search** (Fast):
     - Uses Fuse.js to search file names and paths
     - Weighted search (filename: 30%, path: 20%)
     - Returns results with match scores

   - **Content Search** (Slower):
     - Reads file content for each markdown file
     - Performs case-insensitive text search
     - Extracts context snippets (100 chars before/after match)
     - Searches metadata (title, description, etc.)
     - Limited to first 100 files for performance

4. **Result Merging**
   - Combines filename and content results
   - Deduplicates by file path
   - Merges matches from same file
   - Sorts by relevance score (lower = better)
   - Limits to top 50 results

5. **Display Results**
   - Shows file name, path, and content snippet
   - Clicking result opens the file
   - Highlights matching text in snippets

### Search Features

**What Gets Searched:**

- ✅ File names (e.g., `README.md`)
- ✅ File paths (e.g., `docs/process/checklist.md`)
- ✅ File content (markdown text)
- ✅ Metadata (title, description from frontmatter)

**Search Characteristics:**

- **Fuzzy Matching:** Finds partial matches (e.g., "check" matches "checklist")
- **Case Insensitive:** "README" matches "readme"
- **Context Snippets:** Shows text around matches
- **Relevance Scoring:** Better matches appear first
- **Debounced:** Waits 300ms after typing stops

### Performance

**Optimizations:**

- Filename search is fast (uses index)
- Content search is slower (reads files)
- Limited to 100 files for content search
- Results cached in memory
- Debouncing prevents excessive searches

**Typical Performance:**

- Filename search: < 10ms
- Content search: 100-500ms (depends on file count)
- Combined search: 100-600ms

### Usage

**In the Interface:**

1. Click "Search" button in toolbar
2. Type your query in the search box
3. Results appear as you type (after 300ms delay)
4. Click a result to open that file
5. Click "×" to clear search

**Search Tips:**

- Use specific terms for better results
- Search for file names to find files quickly
- Search for content to find specific information
- Results are sorted by relevance

### API Endpoint

**Search Request:**

```http
GET /api/docs?search=query
```

**Response:**

```json
{
  "data": [
    {
      "file": {
        "path": "/full/path/to/file.md",
        "relativePath": "docs/example.md",
        "name": "example.md",
        "size": 1234,
        "lastModified": "2025-12-01T12:00:00Z"
      },
      "matches": [
        {
          "field": "content",
          "value": "...context around match...",
          "indices": [[10, 20]]
        }
      ],
      "score": 0.3
    }
  ],
  "meta": {
    "count": 5,
    "query": "search term"
  }
}
```

### Configuration

**Search Service Options:**

- `minScore`: Minimum relevance score (default: 0.6)
- `limit`: Maximum results (default: 50)
- `debounceMs`: Debounce delay (default: 300ms)

**Customization:**

```typescript
import { createSearchService } from '@/lib/docs-interface';

const searchService = createSearchService({
  fileService: myFileService,
  minScore: 0.5, // More lenient matching
  limit: 100, // More results
});
```

### Limitations

- Content search limited to first 100 files (for performance)
- Large files may have slower content search
- Search index rebuilt on each search (could be optimized with caching)
- No search history or saved searches

### Future Enhancements

Potential improvements:

- Persistent search index cache
- Search history
- Advanced filters (by folder, date, etc.)
- Regex search support
- Search result highlighting in file viewer
