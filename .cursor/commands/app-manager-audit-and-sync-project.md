# app-manager-audit-and-sync-project

# Command: app:audit-and-sync-project
# Version: 1.0.0
# Purpose: Audit and normalize this project's local paths, Supabase config, env vars, and dev ports.
# Scope: ONLY operate inside the current project folder.

You are a codebase maintenance assistant working inside a single application.
Assume the current working directory is the ROOT of THIS project.

Your job is to AUDIT and, where safe and clear, UPDATE:

- Supabase ports and config
- Env vars for Supabase
- Old absolute paths (/benlaube/... -> /benlaube/apps/...)
- Basic dependency wiring indicators (Python venv + Node deps)
- And produce a concise PROJECT_AUDIT.md summary

Follow these steps VERY carefully and in order:

A. Discover project metadata
1. Detect the project root name (folder name).
2. Locate these files if they exist:
   a. "dev_ports.json"
   b. "supabase/config.toml"
   c. ".env"
   d. ".env.local"
   e. Any "docker-compose.yml" or "docker-compose.*.yml"
   f. "requirements.txt" and/or "pyproject.toml"
   g. "package.json"
   h. Any README file in the root (README.md, Readme.md, etc.)

B. Supabase ports and dev_ports.json
1. If "dev_ports.json" exists:
   a. Parse it as JSON.
   b. Read "supabase.rest_port", "supabase.db_port", "supabase.studio_port", and "supabase.image_proxy_port" if present.
   c. Treat these values as the AUTHORITATIVE ports for THIS project.
2. If "dev_ports.json" does NOT exist:
   a. Create a new "dev_ports.json" in the project root with the following structure:
      {
        "version": "1.0.0",
        "supabase": {
          "rest_port": 54321,
          "db_port": 54322,
          "studio_port": 54323,
          "image_proxy_port": 54324
        }
      }
   b. Choose reasonable defaults (54321+), and DO NOT try to detect or modify other apps. You only touch this project.
3. Note the final port values in your internal notes for later sections.

C. Sync Supabase config (supabase/config.toml)
1. If "supabase/config.toml" exists:
   a. Open the file and ensure there is a comment at the top:
      # Ports managed by app:audit-and-sync-project. Do not edit ports here manually.
   b. In the [api] section, set "port" = rest_port from dev_ports.json.
   c. In the [db] section, set "port" = db_port.
   d. In the [studio] section, if present, set "port" = studio_port.
   e. In [imgproxy] or equivalent image section, if present AND image_proxy_port exists, set "port" = image_proxy_port.
2. Do NOT change any other Supabase settings. Preserve other comments and formatting as much as possible.
3. If "supabase/config.toml" does not exist, note this in the final audit summary; do NOT create one unless there is already a supabase/ directory with clear structure.

D. Sync env vars for Supabase URLs and ports
1. For each env file found (.env, .env.local):
   a. If any SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL exists, update its value to:
      http://localhost:{rest_port}
   b. If variables like SUPABASE_REST_PORT, SUPABASE_DB_PORT, SUPABASE_STUDIO_PORT exist, set them from dev_ports.json.
   c. If SUPABASE_URL does NOT exist, ADD:
      SUPABASE_URL=http://localhost:{rest_port}
   d. If this appears to be a frontend project (e.g., package.json with Next.js, Vite, React, etc.) and NEXT_PUBLIC_SUPABASE_URL does NOT exist, ADD:
      NEXT_PUBLIC_SUPABASE_URL=http://localhost:{rest_port}
2. ONLY touch lines that clearly correspond to Supabase settings. Do NOT modify unrelated env vars.

E. Fix old absolute paths (/benlaube -> /benlaube/apps)
1. Determine the OLD and NEW paths specific to THIS project:
   a. OLD pattern: "/benlaube/<project-folder-name>"
   b. NEW pattern: "/benlaube/apps/<project-folder-name>"
2. Search the project for occurrences of the OLD pattern.
3. For each file where the OLD pattern appears:
   a. If the usage clearly represents a path to THIS project, replace:
      "/benlaube/<project-folder-name>"
      with
      "/benlaube/apps/<project-folder-name>"
   b. Do NOT modify other "/benlaube/..." paths that do not clearly refer to this project.
4. Record which files you changed, with a short note per file.

F. Dependency & venv status check (non-destructive)
1. If "requirements.txt" or "pyproject.toml" exists:
   a. Note in the audit that this appears to be a Python project.
   b. Check whether a ".venv" or "venv" directory exists.
   c. Do NOT delete or create venvs, but in the audit summary:
      - Recommend recreating the venv if the project path has recently moved.
      - Suggest commands such as:
        python -m venv .venv
        source .venv/bin/activate
        pip install -r requirements.txt
2. If "package.json" exists:
   a. Note in the audit that this appears to be a Node/JS project.
   b. Check for "node_modules" directory.
   c. Do NOT delete node_modules, but in the audit summary:
      - Suggest running "npm install" or "pnpm install" if dependencies appear missing or if the user reports issues.

G. Create or update PROJECT_AUDIT.md
1. Create or update a file named "PROJECT_AUDIT.md" in the project root.
2. In that file, write a concise Markdown summary including:
   a. Project name (folder name).
   b. Supabase ports:
      - REST: <rest_port>
      - DB: <db_port>
      - Studio: <studio_port> (if any)
      - Image Proxy: <image_proxy_port> (if any)
   c. Supabase config status:
      - Whether supabase/config.toml was found and synced.
   d. Env file status:
      - Which env files were updated and which Supabase vars they now contain.
   e. Path fixes:
      - List of files where OLD -> NEW /benlaube paths were updated (if any).
   f. Dependency notes:
      - Python: which files detected, venv directory present or not, suggested venv recreation commands.
      - Node: presence of package.json, and suggestion to run install commands if needed.
   g. A small "Next Steps" section with bullets like:
      - Run `supabase start` from this project root to validate ports.
      - Optionally recreate the Python venv.
      - Run "npm run dev" or equivalent to verify the dev server.

H. Final response to the user (in chat)
1. After making file edits, output a brief summary:
   a. Confirm that the audit completed.
   b. List:
      - Ports configured (REST, DB, Studio, Image proxy).
      - Count of files updated for Supabase config, env vars, and paths.
      - The existence and location of PROJECT_AUDIT.md.
   c. Mention any potential manual steps the user should take (e.g., recreate venv, run Supabase, etc.).
2. Keep the chat summary short and pragmatic; the detailed info should live in PROJECT_AUDIT.md.