# launch

## Metadata
- **Status:** Active
- **Created:** 12-02-2025 00:00:00 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 2.0.0
- **Description:** Launch the application (Dev or Prod) using start_app.sh script. Generates launch scripts if missing. Handles stack detection, dependency installation, environment validation, and port management automatically.
- **Type:** Executable Command
- **Audience:** AI agents launching applications
- **Applicability:** When starting the app, running the server, or launching development/production environments
- **How to Use:** Run this command to reliably start the application. Use `env=dev` or `env=prod`, `service` for monorepo services, `skip-tests` or `skip-install` to skip steps
- **Dependencies:** None
- **Related Cursor Commands:** [create-start-scripts.md](./create-start-scripts.md), [launch-debug-fix.md](./launch-debug-fix.md)
- **Related Cursor Rules:** [environment.mdc](../rules/environment.mdc), [auto-heal.mdc](../rules/auto-heal.mdc)
- **Related Standards:** [deployment/application-launch.md](../../standards/deployment/application-launch.md), [architecture/supabase-local-setup.md](../../standards/architecture/supabase-local-setup.md)

---

# Launch Application Command

Use this command to reliably start the application. It uses the `start_app.sh` script (or generates it if missing) to handle stack detection, dependency installation, environment validation, and port management automatically.

## Usage

@agent: When asked to "start the app", "run the server", or "launch", follow this procedure.

**Parameters:**
- `env`: `dev` (default) or `prod`
- `service`: (Optional) Sub-directory for monorepo services (e.g., `frontend`, `backend`)
- `skip-tests`: `true` or `false` (default: `false`)
- `skip-install`: `true` or `false` (default: `false`)

---

## Execution Steps

### 0. Check for Launch Scripts (CRITICAL FIRST STEP)
1. **Check if `start_app.sh` exists:**
   - Run: `test -f ./start_app.sh`
   - If **exists**: Proceed to Step 1 (Launch using script)
   - If **missing**: Run `create-start-scripts` command (`.cursor/commands/create-start-scripts.md`) first
     - This will generate `start_app.sh` and `scripts/start_dev.sh`, `scripts/start_prod.sh`
     - After generation, proceed to Step 1

### 1. Launch Using start_app.sh
1. **Determine mode:**
   - Use `env` parameter: `dev` (default) or `prod`
   - If `env` not provided, default to `dev`
2. **Execute launch script:**
   - For dev: `./start_app.sh dev [SERVICE]`
   - For prod: `./start_app.sh prod [SERVICE]`
   - If `service` parameter provided, pass it as second argument
3. **Verify execution:**
   - Check that script runs successfully
   - Monitor output for any errors
   - Script handles all stack detection, dependencies, and port management internally

### 2. Fallback: Manual Launch (if start_app.sh fails)
*Only use if start_app.sh fails and cannot be fixed*

1.  **Service Selection:**
    - If `service` argument is provided, `cd` into that directory.
    - Else, detect if root is the app or a monorepo.
2.  **Stack Identification:**
    - **Node.js:** Look for `package.json`.
    - **Python:** Look for `requirements.txt`, `pyproject.toml`, or `Pipfile`.
    - **Docker:** Look for `docker-compose.yml`.

### 3. Configuration Resolution (Fallback Only)
*Only used if start_app.sh fails*

1.  **Environment File:**
    - Ensure `.env` (or `.env.local` for Next.js) exists.
    - If missing, copy from `.env.example` (if available) and notify the user to fill secrets.
2.  **Supabase Setup Check:**
    - If project uses Supabase, check if `supabase/` directory exists.
    - If missing, notify user that Supabase must be initialized first (see `standards/architecture/supabase-local-setup.md`).
    - Verify `.env.local` contains Supabase credentials (run `supabase status` if needed).
3.  **Port & URL:**
    - Read `PORT` and `PROJECT_ROOT_URL` from config.
    - Default `PORT`: 3000 (Node), 8000 (Python/Django), 54321 (Supabase API).
    - Default `PROJECT_ROOT_URL`: `http://localhost:<PORT>`.

### 4. Dependency Validation (Fallback Only)
*Only used if start_app.sh fails. Unless `skip-install=true`*

1.  **Node:** Check `node_modules`. If missing/stale, run `npm install` (or `yarn`/`pnpm`).
2.  **Python:** Check `.venv`. If missing, create it and run `pip install -r requirements.txt`.

### 5. Pre-Flight Checks (Fallback Only)
*Only used if start_app.sh fails. Unless `skip-tests=true`*

1.  Run fast checks: `npm run lint` or `npm test` (unit only).
2.  If checks fail, **ABORT** and report errors.

### 6. Manual Launch Sequence (Fallback Only)
*Only use if start_app.sh fails and cannot be fixed*

#### A. Development (`env=dev`)

1.  **Supabase Startup (if applicable):**
    - If `supabase/` directory exists, check if Supabase is running: `supabase status`
    - If not running, start with: `supabase start`
    - **CRITICAL:** Only use `supabase start/stop` commands. Never use `docker stop $(docker ps -q)` as this affects all projects.
    - Wait for Supabase services to be ready before starting the application.
2.  **Check Port:**
    - If `PORT` is in use, use `self_healing` rule to identify and handle the conflict.
    - **For Supabase ports (54321, 54322, etc.):** Verify it's the current project's container using `supabase status` before stopping.
3.  **Start Server:**
    - **Node:** `npm run dev`
    - **Python:** `python manage.py runserver` or `uvicorn main:app --reload`
4.  **Verification:**
    - Monitor logs for "Server running" message.
    - If Supabase is used, verify connection by checking for successful database/auth initialization.
    - Output: "🚀 Application running at `PROJECT_ROOT_URL`"

#### B. Production (`env=prod`)

1.  **Build:** `npm run build` (Node) or compile steps.
2.  **Start:** `npm start` or production runner (e.g., `gunicorn`).
3.  **Note:** Ensure production env vars are loaded.

---

## Error Handling

### Primary (start_app.sh)
- **Script Missing:** Automatically run `create-start-scripts` command to generate launch scripts
- **Script Execution Failure:** Check script permissions (`chmod +x start_app.sh`), verify script syntax, check error output
- **Port Conflicts:** Handled by start_app.sh scripts (auto-fix via self-healing)
- **Missing Dependencies:** Handled by start_app.sh scripts (auto-install)

### Fallback (Manual Launch)
- **Port Conflicts:** "Port X is busy. Killing PID Y..." (Auto-fix)
  - **For Supabase ports:** Verify container ownership with `supabase status` before stopping. Only stop containers belonging to the current project.
- **Missing Dependencies:** "node_modules missing. Installing..." (Auto-fix)
- **Build Failures:** Stop and display log output.
- **Supabase Connection Errors:**
  - Verify Supabase is running: `supabase status`
  - Check `.env.local` has correct credentials from `supabase status`
  - Ensure Docker is running if using local Supabase
  - See `standards/architecture/supabase-local-setup.md` for troubleshooting

## Container Isolation Rules (CRITICAL)

When working with Supabase or Docker:

1. **Always use project-specific commands:**
   - ✅ `supabase start` - Starts only current project's containers
   - ✅ `supabase stop` - Stops only current project's containers
   - ✅ `supabase status` - Shows only current project's status

2. **Never use broad Docker commands:**
   - ❌ `docker stop $(docker ps -q)` - Affects ALL containers
   - ❌ `docker-compose down` (if used globally) - Affects all projects

3. **If you must use Docker directly:**
   - Filter by project reference: `docker ps --filter "name=supabase_<project-ref>"`
   - Verify container ownership with `supabase status` first

4. **Port conflict resolution:**
   - Identify which project owns the conflicting container
   - Only stop containers belonging to the current project
   - If unsure, ask the user which project should use the port

See `standards/architecture/supabase-local-setup.md` Section 10 for detailed container management guidelines.
