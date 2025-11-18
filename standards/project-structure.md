# Rule: Project_File_Structure_Standards_v1.0

## Metadata
- **Created:** 2025-11-17
- **Last Updated:** 2025-11-17
- **Version:** 1.0

## When to Apply This Rule
Apply this rule whenever documentation is created, updated, reorganized, or found to be inconsistent, ensuring the project’s `/docs` structure remains clean, current, and aligned with these standards.

## 1. High-Level Goals
- Keep the root directory clean and minimal.
- Centralize application code under `/src`.
- Centralize tests under `/tests`.
- Centralize documentation under `/docs`.
- Centralize AI / automation commands under `/commands`.
- Use consistent naming conventions unless a framework requires otherwise.
- Avoid large structural changes without explicit user approval.

## 2. Root Directory Standards
The root contains:
- README.md
- package.json / requirements.txt
- .gitignore
- .env.example
- .cursorrules
- AGENTS.md
- /src
- /tests
- /docs
- /commands
- /config
- /scripts (optional)

## 3. Core Directories
### /src – Application Code
Recommended structure:
- /app
- /api
- /components
- /lib
- /services
- /models
- /hooks
- /styles
- /utils
- /agents or /ai or /mcp (choose one)

### /tests
- /unit
- /integration
- /e2e

### /docs
Follows Documentation_Management_v1.X
- Roadmap_vX.X.md
- /roadmap
- /specs
- /process
- /archive

### /commands
- user_commands_vX_X.md
- project_commands_vX_X.md
- doc_cleanup_command_vX_X.md

### /config
General config files.

### /scripts
Utility scripts.

## 4. Naming Conventions
- snake_case for structure files.
- Follow framework naming for forced conventions.
- Code files follow ecosystem norms.

## 5. AI Agent Behavior
- Place new code into proper /src folders.
- Create tests mirroring structure in /tests.
- File new docs under /docs.
- Place automation under /commands.
- Avoid large restructures without approval.

## 6. Safety Rules
- Do not delete items without explicit instruction.
- Do not alter framework-required layouts.
- Do not move CI/CD or tool-linked files without confirmation.

# End of Rule – Project_File_Structure_Standards_v1.0

