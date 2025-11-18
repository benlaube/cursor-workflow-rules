# AI Interaction Rules & Persona

## Core Directives

1.  **Context Awareness**: Always check `standards/` before generating code. Do not guess conventions.
2.  **Module Usage**: Check `modules/` for existing solutions before writing new boilerplate.
    - If a module exists (e.g., `settings-manager`), implement it instead of writing raw env var logic.
3.  **Safety First**:
    - Never commit secrets.
    - Always verify file paths before writing.
    - Run `npm audit` or equivalent if installing new packages.

## Coding Behavior

- **Refactoring**: If you see a file > 200 lines, propose a refactor into a utility or sub-component.
- **Error Handling**: Every external call (API, DB) must be wrapped in a `try/catch` or the project's standard Result pattern.
- **Documentation**: Update the `CHANGELOG.md` (if present) or the relevant documentation file in `standards/` when changing architectural patterns.

## Self-Correction

- If a command fails, analyze the output. Do not blindly retry the same command.
- If you are unsure about a user rule, ask for clarification.

