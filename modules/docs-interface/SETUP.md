# Documentation Interface Setup Guide

Complete setup guide for the documentation interface module with minimal dependencies and easy launching.

## Quick Start (Easiest Method)

### Unix/Mac/Linux:
```bash
cd modules/docs-interface
./launch-docs.sh
```

### Windows:
```cmd
cd modules\docs-interface
launch-docs.bat
```

The script will:
1. Check Node.js and npm installation
2. Check port availability (default: 3000)
3. Install dependencies automatically
4. Create sample documentation if needed
5. Check git status
6. Launch the interface at `http://localhost:3000/docs`

---

## Manual Setup

If you prefer to set up manually or integrate into an existing project:

### 1. Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **Git** (optional, for version history features)

### 2. Installation

#### Option A: Using the Launch Scripts (Recommended)

The launch scripts handle everything automatically:

```bash
# Unix/Mac/Linux
chmod +x modules/docs-interface/launch-docs.sh
./modules/docs-interface/launch-docs.sh

# Windows
modules\docs-interface\launch-docs.bat
```

**Launch script features:**
- ✅ Automatic dependency installation
- ✅ Port conflict detection and resolution
- ✅ Sample documentation creation
- ✅ Git repository detection
- ✅ Health checks before launch
- ✅ Background mode support (Unix only): `./launch-docs.sh --background`

#### Option B: Manual Installation

```bash
# Navigate to module directory
cd modules/docs-interface

# Install dependencies
npm install

# Start the dev server
npm run dev

# Open browser to http://localhost:3000/docs
```

### 3. CSS Setup

The module **requires CSS for styling**. You have two options:

#### Option 1: Use Standalone CSS (No Tailwind Required)

Import the bundled CSS file that includes all styles and syntax highlighting:

```tsx
// app/layout.tsx or app/docs/page.tsx
import '@/lib/docs-interface/styles/docs-interface.css'
```

**What's included:**
- ✅ All component styles (Tailwind-compatible utilities)
- ✅ Syntax highlighting (highlight.js GitHub theme)
- ✅ Responsive design
- ✅ No external dependencies

#### Option 2: Use Tailwind CSS (If Already Using It)

If your project already uses Tailwind, configure it to scan the module:

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/docs-interface/src/**/*.{js,ts,jsx,tsx}',  // Add this line
  ],
  // ... rest of config
}
```

Then import a highlight.js theme:

```tsx
// app/layout.tsx or app/docs/page.tsx
import 'highlight.js/styles/github.css'
// or any other theme: atom-one-dark, monokai, etc.
```

### 4. Create Documentation Folder

Create a `/docs` folder in your project root:

```bash
mkdir docs
```

Add some markdown files:

```markdown
<!-- docs/README.md -->
---
title: Documentation Home
description: Welcome to the documentation
created: 2025-12-01
version: 1.0
---

# Documentation Home

Your documentation content here...
```

---

## Reducing External Dependencies

### Current Dependencies

**Required (Core functionality):**
- `react` / `react-dom` - React framework
- `next` - Next.js framework (peer dependency)

**Markdown Processing:**
- `react-markdown` - Render markdown
- `remark-gfm` - GitHub Flavored Markdown
- `rehype-highlight` - Syntax highlighting

**Utilities:**
- `simple-git` - Git operations
- `gray-matter` - Frontmatter parsing
- `fuse.js` - Full-text search

**Total:** 6 dependencies (excluding React/Next.js which you already have)

### Bundled Assets

To minimize external dependencies, we've bundled:

✅ **CSS Styles** - `styles/docs-interface.css` includes:
- All Tailwind-compatible utility classes
- Component-specific styles
- Syntax highlighting theme (highlight.js GitHub)
- No need to install Tailwind or highlight.js separately

### Alternative: Ultra-Minimal Setup

If you want to reduce dependencies further, you could:

1. **Remove Git Integration** (saves 1 dependency: `simple-git`)
   - Comment out git-related imports in components
   - Version history feature will be disabled

2. **Simplify Search** (saves 1 dependency: `fuse.js`)
   - Implement basic string search instead of fuzzy search

3. **Remove Frontmatter Support** (saves 1 dependency: `gray-matter`)
   - Parse frontmatter manually with regex

**However**, these dependencies are small and provide significant functionality. We recommend keeping them.

---

## Deployment Notes

### Development Only

This interface is **development-only** by design:

```tsx
if (process.env.NODE_ENV !== 'development') {
  return <div>Not available in production</div>
}
```

**Why?**
- File system access (cannot run in browser)
- Git operations (require shell access)
- Security (shouldn't expose file editing in production)

### Production Documentation

For production documentation, use:
- Static site generators (Docusaurus, VitePress, etc.)
- Deploy generated HTML to CDN
- This module is for **development/editing** only

---

## Troubleshooting

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Unix/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | find ":3000"
taskkill /F /PID <PID>

# Or use the launch script - it handles this automatically
./launch-docs.sh  # Unix/Mac
launch-docs.bat   # Windows
```

### Dependencies Not Installing

**Error:** `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lockfile
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### CSS Not Loading

**Problem:** Interface has no styling

**Solution:**
Make sure you imported the CSS:

```tsx
// app/layout.tsx or app/docs/page.tsx
import '@/lib/docs-interface/styles/docs-interface.css'
```

Or if using Tailwind, ensure module path is in `tailwind.config.js`:

```js
content: [
  './lib/docs-interface/src/**/*.{js,ts,jsx,tsx}',
]
```

### Git History Not Working

**Problem:** Version history shows "Not a git repository"

**Solution:**
```bash
# Initialize git in your project
git init
git add .
git commit -m "Initial commit"
```

Git is optional - the interface works without it, but history features are disabled.

### Module Not Found Errors

**Problem:** `Module not found: @/lib/docs-interface`

**Solution:**
Ensure the module path is correct:

```tsx
// If module is in /lib/docs-interface
import { DocsInterface } from '@/lib/docs-interface'

// If module is in /modules/docs-interface  
import { DocsInterface } from '@/modules/docs-interface'
```

Update your `tsconfig.json` if needed:

```json
{
  "compilerOptions": {
    "paths": {
      "@/lib/*": ["./lib/*"],
      "@/modules/*": ["./modules/*"]
    }
  }
}
```

---

## Launch Script Reference

### Unix/Mac (`launch-docs.sh`)

**Basic usage:**
```bash
./launch-docs.sh              # Launch in foreground
./launch-docs.sh --background # Launch in background
```

**Background mode:**
```bash
# Start in background
./launch-docs.sh --background

# View logs
tail -f /tmp/docs-interface.log

# Stop server
kill $(cat /tmp/docs-interface.pid)
```

### Windows (`launch-docs.bat`)

**Usage:**
```cmd
launch-docs.bat
```

**Features:**
- Automatic Node.js and npm detection
- Port conflict resolution (prompts to kill process)
- Dependency installation
- Sample docs creation
- Git detection

---

## Integration Checklist

Use this checklist when integrating the docs-interface module:

- [ ] **Copy module files** to `/lib/docs-interface` or `/modules/docs-interface`
- [ ] **Copy API routes** from `app/api/docs/` to your project's `app/api/`
- [ ] **Import CSS** in your layout or page component
- [ ] **Create /docs folder** in project root
- [ ] **Add markdown files** to `/docs`
- [ ] **Create page route** at `app/docs/page.tsx`
- [ ] **Test launch** using `./launch-docs.sh` or manually
- [ ] **Verify health checks** on welcome page
- [ ] **(Optional) Initialize git** for version history
- [ ] **Update .gitignore** if needed (don't ignore `/docs`)

---

## Summary

**Easiest setup:**
```bash
./launch-docs.sh
```

**Manual setup:**
1. Copy module to project
2. Copy API routes
3. Import `styles/docs-interface.css`
4. Create `/docs` folder
5. Run `npm run dev`
6. Navigate to `/docs`

**Dependencies:**
- 6 small npm packages
- Bundled CSS (no Tailwind required)
- Bundled syntax highlighting theme

**Platform support:**
- ✅ Unix/Mac/Linux (`.sh` script)
- ✅ Windows (`.bat` script)
- ✅ All browsers (Chrome, Firefox, Safari, Edge)

---

For more details, see:
- `README.md` - Module documentation
- `PORT_CONFIGURATION.md` - Port and URL configuration
- `SEARCH_GUIDE.md` - Search functionality guide

