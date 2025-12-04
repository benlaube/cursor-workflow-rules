# Documentation Interface Module

## Metadata
- **Version:** 1.0.0
- **Created:** 2024-11-19
- **Last Updated:** 2024-12-01
- **Description:** Full-featured documentation interface for viewing, editing, and managing markdown files in development environments

Full-featured documentation interface for viewing, editing, and managing markdown files in the `/docs` folder. Provides a web-based UI accessible only in development environments.

## Features

- ✅ **Welcome Page** - Onboarding with health checks and setup guidance
- ✅ **View Documentation** - Render markdown with syntax highlighting
- ✅ **Edit Documentation** - Split-pane editor with live preview
- ✅ **Create New Docs** - Create new markdown files with templates
- ✅ **Delete Docs** - Remove documentation files
- ✅ **Search** - Full-text fuzzy search across filenames and content (powered by Fuse.js)
- ✅ **Version History** - View git commit history for files
- ✅ **Auto-Commit** - Automatically commit changes to git
- ✅ **File Navigation** - Tree view of documentation structure

## Platform Requirements & Cross-Language Support

### Requirements to Run the Interface
- **Node.js:** 18+ (required to run the documentation interface)
- **npm:** Latest version
- **Git:** Optional (enables version history features, gracefully degrades without it)

### Your Project Can Be Any Language

The docs-interface is built with Next.js but **manages plain markdown files**, making it compatible with projects in **any programming language**.

**✅ Supported Project Types:**
- Python, Go, Ruby, Java, Rust, PHP
- Node.js, TypeScript, JavaScript
- Any language with a `/docs` folder

The interface only requires Node.js to *run itself* - your actual project can use any language or framework.

### Path Configuration Examples

**Scenario 1: Module Inside Project** (module at `/project/modules/docs-interface`, docs at `/project/docs`)

Edit `modules/docs-interface/app/api/docs/route.ts`:
```typescript
import path from 'path'
import { createFileService } from '../../../src/services/file-service'

const fileService = createFileService({
  docsRoot: path.join(process.cwd(), '..', '..', 'docs')  // Points to /project/docs
})
```

**Scenario 2: Standalone Documentation Server**

Run docs-interface as a separate service pointing to any project:
```typescript
const fileService = createFileService({
  docsRoot: '/absolute/path/to/your-python-project/docs'
})
```

**Scenario 3: Run Alongside Non-Node.js Projects**

```bash
# Terminal 1: Your application (any language)
python app.py          # Python
# go run main.go       # Go
# ruby app.rb          # Ruby

# Terminal 2: Documentation interface
cd /path/to/docs-interface
npm run dev
# Access at http://localhost:3000/docs
```

Your application runs independently - the docs-interface only serves the documentation UI.

## Dependencies

- `react` / `react-dom` - React components
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown support
- `rehype-highlight` - Syntax highlighting
- `simple-git` - Git operations
- `gray-matter` - Frontmatter parsing
- `fuse.js` - Full-text search
- `next` - Next.js framework (peer dependency)

**Why Each Dependency:**
- `react-markdown` - Converts markdown to React components
- `remark-gfm` - Adds GitHub-flavored markdown (tables, task lists, strikethrough)
- `rehype-highlight` - Syntax highlighting for code blocks
- `simple-git` - Git operations for version history and auto-commits
- `gray-matter` - Parses YAML frontmatter in markdown files
- `fuse.js` - Fast fuzzy search with typo tolerance

All dependencies are small, focused libraries (no heavy frameworks beyond React/Next.js).

## Installation

### Quick Start (Recommended)

**The module is now self-contained!** You can run it directly from the `docs-interface` folder without needing a separate test environment.

**Option 1: Run Directly from Module (Recommended)**

**Unix/Mac/Linux:**
```bash
cd modules/docs-interface
./launch-docs.sh
```

**Windows:**
```cmd
cd modules\docs-interface
launch-docs.bat
```

The launch script automatically detects if the module is self-contained and runs it directly, or falls back to the test environment if needed.

**Option 2: HTML Launcher**

Simply open `LAUNCH.html` in your browser for visual launch instructions with copy-paste commands.

The script automatically handles:
- ✅ Dependency installation
- ✅ Port checking
- ✅ Sample documentation creation
- ✅ Server launch

Then open `http://localhost:3000/docs` in your browser.

### Manual Installation

Copy this module to your project:

```bash
cp -r modules/docs-interface /path/to/your/project/lib/docs-interface
```

Install dependencies:

```bash
npm install react-markdown remark-gfm rehype-highlight simple-git gray-matter fuse.js
```

**CSS Setup (Choose One):**

**Option 1: Standalone CSS (No Tailwind Required)**
```tsx
// app/layout.tsx or app/docs/page.tsx
import '@/lib/docs-interface/styles/docs-interface.css'
```

**Option 2: Use Tailwind (If Already Installed)**
```tsx
// app/layout.tsx or app/docs/page.tsx
import 'highlight.js/styles/github.css'
```

And configure Tailwind to scan the module:
```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/docs-interface/src/**/*.{js,ts,jsx,tsx}',  // Add this
  ],
}
```

## Usage

### Basic Setup

Create a Next.js route to host the documentation interface:

```tsx
// app/docs/page.tsx
import { DocsInterface } from '@/lib/docs-interface'

export default function DocsPage() {
  // Dev-only check
  if (process.env.NODE_ENV !== 'development') {
    return <div>Documentation interface is only available in development mode</div>
  }

  return <DocsInterface />
}
```

**First-Time Experience:**

When users first access the interface, they'll see a welcome page with:
- System health checks (Next.js environment, docs directory, git repo, API routes)
- Feature overview
- Quick setup instructions
- "Get Started" button to launch the main interface

**Settings Page (Always Accessible):**

After the first visit, users can access the Settings page anytime via the **⚙️ Settings** button in the toolbar. The Settings page shows:
- Current system status and health checks
- Feature overview
- Setup instructions
- "Back to Interface" button to return

The Settings page is the same as the welcome page but accessible from the main interface, making it easy to check system status or review setup instructions at any time.

### Using Individual Components

```tsx
import { DocViewer, DocEditor, DocList, DocSearch, DocsWelcome } from '@/lib/docs-interface'

// Show welcome page
<DocsWelcome onGetStarted={() => console.log('Ready to start')} />

// View a document
<DocViewer data={docData} />

// Edit a document
<DocEditor filePath="docs/example.md" />

// List all documents
<DocList onSelectFile={(path) => console.log(path)} />

// Search documents
<DocSearch onSelectFile={(path) => console.log(path)} />
```

### Using Hooks

```tsx
import { useDocFile, useDocSearch, useGitHistory } from '@/lib/docs-interface'

// Load and manage a file
const { data, loading, saveFile, updateContent } = useDocFile('docs/example.md')

// Search documentation
const { query, results, setQuery } = useDocSearch()

// Get git history
const { history, loadHistory } = useGitHistory('docs/example.md')
```

## TypeScript Types

All public APIs are fully typed. Import types for type-safe usage:

```typescript
import type { 
  DocFileData, 
  UseDocFileReturn,
  FileMetadata,
  SearchResult,
  GitCommit
} from '@/lib/docs-interface'
```

### Core Data Types

**DocFileData** - File content and metadata
```typescript
interface DocFileData {
  content: string                    // Markdown content
  metadata: Record<string, any>      // YAML frontmatter
  fileMetadata?: FileMetadata        // File system metadata
}
```

**FileMetadata** - File system information
```typescript
interface FileMetadata {
  path: string              // Absolute path
  relativePath: string      // Path relative to docs root
  name: string              // Filename
  size: number              // Size in bytes
  lastModified: Date        // Last modification time
  isDirectory: boolean      // True if directory
  metadata?: DocMetadata    // Parsed frontmatter
}
```

### Hook Return Types

**UseDocFileReturn** - File management hook
```typescript
interface UseDocFileReturn {
  data: DocFileData | null                                    // Current file data
  loading: boolean                                            // Loading state
  error: string | null                                        // Error message
  hasUnsavedChanges: boolean                                  // Unsaved edits flag
  loadFile: (path: string) => Promise<void>                   // Load a file
  saveFile: (content: string, metadata?: Record<string, any>) => Promise<void>  // Save changes
  updateContent: (content: string) => void                    // Update local content
  reset: () => void                                           // Reset to initial state
}
```

**UseDocSearchReturn** - Search hook
```typescript
interface UseDocSearchReturn {
  query: string                      // Current search query
  results: SearchResult[]            // Search results
  loading: boolean                   // Loading state
  setQuery: (query: string) => void  // Update search query
}
```

**UseGitHistoryReturn** - Git history hook
```typescript
interface UseGitHistoryReturn {
  history: GitCommit[]                        // Commit history
  loading: boolean                            // Loading state
  loadHistory: (path: string) => Promise<void>  // Load file history
}
```

### Service Types

**SearchResult** - Search result item
```typescript
interface SearchResult {
  file: FileMetadata        // File metadata object
  matches: Array<{          // Array of match details
    field: 'content' | 'filename' | 'metadata'  // Where match was found
    value: string           // Matching text snippet
    indices?: [number, number][]  // Character positions (optional)
  }>
  score: number             // Match score (0-1, lower = better match)
}
```

**Note:** The `file` property contains a `FileMetadata` object with `path`, `relativePath`, `name`, `size`, `lastModified`, `isDirectory`, and optional `metadata` fields.

**GitCommit** - Git commit information
```typescript
interface GitCommit {
  hash: string      // Commit SHA
  message: string   // Commit message
  author: string    // Author name and email
  date: Date        // Commit timestamp
}
```

### Component Props

**DocsInterface** - No props required
```typescript
<DocsInterface />
```

**DocViewer**
```typescript
interface DocViewerProps {
  data: DocFileData       // File data to display
  onEdit?: () => void     // Optional edit callback
}
```

**DocEditor**
```typescript
interface DocEditorProps {
  filePath: string                       // Path to file
  onSave?: (content: string) => void     // Save callback
  onCancel?: () => void                  // Cancel callback
}
```

**DocList**
```typescript
interface DocListProps {
  onSelectFile: (path: string) => void   // File selection callback
  selectedPath?: string                  // Currently selected path
}
```

**DocSearch**
```typescript
interface DocSearchProps {
  onSelectFile: (path: string) => void   // File selection callback
}
```

**DocsWelcome** (Settings Page)
```typescript
interface DocsWelcomeProps {
  onGetStarted: () => void   // Callback when user clicks "Get Started"
}
```

## API Routes

### Overview
The module provides RESTful API endpoints for file operations. All routes are dev-only and disabled in production.

### Endpoints

#### List All Files
```http
GET /api/docs
```

**Response:**
```json
{
  "data": [
    {
      "path": "/absolute/path/docs/example.md",
      "relativePath": "example.md",
      "name": "example.md",
      "size": 1234,
      "lastModified": "2024-12-01T10:00:00.000Z",
      "isDirectory": false
    }
  ],
  "meta": {
    "count": 1
  }
}
```

#### Search Documentation
```http
GET /api/docs?search=query
```

**Query Parameters:**
- `search` (string): Search term for fuzzy matching

**Response:**
```json
{
  "data": [
    {
      "file": {
        "path": "/absolute/path/docs/example.md",
        "relativePath": "example.md",
        "name": "example.md",
        "size": 1234,
        "lastModified": "2024-12-01T10:00:00.000Z",
        "isDirectory": false
      },
      "matches": [
        {
          "field": "content",
          "value": "...matching content snippet...",
          "indices": [[10, 25]]
        }
      ],
      "score": 0.3
    }
  ],
  "meta": {
    "count": 1,
    "query": "query"
  }
}
```

**Note:** The `score` is a number between 0 and 1, where lower values indicate better matches. The `matches` array contains structured information about where matches were found (filename, content, or metadata) with optional character position indices.

#### Get File Content
```http
GET /api/docs/[path]
```

**Example:** `GET /api/docs/guides/setup.md`

**Response:**
```json
{
  "content": "# Setup Guide\n\nContent here...",
  "metadata": {
    "title": "Setup Guide",
    "date": "2024-12-01"
  },
  "fileMetadata": {
    "path": "docs/guides/setup.md",
    "relativePath": "guides/setup.md",
    "name": "setup.md",
    "size": 1234,
    "lastModified": "2024-12-01T10:00:00.000Z"
  }
}
```

#### Update File
```http
PUT /api/docs/[path]
```

**Request Body:**
```json
{
  "content": "# Updated Content\n\nNew content...",
  "metadata": {
    "title": "Updated Title",
    "date": "2024-12-01"
  }
}
```

**Response:**
```json
{
  "success": true,
  "path": "docs/example.md"
}
```

#### Delete File
```http
DELETE /api/docs/[path]
```

**Response:** `204 No Content` (success) or error

#### Get Git History
```http
GET /api/docs/[path]/history
```

**Response:**
```json
{
  "data": [
    {
      "hash": "abc123def456",
      "message": "docs: update example.md",
      "author": "John Doe <john@example.com>",
      "date": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

### Error Responses

All endpoints return errors in this format:
```json
{
  "error": {
    "code": "DOCS_API_ERROR",
    "message": "Detailed error message"
  }
}
```

Common error codes:
- `404` - File not found
- `400` - Invalid file path or parameters
- `403` - Access denied (path traversal attempt)
- `500` - Internal server error

### Installation

Copy the API routes to your Next.js project:
```bash
cp -r modules/docs-interface/app/api/docs your-app/app/api/
```

## Configuration

### File Service

Configure the docs root directory:

```typescript
import { createFileService } from '@/lib/docs-interface'

const fileService = createFileService({
  docsRoot: '/custom/path/to/docs'
})
```

### Git Service

Configure git commit author:

```typescript
import { createGitService } from '@/lib/docs-interface'

const gitService = createGitService({
  repoRoot: process.cwd(),
  authorName: 'Your Name',
  authorEmail: 'your.email@example.com'
})
```

### Search Service

Configure search behavior (powered by Fuse.js):

```typescript
import { createSearchService } from '@/lib/docs-interface'

const searchService = createSearchService({
  fileService: fileService,     // Required: FileService instance
  threshold: 0.3,               // Fuzzy match threshold (0-1, lower = stricter)
  keys: ['name', 'content'],    // Fields to search
  distance: 100                 // Maximum distance for fuzzy matching
})
```

**Search Features:**
- **Fuzzy matching** - Tolerates typos and variations
- **Content search** - Searches both filenames and file content
- **Weighted scoring** - Ranks results by relevance
- **Fast indexing** - Efficient for large documentation sets

## Security

- **Dev-Only Access**: The interface is only available in development mode
- **Path Validation**: All file paths are validated to prevent directory traversal
- **File Type Restriction**: Only `.md` and `.markdown` files can be accessed
- **Sanitization**: Filenames are sanitized to prevent security issues

## Limitations

Understanding current limitations helps set appropriate expectations:

### Environment
- **Development Only** - Interface is disabled in production environments for security
- **Node.js Required** - Requires Node.js 18+ to run (your project can be any language)

### File Support
- **Markdown Only** - Only `.md` and `.markdown` files are supported
- **File Size** - Recommended maximum 5MB per file for optimal editor performance
- **Scale** - Tested with up to 1,000 documentation files

### Features
- **Single User** - No real-time collaborative editing
- **Git Required** - Version history requires git repository (gracefully degrades without it)
- **Local Only** - No cloud storage integration (uses local filesystem)

### Browser Support
- **Modern Browsers** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile** - Limited mobile support (optimized for desktop)

### Future Enhancements
See `CHANGELOG.md` and GitHub issues for planned features like:
- Image upload and management
- Custom markdown extensions
- Multi-user collaboration
- Cloud storage integration

## File Structure

The module expects documentation files in the `/docs` folder (or configured path):

```
/docs
├── README.md
├── getting-started.md
├── api/
│   └── reference.md
└── guides/
    └── tutorial.md
```

## Git Integration

The module automatically commits changes to git when:
- A file is created
- A file is updated
- A file is deleted

Commit messages follow the format:
- `docs: create [filename]`
- `docs: update [filename]`
- `docs: delete [filename]`

If the project is not a git repository, operations will continue but commits will be skipped.

## Markdown Features

The viewer supports:
- GitHub Flavored Markdown (GFM)
- Syntax highlighting for code blocks
- Tables, task lists, and more
- Frontmatter metadata (YAML)

## Error Handling

The module handles:
- File not found errors
- Permission errors
- Git errors (gracefully degrades if git is not available)
- Invalid file paths
- Network errors

## Development

### Running Tests

```bash
npm test
```

### Building

The module uses TypeScript and should be compiled with your Next.js project.

## Launch Scripts

### Unix/Mac/Linux (`launch-docs.sh`)

**Features:**
- Automatic Node.js/npm version checking
- Port availability checking with conflict resolution
- Automatic dependency installation
- Sample documentation creation
- Git repository detection
- Health checks before launch
- Background mode support
- Configurable port (default: 3000)

**Usage:**
```bash
./launch-docs.sh                    # Launch on default port (3000), prompts for background mode
./launch-docs.sh --background       # Launch in background (skip prompt)
PORT=8080 ./launch-docs.sh          # Launch on custom port, prompts for background mode
./launch-docs.sh --port 8080        # Launch on custom port (alternative)
```

**Auto-Browser Opening:**
The script automatically opens your default browser to the interface after the server starts (waits ~3 seconds for server to initialize).

**Background Mode Prompt:**
When you run the script, it will prompt:
```
Run server in background? (y/n) [n]:
```
- **y** - Server runs in background, you can close the terminal
- **n** - Server runs in foreground (default), logs visible in terminal

**Background mode commands:**
```bash
# View logs (if running in background)
tail -f /tmp/docs-interface.log

# Stop server (if running in background)
kill $(cat /tmp/docs-interface.pid)
```

### Windows (`launch-docs.bat`)

**Features:**
- Same as Unix script but for Windows
- Automatic port conflict detection and resolution
- Interactive prompts for port conflicts
- Auto-opens browser to the interface

**Usage:**
```cmd
launch-docs.bat
```

**Auto-Browser Opening:**
The script automatically opens your default browser to the interface after the server starts (waits ~3 seconds for server to initialize).

**Background Mode Prompt:**
When you run the script, it will prompt:
```
Run server in background? (y/n) [n]:
```
- **y** - Server runs in background, you can close the terminal
- **n** - Server runs in foreground (default), logs visible in terminal

## Reducing Dependencies

### Bundled Assets

To minimize external dependencies, we've bundled:

**✅ Standalone CSS** (`styles/docs-interface.css`):
- All Tailwind-compatible utility classes
- Component-specific styles
- Syntax highlighting theme (highlight.js GitHub)
- No need to install Tailwind or highlight.js separately

**Total Dependencies:** 6 small packages (excluding React/Next.js)
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown
- `rehype-highlight` - Syntax highlighting
- `simple-git` - Git operations
- `gray-matter` - Frontmatter parsing
- `fuse.js` - Full-text search

All are small, focused libraries providing essential functionality.

## Port and URL Configuration

The interface defaults to **port 3000** and **URL path `/docs`**, but both are configurable.

### Configuration Methods (Priority Order)

1. **Command-line arguments** (highest priority)
   ```bash
   ./launch-docs.sh --port 8080
   ```

2. **Environment variables**
   ```bash
   PORT=8080 ./launch-docs.sh
   ```

3. **package.json** (recommended for persistent config)
   ```json
   {
     "docsInterface": {
       "port": 8080,
       "urlPath": "/documentation"
     }
   }
   ```
   The launch scripts automatically read from the module's `package.json`.

4. **Defaults** (lowest priority)
   - Port: `3000`
   - Path: `/docs`

**Change URL Path:**
Move the route file to your desired path:
- `app/docs/page.tsx` → `http://localhost:3000/docs`
- `app/documentation/page.tsx` → `http://localhost:3000/documentation`

See `PORT_CONFIGURATION.md` for complete configuration guide.

## Changelog

### Version 1.0.0 (2025-12-01)

#### Added
- **Settings Page** - Renamed welcome page to Settings, accessible anytime via toolbar ⚙️ button
- **Auto-Browser Opening** - Launch scripts automatically open browser to interface after server starts
- **Background Mode Prompt** - Interactive prompt to choose foreground or background mode
- **package.json Configuration** - Port and URL path can be configured in the module's `package.json`
- **Launch Scripts** - Automated launch scripts for Unix/Mac/Linux (`launch-docs.sh`) and Windows (`launch-docs.bat`)
- **HTML Launcher** - Visual `LAUNCH.html` with platform detection and copy-paste commands
- **Standalone CSS Bundle** - Complete CSS bundle (`styles/docs-interface.css`) with no Tailwind dependency
- **Health Checks** - System status validation (Next.js, docs directory, git, API routes)
- **Welcome Page** - First-visit onboarding with setup guidance
- **Full CRUD Operations** - Create, read, update, delete documentation files
- **Git Integration** - Auto-commit on changes, version history viewing
- **Full-Text Search** - Search across all documentation files
- **Markdown Editor** - Split-pane editor with live preview
- **Syntax Highlighting** - Code block highlighting with GitHub theme

#### Changed
- Welcome page now serves dual purpose: first-visit onboarding and accessible settings page
- Launch scripts now read configuration from package.json with fallback to defaults
- Improved error handling and port conflict resolution

#### Technical Details
- **Dependencies:** 6 core packages (react-markdown, remark-gfm, rehype-highlight, simple-git, gray-matter, fuse.js)
- **Platform Support:** macOS, Linux, Windows
- **Browser Support:** Chrome, Firefox, Safari, Edge
- **Development Only:** Interface only works in `NODE_ENV=development`

## Troubleshooting

Quick solutions to common issues. See `SETUP.md` for comprehensive troubleshooting.

### Port Already in Use
```bash
# Find process using port
lsof -i :3000          # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Use different port
PORT=3001 npm run dev
# or
./launch-docs.sh --port 3001
```

### Git Not Configured
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Permission Denied on /docs Folder
```bash
# Mac/Linux
chmod -R 755 docs/

# Windows (run as Administrator)
icacls docs /grant Users:F /T
```

### Highlight.js Theme Not Loading
Ensure you've imported a syntax highlighting theme:
```tsx
// app/layout.tsx or app/docs/page.tsx
import 'highlight.js/styles/github.css'
```

Or use the bundled standalone CSS:
```tsx
import '@/lib/docs-interface/styles/docs-interface.css'
```

### API Routes Return 404
1. Verify API routes are copied:
```bash
ls app/api/docs/route.ts  # Should exist
```

2. Check Next.js app directory structure
3. Restart the dev server

### Module Import Errors
```bash
# Reinstall dependencies
npm install react-markdown remark-gfm rehype-highlight simple-git gray-matter fuse.js

# Clear Next.js cache
rm -rf .next
npm run dev
```

## Related Documentation

- `SETUP.md` - Complete setup guide with troubleshooting
- `PORT_CONFIGURATION.md` - Port and URL path configuration guide
- `standards/project-planning/documentation.md` - Documentation standards
- `standards/project-structure.md` - Project structure standards
- `standards/module-structure.md` - Module structure standards

## Possible Enhancements

### Short-term Improvements

- **Image Upload** - Upload and manage images in documentation
- **Table of Contents** - Auto-generate table of contents from headings
- **Link Validation** - Validate internal and external links
- **Document Templates** - Pre-built document templates
- **Export Options** - Export documentation as PDF, HTML, etc.
- **Keyboard Shortcuts** - More keyboard shortcuts for power users

### Medium-term Enhancements

- **Collaborative Editing** - Real-time collaborative editing (WebSocket)
- **Version Control UI** - Visual diff viewer for document changes
- **Document Comments** - Comment system for documentation review
- **Document Analytics** - Track document views and edits
- **Document Workflow** - Approval workflow for documentation changes
- **Document Search** - Enhanced search with filters and sorting
- **Document Tags** - Tag system for organizing documentation

### Long-term Enhancements

- **AI-Powered Writing** - AI assistance for writing documentation
- **Document Translation** - Multi-language documentation support
- **Document Publishing** - Publish documentation to external sites
- **Document API** - REST API for programmatic document management
- **Document Plugins** - Plugin system for extending functionality
- **Document Analytics Dashboard** - Advanced analytics and insights
- **Document Backup** - Automatic backup and restore functionality

## License

ISC

