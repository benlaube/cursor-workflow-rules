# Configuration File Standards v1.0

## Metadata
- **Created:** 2025-11-18
- **Last Updated:** 2025-11-18
- **Version:** 1.0

## 1. Principles
Configuration files are the "steering wheel" of the application. They must be:
1.  **Predictable**: Always in standard locations.
2.  **Type-Safe**: Validated at startup (fail fast).
3.  **Environment-Aware**: Handle dev/test/prod differences explicitly.
4.  **Secret-Free**: Never commit API keys (use `.env` or `settings-manager`).

## 2. Standard Locations

| Type | Location | Format |
|------|----------|--------|
| **Environment Variables** | Root `.env` | Key-Value (`KEY=val`) |
| **Tool Configs** | Root (e.g., `tsconfig.json`) | JSON/JS/TS |
| **App Constants** | `src/config/constants.ts` | TypeScript exports |
| **Feature Flags** | `settings-manager` (DB) | Database Rows |

## 3. The "Config Module" Pattern
Do not use `process.env.KEY` directly in UI components or business logic. Instead, use a central typed configuration object.

### Example: `src/config/env.ts`
```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

## 4. Allowed Config Files
- `.eslintrc.json` / `eslint.config.js` (Linting)
- `prettier.config.js` (Formatting)
- `tsconfig.json` (TypeScript)
- `vitest.config.ts` (Testing)
- `tailwind.config.ts` (Styling)
- `next.config.js` (Framework)

## 5. Forbidden Practices
- ❌ Hardcoding secrets in `.ts` files.
- ❌ Creating "custom" config formats (e.g., `my-config.xml`) unless strictly necessary.
- ❌ Putting config logic inside UI components.

