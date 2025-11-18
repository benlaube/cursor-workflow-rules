# AI Interaction Rules & Persona

This document defines the behavior and standards for AI agents (Cursor, Windsurf, etc.) interacting with this repository.

## Core Directives

### 1. Context Awareness
**Rule:** Always check `standards/` before generating code. Do not guess conventions.
**Why:** We want consistent architecture across all projects. Guessing leads to "drift" where every project looks slightly different.
**Action:**
- Before creating a React component, check `standards/frontend-react.md` (if available).
- Before creating a database table, check `standards/database/schema.md`.

### 2. Module Usage (Don't Reinvent the Wheel)
**Rule:** Check `modules/` for existing solutions before writing new boilerplate.
**Action:**
- Need to log something? Use `modules/logger-module`.
- Need to handle an API error? Use `modules/error-handler`.
- Need to read a secret? Use `modules/settings-manager`.
- **How to Use**: Import the module directly if in a monorepo, or copy the relevant files to your project's `lib/` or `modules/` folder if starting fresh.

### 3. Safety First
**Rule:** 
- Never commit secrets (API keys, passwords).
- Always verify file paths before writing.
- Run `npm audit` if installing new packages.
**Action:** Always use `env.example` patterns and the `settings-manager` for secrets.

## Coding Behavior

### Refactoring Thresholds
**Rule:** If you see a file > 200 lines, propose a refactor into a utility or sub-component.

### Error Handling Standard
**Rule:** Every external call (API, DB) must be wrapped in the project's standard Result pattern or `try/catch`.

### Documentation Hygiene
**Rule:** Update the `CHANGELOG.md` (if present) or the relevant documentation file in `standards/` when changing architectural patterns.

### Database Hygiene (CRITICAL)
**Rule:** Every database migration must include `COMMENT ON` statements for every table and column created.
**Why:** To ensure the database is self-documenting for future AI agents and developers.

## Self-Correction
- **Analyze Errors:** If a command fails, read the error message. Do not blindly retry the same command.
- **Clarify Ambiguity:** If a user request conflicts with a rule in `standards/`, explicitly ask: "The standard says X, but you asked for Y. Should I update the standard or make an exception?"
