# Rule: Module_Structure_Standards_v1.0

## Metadata
- **Created:** 2025-11-19
- **Last Updated:** 2025-12-04
- **Version:** 1.0
- **Description:** Standards for creating and structuring reusable modules, defining required directory structure, files, and naming conventions.

## When to Apply This Rule
Apply this rule when creating new modules in `modules/` or when refactoring existing ones. Every module must be a self-contained unit.

## 1. High-Level Goals
- **Portability:** A module must be copy-pasteable into any project with minimal friction.
- **Consistency:** Every module must look and feel the same.
- **Self-Documentation:** A module must explain how to use itself.

## 2. Standard Directory Structure

Every module must follow this exact structure:

```text
modules/my-module-name/
├── README.md           # (Required) Usage, Dependencies, Installation
├── package.json        # (Required) Dependencies specific to this module
├── index.ts            # (Required) Public API exports
├── src/                # (Optional) Internal source code if complex
│   ├── components/     # React components
│   ├── hooks/          # React hooks
│   ├── services/       # Business logic / API calls
│   └── utils/          # Helper functions
├── migrations/         # (Required if DB) SQL or migration scripts
│   └── schema.sql      # Primary schema definition
└── tests/              # (Required) Unit tests
    └── my-module.test.ts
```

## 3. File Requirements

### 3.1 README.md
Must contain:
- **Title & Description**: What does this do?
- **Dependencies**: What libraries does it need? (e.g., `@supabase/supabase-js`, `framer-motion`)
- **Installation**: How to add it to a project.
- **Usage Example**: A code snippet showing how to import and use it.

### 3.2 index.ts
Must export *only* the public API. Do not export internal helpers.

```typescript
// Good
export { MyComponent } from './src/components/MyComponent';
export { useMyHook } from './src/hooks/useMyHook';

// Bad
export * from './src/utils/internalHelper'; 
```

### 3.3 migrations/
- Use `.sql` files for database schemas.
- Include **comments** on every table and column.
- If using RLS, include policies in the same file.

## 4. Naming Conventions
- **Module Name**: `kebab-case` (e.g., `payment-processor`, `user-profile`).
- **Files**: `kebab-case` (e.g., `payment-service.ts`).
- **React Components**: `PascalCase` (e.g., `PaymentModal.tsx`).

# End of Rule – Module_Structure_Standards_v1.0
