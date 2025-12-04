# launch-debug-fix

# Command: launch-debug-fix
# Version: 1.0.0
# Purpose: Launch the app via start_app.sh, open it in the browser, and iteratively debug / auto-heal errors reported in the terminal or browser until the dev environment is healthy or no further safe fixes are obvious.

You are working in the ROOT of a single project (e.g., /benlaube/apps/<project>).

Your job is to:
- Run the dev environment using ./start_app.sh.
- Observe terminal output and browser errors.
- Diagnose and fix issues in code/config where it is safe and unambiguous.
- Re-run until the app is up and serving without obvious errors, or you reach a reasonable limit.

Follow these steps carefully.

A. Preconditions & discovery
1. Confirm you are in the project root.
2. Verify that a launch script exists:
   - Prefer `./start_app.sh`.
   - If not executable, plan to run `bash start_app.sh dev` or `sh start_app.sh dev`.
3. If start_app.sh does not exist:
   - STOP and report that this command requires start_app.sh.
   - Recommend running the `app:create-start-scripts` command first (if available).

B. Determine mode and URL
1. Default MODE for this command:
   - MODE = `dev`. You are always launching a development environment.
2. Determine the expected URL:
   - Check env files (.env.local, .env) for `PROJECT_ROOT_URL` or `PORT`.
   - If `PROJECT_ROOT_URL` is set, use that as the main URL.
   - If not, infer a dev URL from PORT, e.g.:
     - `http://localhost:${PORT}` (fallback to 3000/5173/8000 based on stack if needed).
3. Note the chosen URL in your internal reasoning; you will open it in the browser once the server starts.

C. Launch the dev environment in the terminal
1. In the project’s terminal, run:
   - `./start_app.sh dev`
   - Or `bash start_app.sh dev` if not executable.
2. Observe the terminal output:
   - Watch for:
     - Immediate non-zero exit.
     - Stack traces, “Error:”, “Exception”, “Traceback”, “Unhandled rejection”.
     - Common issues: missing modules, TypeScript/ESLint errors, migration failures, port in use, env var missing, etc.

D. Debug loop – server-side
You are now in a debug / auto-heal loop. For each failure:

1. If the command fails or logs clear error messages:
   - Parse the error and identify:
     - File path(s).
     - Line numbers and functions mentioned.
     - Error type (e.g., `ModuleNotFoundError`, `TypeError`, `ENOSPC`, `EADDRINUSE`, etc.).
2. Propose and apply minimal, safe fixes:
   - For missing imports or modules:
     - Add or correct import statements.
     - If a dependency is truly missing, suggest or perform the appropriate install (e.g., add to package.json + npm install) if this is consistent with repo standards.
   - For TypeScript / ESLint / lint errors:
     - Fix the offending code according to project standards.
   - For env var issues:
     - Do NOT invent secrets.
     - If an env var is referenced but obviously unset:
       - Add a placeholder key (e.g., in .env.example) and add a TODO comment.
       - Do not hard-code secret values.
   - For migrations / DB errors:
     - Identify the failing migration or query.
     - Fix obvious issues if the intent is clear; otherwise, stop and report.
   - For port-in-use errors:
     - Suggest changing PORT in env or stopping the other process, following project conventions.
3. After applying a fix:
   - Re-run `./start_app.sh dev` in the terminal.
   - Observe whether the previous error is resolved or still present.
4. Limit the loop:
   - Do not enter an infinite loop.
   - After ~3–5 cycles of “fix + re-run” without meaningful progress, stop and summarize outstanding issues.

E. Once server starts successfully, open browser and debug client errors
1. When the dev server appears to start successfully (no immediate crash, logs indicate “listening on port…” or equivalent):
   - Open the browser to the chosen URL (e.g., `http://localhost:3000`).
2. Observe:
   - HTTP-level issues (404, 500, 502).
   - Frontend error overlays (Next.js / React error page, Vite error screen, etc.).
   - Browser console errors (TypeError, unhandled promise, missing API routes, CORS issues, etc.).
3. For each client-side issue:
   - Identify the relevant file(s) from stack traces or error overlays.
   - Apply minimal, safe fixes to:
     - Fix import paths, props mismatches, null/undefined issues, simple logic bugs.
     - Correct obviously broken API calls (e.g., wrong URL, missing required field).
   - Rebuild/reload the page (or let Next/Vite hot reload).
4. As with server-side:
   - Limit attempts to a reasonable number.
   - If you can’t resolve the error confidently, stop and summarize.

F. Boundaries / safety
1. Do NOT:
   - Delete large swaths of code to “make errors go away.”
   - Disable tests, security checks, or type checking unless explicitly instructed by the user.
   - Introduce breaking API changes or schema changes without clear direction.
2. Prefer:
   - Minimal, reversible changes.
   - Fixing the root cause rather than suppressing symptoms (e.g., don’t just `// eslint-disable` everything).
3. If a fix requires significant architectural changes or unclear product decisions:
   - Stop and explain what needs human input.

G. Completion criteria
You may consider `launch-debug-fix` successful when:

1. `./start_app.sh dev` runs without crashing.
2. The main app URL loads without obvious server errors or fatal client errors.
3. You have:
   - Fixed all straightforward, reproducible errors encountered in this session, OR
   - Reached a clear limit where further changes would be unsafe or speculative.

H. Final summary to the user
In your chat response, provide a concise summary:

- Commands run (`./start_app.sh dev`, any npm/pnpm/python commands).
- Errors encountered and which ones you fixed.
- Files changed (high-level: “Updated components/AuthForm.tsx, fixed API route /api/user, adjusted PORT env handling”).
- Remaining issues, if any, and what decisions are needed from the user.

Do not paste entire logs or full file contents unless asked; keep the summary readable and focused on what changed and what’s still broken.
