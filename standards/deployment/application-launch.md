# Create_Application_Launch_Command_v1.2

## Metadata

- **Created:** 2025-11-18
- **Last Updated:** 2025-11-18
- **Version:** 1.2
- **Description:** Guide for generating or updating application-specific launch commands under `.cursor/commands/` that reliably start the project in development and production environments, using configuration (project root + port) sourced from env or a settings table instead of hard-coding.

---

## 1. Scope & Idempotency

1.1 The agent must generate **and/or update** launch command files under `.cursor/commands/` that tell an agent exactly how to spin up the project end-to-end.

1.2 This command is **idempotent**:

- 1.2.1 If standard launch commands already exist (e.g., `launch_application_dev`, `launch_application_prod`), the agent must **update** them to reflect the current stack, configuration, and conventions instead of blindly creating duplicates.
- 1.2.2 When updating, prefer:
  - a. Replacing outdated or incorrect steps.
  - b. Preserving clearly human-authored notes or sections marked as such (e.g., `HUMAN NOTE:`) where possible.

  1.3 All paths must be **relative to the repository root** and assume scripts live alongside the codebase.

  1.4 If the repository contains multiple services (e.g., `frontend/`, `backend/`, `worker/`), the agent must:

- 1.4.1 Avoid collapsing everything into a single opaque command.
- 1.4.2 Either:
  - a. Create separate service-specific launch commands (e.g., `launch_frontend_dev`, `launch_backend_dev`, `launch_worker_dev`) **in addition to** the main `launch_application_*` commands, **or**
  - b. Keep `launch_application_dev` / `launch_application_prod` as orchestrators that accept a `service` parameter and delegate to service-specific instructions.
- 1.4.3 Clearly document all valid `service` values and which directories they map to.

---

## 2. Command Outputs & Naming

2.1 The agent must always generate **two primary commands**:

- `launch_application_dev` – development environment
- `launch_application_prod` – production environment

  2.2 Each command must be stored as a markdown file in `.cursor/commands/`, using the naming convention supported by Cursor (e.g., `launch_application_dev.md` and `launch_application_prod.md`).

  2.3 Each command file must start with:

- 2.3.1 A short description.
- 2.3.2 A list of accepted parameters (see Section 5).
- 2.3.3 A note that the command:
  - a. Uses configuration-driven `Project_Root` and `port` (Section 4).
  - b. Surfaces errors and failures in the Cursor terminal.

---

## 3. Stack Detection

3.1 Before writing any install or run commands, inspect the repo for language and framework indicators, such as:

- 3.1.1 **Node/JS**:
  - `package.json`
  - `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`
  - `next.config.*`, `vite.config.*`, `nuxt.config.*`
- 3.1.2 **Python**:
  - `pyproject.toml`, `requirements.txt`, `Pipfile`
  - `manage.py` (Django)
  - `alembic.ini` or migrations folders
- 3.1.3 **Ruby**:
  - `Gemfile`, `Gemfile.lock`, `config.ru`
- 3.1.4 **PHP**:
  - `composer.json`, `composer.lock`
- 3.1.5 **Infrastructure / containers**:
  - `Dockerfile`, `docker-compose.yml`, `Makefile`, `Procfile`

  3.2 Choose the appropriate package manager:

- 3.2.1 If `pnpm-lock.yaml` is present → use `pnpm`.
- 3.2.2 Else if `yarn.lock` is present → use `yarn`.
- 3.2.3 Else if `package-lock.json` is present → use `npm`.
- 3.2.4 If none exist but `package.json` does, default to `npm`.

  3.3 Detect common database/migration tools (Prisma, Alembic, Rails migrations, Knex, etc.) and plan migration steps accordingly.

- 3.3.1 Where possible, derive the specific commands from existing project files (`schema.prisma`, `alembic.ini`, `db/migrate`, etc.) rather than inventing them.

---

## 4. Configuration Source: Project Root & Port

4.1 The launch commands must **not** hard-code the app’s base URL or port when a configuration source can be used. Instead, they must resolve `Project_Root` and `port` from the project configuration in this order of precedence:

- 4.1.1 **Settings table in the database** (if it exists or is defined):
  - a. Look for a table such as `settings`, `app_settings`, or similar.
  - b. Prefer clearly named fields like `project_root_url` and `port`.
- 4.1.2 **Environment files**:
  - a. Check `.env`, `.env.local`, `.env.development`, `.env.production`, or other env files used by the stack.
  - b. Look for keys like `PROJECT_ROOT_URL`, `APP_BASE_URL`, `APP_URL`, `PORT`, `APP_PORT`, `VITE_PORT`, etc.
- 4.1.3 **Environment variables at runtime**:
  - a. Assume the hosting platform or dev shell may define `PORT`, `APP_URL`, or similar.
- 4.1.4 **Fallback default** (only if none of the above are defined):
  - a. Use a reasonable default (e.g., `http://localhost:3000`), but
  - b. Immediately scaffold proper configuration (Section 4.3).

  4.2 The command instructions should explicitly say **where** `Project_Root` and `port` come from, for example:

- “This command reads `PROJECT_ROOT_URL` and `PORT` from `.env.local`. If they are missing, see the configuration section below.”

  4.3 If configuration is **not** already structured to expose `Project_Root` and `port`, the agent must:

- 4.3.1 **Env-based configuration**:
  - a. Introduce env variables in `.env.example` (or equivalent template) such as:
    - `PROJECT_ROOT_URL`
    - `PORT` (or `APP_PORT` if the framework prefers a different key)
  - b. Recommend that developers copy `.env.example` to `.env` / `.env.local` and fill in real values.
- 4.3.2 **Settings table configuration** (if the app already uses a database settings table):
  - a. Add fields like `project_root_url` and `port` to the settings model/migration if they are missing.
  - b. Document how those settings are read at runtime (e.g., via an ORM or configuration helper).
- 4.3.3 **Update launch docs**:
  - a. Document how to adjust `Project_Root` and `port` going forward (env variables or settings table).
  - b. Emphasize that once those values are changed in configuration, the launch commands do **not** need edits.

---

## 5. Standard Parameters

5.1 Commands may use the following standard parameters:

- 5.1.1 `service` (string):
  - Used in multi-service/monorepo setups.
  - Determines which subdirectory to operate in (e.g., `frontend`, `backend`).
- 5.1.2 `skip-tests` (boolean):
  - If `true`, skip running tests before launch.
- 5.1.3 `skip-install` (boolean):
  - If `true`, assume dependencies are already installed and skip install steps.

  5.2 Each command file must document:

- 5.2.1 Parameter names.
- 5.2.2 Accepted values.
- 5.2.3 Defaults.
- 5.2.4 Behavioral impact (e.g., “If `skip-tests=true`, tests will not be run before launch.”).

---

## 6. Development Launch Flow (`launch_application_dev`)

For `launch_application_dev`:

6.1 **Resolve configuration**

- 6.1.1 Resolve `Project_Root` and `port` according to Section 4.
- 6.1.2 Example outcome:
  - `Project_Root` = `http://localhost:3000`
  - `port` = `3000`
- 6.1.3 Document this resolution clearly in the command instructions.

  6.2 **Select service (if applicable)**

- 6.2.1 If a `service` parameter is provided, change directory into the appropriate service folder.
- 6.2.2 If no `service` is provided and multiple services exist, define and document the default behavior (e.g., “default = `frontend`”).

  6.3 **Verify and prepare the environment**

- 6.3.1 Node:
  - a. Check for `node_modules`.
  - b. If missing and `skip-install` is not `true`, run `npm install`, `yarn install`, or `pnpm install` per Section 3.2.
- 6.3.2 Python:
  - a. Ensure a virtual environment (e.g., `.venv`) exists and is activated.
  - b. If not, create and activate it, then install dependencies from `pyproject.toml`, `requirements.txt`, etc.
- 6.3.3 Other stacks:
  - a. Use equivalent dependency install steps (`bundle install`, `composer install`, etc.).

  6.4 **Environment variables**

- 6.4.1 Indicate which env file(s) are expected in development (e.g., `.env.local`, `.env.development`).
- 6.4.2 Do not invent values; only list variable names and their purpose.

  6.5 **Optional lint/tests**

- 6.5.1 By default, run appropriate lint/tests before launching:
  - a. Examples: `npm test`, `pnpm test`, `pytest`, `bundle exec rspec`.
- 6.5.2 If tests fail:
  - a. The launch must **abort**.
  - b. The failure reason must be surfaced clearly in the Cursor terminal.
- 6.5.3 If `skip-tests=true`, explicitly state that tests are being skipped.

  6.6 **Start the dev server**

- 6.6.1 Use the stack-appropriate dev server command:
  - a. Node examples: `npm run dev`, `yarn dev`, `pnpm dev`.
  - b. Python examples: `uvicorn app.main:app --reload`, `python manage.py runserver`.
  - c. Rails: `rails server`.
- 6.6.2 Include the expected URL in the instructions using the resolved `Project_Root` and `port`, for example:
  - `Server should be available at ${Project_Root} (e.g., http://localhost:3000).`

---

## 7. Production Launch Flow (`launch_application_prod`)

For `launch_application_prod`:

7.1 **Resolve configuration**

- 7.1.1 Resolve `Project_Root` and `port` via Section 4, but assume values are supplied by:
  - a. Production env variables, and/or
  - b. A production settings table.
- 7.1.2 Document which env vars or settings fields must be configured (names only).

  7.2 **Build-first approach**

- 7.2.1 Install dependencies with the appropriate package manager, unless `skip-install=true`.
- 7.2.2 Run database migrations if the stack supports them (Prisma, Alembic, Rails, Knex, etc.).
- 7.2.3 Execute build/compile steps:
  - a. Node: `npm run build`, `yarn build`, etc.
  - b. Python: `python -m compileall` or framework-specific build.
  - c. Rails: `rails assets:precompile`.

  7.3 **Containers (if present)**

- 7.3.1 If a `Dockerfile` exists:
  - a. Document `docker build -t app-name .` and `docker run ... app-name` flow.
- 7.3.2 If `docker-compose.yml` exists:
  - a. Document `docker-compose up --build`.
- 7.3.3 Mention how env vars are passed to containers (e.g., `--env-file`).

  7.4 **Start the app in production mode**

- 7.4.1 Use a production-grade runner:
  - a. Node: `npm run start`, `yarn start`, etc.
  - b. Python: `gunicorn module:app`.
  - c. Rails: `rails server -e production`.
- 7.4.2 Remind the user that logs should be routed to stdout or a logging service for observability.

  7.5 **Long-running processes**

- 7.5.1 If the deployment target is a bare server/VM, mention using:
  - a. `pm2`, `systemd`, or `supervisord` to keep the service running.
- 7.5.2 Explain at a high level how restart-on-failure is handled.

---

## 8. Error Handling & Console Visibility

8.1 The launch commands must explicitly mention that:

- 8.1.1 Install, build, test, and runtime logs are visible in the Cursor terminal.
- 8.1.2 The agent must highlight:
  - a. Any failures with a short summary and the failing command.
  - b. The final success message and the listening URL.

  8.2 General error-handling expectations:

- 8.2.1 **Tests failing**:
  - a. Abort launch.
  - b. Print a concise error summary (test command + where to look).
- 8.2.2 **Missing env variables or configuration**:
  - a. Detect missing required keys (e.g., `DATABASE_URL`, `PROJECT_ROOT_URL`, `PORT`).
  - b. Print a message specifying which keys are missing and which file or settings location needs updating.
- 8.2.3 **Port already in use**:
  - a. Suggest changing the `port` in env/settings or stopping the conflicting process.
- 8.2.4 **Database connection or migration failures**:
  - a. Surface the failing command (e.g., `prisma migrate deploy`, `alembic upgrade head`).
  - b. Suggest checking DB credentials and connectivity.
- 8.2.5 **Unsupported or ambiguous stack**:
  - a. If the stack cannot be reliably inferred, say so explicitly.
  - b. Provide a minimal generic template and ask for human clarification in comments.

  8.3 Where applicable, reference any global logging/error-handling standards so developers know where logs go and how to increase log verbosity (`LOG_LEVEL=debug`, etc.).

---

## 9. Version Control Guidance

9.1 By default, `.cursor/commands` **should be tracked in git** so that all branches and agents share consistent launch automation.

9.2 Experimental or temporary commands can live on feature branches, but finalized launch commands must be merged into the main branch to keep production aligned.

9.3 Only exclude `.cursor` from git when it contains purely personal/local shortcuts that are not required by other developers or agents.

---
