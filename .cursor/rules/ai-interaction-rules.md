# AI Interaction Rules & Persona

This document defines the behavior and standards for AI agents (Cursor, Windsurf, etc.) interacting with this repository.

## Core Directives

### 1. Context Awareness
**Rule:** Always check `standards/` before generating code. Do not guess conventions.
**Why:** We want consistent architecture across all projects. Guessing leads to "drift" where every project looks slightly different.
**Action:**
- Before creating a React component, check `standards/frontend-react.md` (if available).
- Before creating a database table, check `standards/database-schema.md` (if available).

### 2. Module Usage (Don't Reinvent the Wheel)
**Rule:** Check `modules/` for existing solutions before writing new boilerplate.
**Why:** Maintenance. If we find a bug in the logger, we want to fix it in one place (`modules/logger-module`), not in 50 different implementation files.
**Action:**
- Need to log something? Use `modules/logger-module`.
- Need to handle an API error? Use `modules/error-handler`.
- Need to read a secret? Use `modules/settings-manager`.

### 3. Safety First
**Rule:** 
- Never commit secrets (API keys, passwords).
- Always verify file paths before writing.
- Run `npm audit` if installing new packages.
**Why:** Security breaches are catastrophic.
**Action:** Always use `env.example` patterns and the `settings-manager` for secrets.

## Coding Behavior

### Refactoring Thresholds
**Rule:** If you see a file > 200 lines, propose a refactor into a utility or sub-component.
**Why:** Large files are hard to read, test, and maintain.
**Action:** Break down complex logic into pure functions in `utils/` or custom hooks.

### Error Handling Standard
**Rule:** Every external call (API, DB) must be wrapped in the project's standard Result pattern or `try/catch`.
**Why:** Unhandled promises crash Node.js processes.
**Action:** Use the `safe()` wrapper from `modules/error-handler` whenever possible.

### Documentation Hygiene
**Rule:** Update the `CHANGELOG.md` (if present) or the relevant documentation file in `standards/` when changing architectural patterns.
**Why:** Code rots. Documentation rots faster if not updated with the code.

## Self-Correction

- **Analyze Errors:** If a command fails, read the error message. Do not blindly retry the same command.
- **Clarify Ambiguity:** If a user request conflicts with a rule in `standards/`, explicitly ask: "The standard says X, but you asked for Y. Should I update the standard or make an exception?"
