# Rule: Project_File_Structure_Standards_v1.1

## Metadata
- **Created:** 2025-11-17
- **Last Updated:** 2025-11-18
- **Version:** 1.1

## When to Apply This Rule
Apply this rule whenever creating new projects, reorganizing files, or auditing the codebase structure. It ensures every file has a predictable home.

## 1. High-Level Goals
- **Predictability:** An agent or human should know exactly where to look for a file.
- **Separation of Concerns:** Code, tests, docs, and config should not mix.
- **Scalability:** The structure should work for small scripts and large monorepos.

## 2. Root Directory Standards
The root contains only essential project-level configuration and entry points.

| File / Folder | Description |
| :--- | :--- |
| `README.md` | The project landing page. Must contain "What is this?" and "How to run it?". |
| `package.json` / `requirements.txt` | Dependency definitions. |
| `.gitignore` | Files to exclude from git. |
| `.env.example` | Template for environment variables. **Never commit .env**. |
| `.cursor/` | AI Agent rules and commands. |
| `src/` | The actual application source code. |
| `tests/` | Test suites (unit, integration, e2e). |
| `docs/` | Documentation (specs, roadmap, standards). |
| `commands/` | Scripts or markdown files for AI automation tasks. |
| `config/` | Static configuration files (non-secret). |
| `scripts/` | Maintenance or build scripts (e.g., database seeders). |

## 3. Core Directories & Usage

### 3.1 /src – Application Code
This is where the logic lives.

**Standard Monolith Structure:**
- `/app`: (Next.js/Remix) Application routes and pages.
- `/api`: Backend API handlers or server entry points.
- `/components`: Reusable UI components (React, Vue, etc.).
- `/lib`: Core business logic, shared wrappers, and adapters.
- `/services`: Modules that interact with external services (DB, Stripe, OpenAI).
- `/models`: Database schemas or Typescript interfaces/types.
- `/hooks`: Custom React hooks.
- `/styles`: CSS, Tailwind config, or Sass files.
- `/utils`: Pure helper functions (date formatting, string manipulation).
- `/agents` or `/ai`: AI-specific logic (prompts, tools).

### 3.2 /tests
Mirror the `src` structure where possible.
- `/unit`: Tests for individual functions/classes.
- `/integration`: Tests for module interactions (e.g., API + DB).
- `/e2e`: Full browser-based tests (Playwright/Cypress).

### 3.3 /docs
Central knowledge base.
- `Roadmap_vX.X.md`: High-level goals.
- `/specs`: Technical design documents for features.
- `/process`: Workflows (how we deploy, how we test).
- `/archive`: Old docs that are no longer active but kept for history.

### 3.4 /commands
AI automation interface.
- Stores `.mdc` or script files that agents use to run complex tasks (e.g., `launch.mdc`, `refactor_module.mdc`).

## 4. Alternative Structures

### 4.1 Monorepo / Full Stack Split
If the application has a distinct Frontend and Backend that are deployed separately or are complex enough to warrant separation:

**Recommended Structure:**
```
/apps
  /web          # Next.js / React Frontend
  /api          # Node / Python Backend
  /docs         # Documentation site
/packages
  /ui           # Shared UI components
  /config       # Shared eslint/tsconfig
  /utils        # Shared helper functions
```

In this case, `src` is replaced by `apps/` and `packages/`.

## 5. Naming Conventions
- **Directories:** `kebab-case` (e.g., `user-auth`, `data-processing`).
- **Files:** `kebab-case` (TS/JS), `snake_case` (Python).
- **React Components:** `PascalCase` (e.g., `SubmitButton.tsx`).

## 6. AI Agent Behavior
- **Place new code** into proper `src` folders. Do not dump files in root.
- **Create tests** immediately in `/tests` when creating new modules.
- **File new docs** under `/docs`.
- **Refactor** large files (>200 lines) by extracting logic into `utils` or `components`.

## 7. Safety Rules
- **Do not delete** items without explicit instruction.
- **Do not alter** framework-required layouts (e.g., Next.js `app` router).
- **Do not move** CI/CD or tool-linked files without confirmation.

# End of Rule – Project_File_Structure_Standards_v1.1
