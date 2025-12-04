# create-start-scripts

## Metadata
- **Status:** Active
- **Created:** 12-02-2025 00:00:00 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 2.0.0
- **Description:** Generate or update launch shell scripts (start_app.sh + scripts/*.sh) and deprecate old .cursor launch commands. Detects stack and services, creates launch scripts, and handles port management.
- **Type:** Executable Command
- **Audience:** AI agents setting up development environments
- **Applicability:** When launch scripts are missing, when setting up a new project, or when updating launch configuration
- **How to Use:** Run this command to generate or update launch shell scripts. The command will detect stack, create start_app.sh and scripts/*.sh files, and migrate logic from old launch commands
- **Dependencies:** None
- **Related Cursor Commands:** [launch.md](./launch.md), [launch-debug-fix.md](./launch-debug-fix.md)
- **Related Cursor Rules:** [environment.mdc](../rules/environment.mdc), [auto-heal.mdc](../rules/auto-heal.mdc)
- **Related Standards:** [deployment/application-launch.md](../../standards/deployment/application-launch.md)

---

# Command: create-start-scripts

You are a repository-aware DevOps assistant working INSIDE a single project.
Assume the current working directory is the project root.

Your tasks:
- Detect the stack and services for THIS project.
- Create or update:
  - ./start_app.sh (orchestrator)
  - ./scripts/start_dev.sh
  - ./scripts/start_prod.sh
  - Optional service-specific scripts (e.g., ./scripts/start_frontend_dev.sh)
- Migrate any relevant logic from old .cursor/commands launch files, then mark them deprecated or remove them.
- Update or create basic docs describing how to use the new scripts.

Follow these steps carefully:

A. Discover project structure and existing launch plumbing
1. Detect stack and services:
   a. Determine if the project is:
      - Node/JS (package.json, Next.js, Vite, etc.)
      - Python (pyproject.toml, requirements.txt, FastAPI/Django/Flask)
      - Mixed (frontend + backend folders with their own configs)
   b. Identify obvious services:
      - Example: "frontend", "backend", "worker" directories containing their own package.json or main modules.
2. Locate old launch commands in .cursor:
   a. Look for files under ".cursor/commands/" with names like:
      - launch_application_dev*
      - launch_application_prod*
      - launch-application-dev*
      - launch-application-prod*
   b. Parse those files and extract:
      - The core shell command sequences (cd, install, build, test, run).
   c. Keep those sequences in memory to reuse in the new shell scripts.

B. Plan the new script layout
1. Always plan to create/maintain:
   a. ./start_app.sh  (orchestrator)
   b. ./scripts/start_dev.sh
   c. ./scripts/start_prod.sh
2. Multi-service handling:
   a. If multiple services are clearly present:
      - Plan additional scripts:
        - ./scripts/start_<service>_dev.sh
        - ./scripts/start_<service>_prod.sh
      - start_dev.sh and start_prod.sh may call these per-service scripts based on a SERVICE parameter.
3. Add a version header comment at the top of each script, e.g.:
   - "# start_app.sh v1.0.0 (managed by app:create-start-scripts)"
   - "# scripts/start_dev.sh v1.0.0"
   - and update the version if you significantly change behavior.

C. Generate or update start_app.sh (orchestrator)
1. Ensure the file ./start_app.sh exists with:
   a. Shebang:
      #!/usr/bin/env bash
   b. Basic usage/help at the top:
      - Explain: ./start_app.sh [MODE] [SERVICE]
      - MODE = dev | prod (default dev if omitted)
      - SERVICE = optional (e.g., frontend, backend, all)
2. MODE and SERVICE parsing:
   a. Read MODE from command, default to "dev" if empty.
   b. Read SERVICE from args, default to "default" or "all" depending on structure.
3. Interactive prompt when MODE is omitted:
   a. If no first argument:
      - Prompt: "Select mode [dev/prod]: "
      - Read input and set MODE accordingly (dev as fallback).
4. Delegate to scripts:
   a. For single-service projects:
      - If MODE=dev → call: ./scripts/start_dev.sh
      - If MODE=prod → call: ./scripts/start_prod.sh
   b. For multi-service projects:
      - If MODE=dev:
        - If SERVICE is provided and matches a known service → call ./scripts/start_<service>_dev.sh
        - If SERVICE is "all" or omitted → call ./scripts/start_dev.sh, which orchestrates multiple services.
      - Same pattern for MODE=prod.
5. Error handling:
   a. If MODE is unsupported, print usage and exit 1.
   b. If SERVICE is unsupported, list valid services and exit 1.
6. At the end of your edits, do NOT add secrets or hard-coded absolute paths; use relative paths and environment variables.

D. Generate or update scripts/start_dev.sh
1. Create ./scripts directory if it does not exist.
2. In ./scripts/start_dev.sh:
   a. Shebang: #!/usr/bin/env bash
   b. Set MODE="dev".
   c. Load env:
      - Source .env.local if it exists.
      - Else source .env if it exists.
      - Guard with "if [ -f ... ]" checks.
   d. Set dev-friendly flags:
      - For Node: export NODE_ENV=development
      - For Python: optionally export APP_ENV=development
   e. Determine dev port:
      - Prefer PORT from env if set.
      - Else infer a sensible default from stack (e.g., 3000 for Next.js, 5173 for Vite, 8000 for FastAPI).
      - Do NOT overwrite Supabase ports; this is the app/service port.
   f. Dependency check (non-destructive):
      - If package.json exists and node_modules is missing:
        - Print a message suggesting "npm install", "pnpm install", or "yarn install" based on lockfile, OR run the install if you decide that is standard for this repo.
      - If Python deps exist and .venv is missing:
        - Print a recommendation on how to create/activate venv and install deps; do not create venv automatically without clarity.
   g. Testing and lint:
      - Unless SKIP_TESTS=true, run stack-appropriate tests and/or lint before launching:
        - For Node: npm run lint (if exists), npm test (if exists).
        - For Python: pytest, or framework-specific test commands if clearly defined.
      - If tests fail, exit with non-zero code and print a concise message.
   h. Start dev server:
      - For Node: npm run dev / pnpm dev / yarn dev with PORT in env if needed.
      - For Python: uvicorn/Flask/Django dev commands using $PORT.
   i. Print the URL at the end, e.g.:
      - "Dev server running at http://localhost:${PORT:-3000}"

E. Generate or update scripts/start_prod.sh
1. In ./scripts/start_prod.sh:
   a. Shebang: #!/usr/bin/env bash
   b. Set MODE="prod".
   c. Load env:
      - Prefer .env.production if it exists.
      - Else fallback to .env.
   d. Require PORT:
      - If PORT is not set, print "PORT must be set in the environment or .env.production for prod" and exit 1.
   e. Optional preflight:
      - Optionally run a quick health check command (like npm run lint) if that is standard, but do NOT run long test suites by default.
   f. Start production server:
      - For Node: npm run start (or equivalent).
      - For Python: gunicorn or framework-specific start, if clearly defined; otherwise note that production may be handled by containers or hosting platform.
   g. Print a short message:
      - "Production server starting on port ${PORT}"

F. Optional per-service scripts (only when clearly needed)
1. If multiple services exist (frontend, backend, worker):
   a. Generate ./scripts/start_<service>_dev.sh and ./scripts/start_<service>_prod.sh with similar patterns to start_dev.sh and start_prod.sh but operating in the appropriate subdirectory (cd into that folder first).
   b. Have start_dev.sh and start_prod.sh call these scripts for "all" or default flows.

G. Migration from old .cursor launch commands
1. After generating scripts, process old .cursor launch files:
   a. For each launch-related file in ".cursor/commands/" (e.g., launch_application_dev.md, launch-application-prod.md):
      - Extract any additional notes or important caveats and migrate them into:
        - Comments in start_app.sh or scripts/*.sh, and/or
        - A LAUNCHING.md or section in README.md.
   b. Once information is migrated:
      - Either delete those old launch command files, OR
      - Replace their contents with a short note:
        - "Deprecated: launch moved to start_app.sh + scripts/. Refer to start_app.sh for current instructions."
2. In your final chat summary, explicitly mention:
   - Which .cursor launch files were deprecated or removed.
   - That the new standard is to use the shell scripts instead.

H. Documentation updates (high-level; detailed docs handled by a separate command)
1. If README.md exists:
   a. Add or update a short "How to run" section that documents:
      - "./start_app.sh" usage,
      - MODE and SERVICE options,
      - Where to set env variables.
2. If README.md does not exist, do NOT create a huge one here; instead, just note in your final summary that a README should be updated manually or via a dedicated docs command.

I. CHANGELOG update
1. Look for CHANGELOG.md.
2. If it exists:
   - Add an entry under the latest version or under an ## Unreleased section, like:
   - "- Updated launch scripts (start_app.sh, scripts/start_dev.sh, scripts/start_prod.sh) to reflect new env/port behavior."
3. If it doesn't exist:
   - Optionally create a minimal CHANGELOG.md with:
     # Changelog

     ## Unreleased
     - Initial launch scripts (start_app.sh, scripts/start_dev.sh, scripts/start_prod.sh) created.

Once scripts are updated, perform the same documentation tasks described in the app:update-launch-docs command: update README.md, CHANGELOG.md, and PROJECT_AUDIT.md as needed

J. Final response
1. In your chat response to the user, summarize:
   a. Whether start_app.sh and scripts/start_dev.sh, scripts/start_prod.sh were created or updated.
   b. Any per-service scripts that were added.
   c. Which old .cursor/commands launch files were deprecated or cleaned up.
   d. Remind the user to run:
      - chmod +x start_app.sh
      - chmod +x scripts/*.sh
   e. Point out that further documentation refinement can be handled by the docs-update command (see app:update-launch-docs).

