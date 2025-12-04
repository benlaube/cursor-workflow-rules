# Port and URL Configuration

## Default Configuration

**Default Port:** `3000`  
**Default URL:** `http://localhost:3000/docs`

The documentation interface uses port 3000 by default, but this is **fully configurable**.

### Configuration Priority

The launch scripts read configuration in this order (highest priority first):

1. **Command-line arguments** (`--port 8080`)
2. **Environment variables** (`PORT=8080`)
3. **package.json** (`docsInterface.port` in the module's `package.json`)
4. **Defaults** (port: 3000, path: /docs)

### Configuring in package.json

Add a `docsInterface` section to the module's `package.json`:

```json
{
  "docsInterface": {
    "port": 8080,
    "urlPath": "/documentation"
  }
}
```

The launch scripts will automatically read these values if present.

---

## Changing the Port

### Option 1: Environment Variable (Recommended)

**Unix/Mac/Linux:**

```bash
PORT=8080 ./launch-docs.sh
```

**Windows:**

```cmd
set PORT=8080
launch-docs.bat
```

**PowerShell:**

```powershell
$env:PORT=8080
.\launch-docs.bat
```

### Option 2: Command Line Argument (Unix/Mac/Linux only)

```bash
./launch-docs.sh --port 8080
```

### Option 3: Manual Next.js Command

If you're running manually (not using the launch script):

```bash
cd modules/docs-interface
PORT=8080 npm run dev
```

Or with Next.js directly:

```bash
cd modules/docs-interface
npx next dev -p 8080
```

---

## Changing the URL Path

The URL path (`/docs`) is determined by where you create the Next.js route.

### Current Setup

The route is at: `modules/docs-interface/app/docs/page.tsx`

So the URL is: `http://localhost:3000/docs`

### Custom Path Examples

**To use `/documentation` instead:**

1. Create: `app/documentation/page.tsx`
2. Access at: `http://localhost:3000/documentation`

**To use root path `/`:**

1. Create: `app/page.tsx` (or modify existing)
2. Access at: `http://localhost:3000`

**To use `/admin/docs`:**

1. Create: `app/admin/docs/page.tsx`
2. Access at: `http://localhost:3000/admin/docs`

### Example Route File

```tsx
// app/custom-path/page.tsx
import { DocsInterface } from '@/lib/docs-interface';

export default function CustomDocsPage() {
  if (process.env.NODE_ENV !== 'development') {
    return <div>Not available in production</div>;
  }

  return <DocsInterface />;
}
```

---

## Port Configuration in Launch Scripts

### Unix/Mac/Linux (`launch-docs.sh`)

The script checks for:

1. `PORT` environment variable
2. `--port` command line argument
3. Defaults to `3000` if neither is set

**Examples:**

```bash
# Default port (3000)
./launch-docs.sh

# Custom port via environment variable
PORT=8080 ./launch-docs.sh

# Custom port via argument
./launch-docs.sh --port 8080

# Custom port + background mode
PORT=8080 ./launch-docs.sh --background
```

### Windows (`launch-docs.bat`)

The script checks for:

1. `PORT` environment variable
2. Defaults to `3000` if not set

**Examples:**

```cmd
REM Default port (3000)
launch-docs.bat

REM Custom port
set PORT=8080
launch-docs.bat
```

---

## Port Conflict Resolution

If port 3000 (or your chosen port) is already in use:

### Automatic (Launch Scripts)

The launch scripts automatically detect port conflicts and offer to:

- Kill the process using the port
- Or exit with an error message

### Manual Resolution

**Unix/Mac/Linux:**

```bash
# Find process using port
lsof -i :3000

# Kill process
lsof -ti:3000 | xargs kill -9
```

**Windows:**

```cmd
REM Find process using port
netstat -ano | find ":3000"

REM Kill process (replace <PID> with actual process ID)
taskkill /F /PID <PID>
```

**Or simply use a different port:**

```bash
PORT=8080 ./launch-docs.sh
```

---

## Environment Variables

Next.js respects the `PORT` environment variable. You can set it:

### In Shell Session

```bash
export PORT=8080
./launch-docs.sh
```

### In `.env.local` (Next.js)

```bash
# modules/docs-interface/.env.local
PORT=8080
```

### In System Environment

```bash
# Unix/Mac - Add to ~/.bashrc or ~/.zshrc
export PORT=8080

# Windows - System Properties > Environment Variables
```

---

## Summary

| Configuration | Method               | Priority    | Example                                   |
| ------------- | -------------------- | ----------- | ----------------------------------------- |
| **Port**      | Command argument     | 1 (highest) | `./launch-docs.sh --port 8080`            |
| **Port**      | Environment variable | 2           | `PORT=8080 ./launch-docs.sh`              |
| **Port**      | package.json         | 3           | `"docsInterface": { "port": 8080 }`       |
| **Port**      | Default              | 4 (lowest)  | `3000`                                    |
| **URL Path**  | package.json         | 1 (highest) | `"docsInterface": { "urlPath": "/docs" }` |
| **URL Path**  | Route location       | 2           | `app/docs/page.tsx` → `/docs`             |
| **URL Path**  | Default              | 3 (lowest)  | `/docs`                                   |

---

## Quick Reference

**Default:**

- Port: `3000`
- URL: `http://localhost:3000/docs`

**Custom Port:**

```bash
PORT=8080 ./launch-docs.sh
# Access at: http://localhost:8080/docs
```

**Custom Path:**

- Move route file to desired path
- URL updates automatically

**Both Custom:**

```bash
PORT=8080 ./launch-docs.sh
# Then create route at: app/my-docs/page.tsx
# Access at: http://localhost:8080/my-docs
```
