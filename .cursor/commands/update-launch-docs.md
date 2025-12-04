# update-launch-docs

# Command: app:update-launch-docs
# Version: 1.0.0
# Purpose: Synchronize documentation (README, changelog, audit) with the current launch scripts and environment expectations.

You are a documentation-focused assistant working INSIDE a single project.

After launch logic or configuration has changed (start_app.sh, scripts/start_dev.sh, scripts/start_prod.sh, Supabase mode/ports), you must:

A. Inspect launch scripts and env expectations
1. Read:
   a. ./start_app.sh
   b. ./scripts/start_dev.sh (if exists)
   c. ./scripts/start_prod.sh (if exists)
   d. Any service-specific scripts: ./scripts/start_*_dev.sh, ./scripts/start_*_prod.sh
2. Extract:
   a. Supported modes (dev, prod, etc.).
   b. Supported services (frontend, backend, all, etc.).
   c. How env files are loaded for dev and prod.
   d. Key required env vars (names only), especially:
      - PORT or APP_PORT equivalents
      - SUPABASE_MODE, SUPABASE_URL, SUPABASE_LOCAL_URL if present
   e. Any default ports or URLs printed by the scripts.

B. Update README.md (or create a small section if it exists)
1. If README.md exists:
   a. Ensure there is a clear "Running the app" or "Launch" section that includes:
      - Usage:
        - ./start_app.sh
        - ./start_app.sh dev
        - ./start_app.sh prod
      - Explanation of MODE and SERVICE:
        - What values are allowed, and what they do.
      - Which env files are used in dev vs prod.
   b. Remove or update any outdated references to old .cursor/commands launch files.
   c. If necessary, add a short note:
      - "Legacy Cursor launch commands under .cursor/commands have been deprecated; use start_app.sh instead."
2. If README.md does not exist:
   a. Do NOT create a huge README, but you may optionally create a minimal README.md that contains:
      - Project name (if known).
      - A small "How to run" section describing start_app.sh usage.
   b. Keep it concise to avoid inventing large amounts of fictitious documentation.

C. Update CHANGELOG.md (if present)
1. If CHANGELOG.md exists:
   a. Add an entry under the most recent version or create an "Unreleased" section noting:
      - That launch scripts were created or updated.
      - That old .cursor launch commands were deprecated.
   b. Keep the entry brief and factual.

D. Update PROJECT_AUDIT.md or LAUNCHING.md (if present)
1. If PROJECT_AUDIT.md exists (from app:audit-and-sync-project):
   a. Add or update a section summarizing:
      - start_app.sh modes and services.
      - Where env variables and ports are read from.
   b. Note any default dev ports if relevant.
2. If a dedicated LAUNCHING.md or similar file exists:
   a. Align its content with the new scripts.
   b. Remove outdated instructions pointing to deprecated mechanisms.

E. General constraints
1. Do NOT include secret values from env files; only document variable names and their purposes.
2. Keep doc changes tight and accurate; avoid rewriting the entire README unless necessary.

F. Final response
1. In your chat response, summarize:
   a. Which docs were touched (README.md, CHANGELOG.md, PROJECT_AUDIT.md, etc.).
   b. Any key change notes (e.g., "Launch docs now reference start_app.sh instead of .cursor commands").