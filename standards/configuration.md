# Configuration Standards v1.1

## Metadata
- **Created:** 2025-11-17
- **Last Updated:** 2025-11-18
- **Version:** 1.1

## 1. Core Philosophy
Configuration should be centralized, type-safe, and separated from code. We distinguish between **Secrets** (credentials) and **Settings** (behavior).

## 2. Directory Structure
We use a dedicated `/config` directory for static configuration to avoid cluttering the root.

```
/config
  ├── site.ts           # Public site metadata (names, URLs)
  ├── nav.ts            # Navigation menus
  ├── constants.ts      # Magic numbers and global constants
  ├── ai-models.ts      # AI model IDs and parameters
  └── security.ts       # Rate limiting rules, CSP headers
```

**Rule:** Do not hardcode config in components. Import from `@/config`.

## 3. Choosing the Right Tool (Pros & Cons)

### 3.1 Static Config (`/config/*.ts`)
**Best For:** Constants, UI Text, Menu Items, Public Metadata.
*   **✅ Pros:**
    *   **Zero Latency:** Compiled directly into the app bundle.
    *   **Type-Safe:** Full TypeScript support and autocompletion.
    *   **Versioned:** Changes are tracked in Git history.
*   **❌ Cons:**
    *   **Hard to Change:** Requires a code commit + redeploy to update.
    *   **Insecure:** Cannot hold secrets (they end up in the client bundle).

### 3.2 Dynamic Config (`SettingsManager`)
**Best For:** Feature Flags, API Keys, Limits, Maintenance Mode.
*   **✅ Pros:**
    *   **Instant Updates:** Change values at runtime via DB/Admin UI.
    *   **Secure:** Encrypted at rest; never exposed to client unless explicitly allowed.
    *   **Context-Aware:** Can vary by environment (Dev vs Prod) or Tenant.
*   **❌ Cons:**
    *   **Latency:** Requires a DB fetch or cache lookup.
    *   **Complexity:** Needs DB migration and management UI.

### 3.3 Secrets Management
- **Development:** Use `.env.local`.
- **Production:** Use platform environment variables (Supabase/Vercel).
- **Loading:** Use `modules/settings-manager` (preferred) or `process.env` with Zod validation.

## 4. AI Agent Rules for Config
- **Discovery:** When asked for a value (e.g., "What is the site name?"), check `/config/site.ts` first.
- **Modification:** If a user asks to change a global setting, update it in `/config`, not in individual files.

## 5. Versioning
- **Version Numbers:** Configuration files do not strictly require version numbers unless they are schema definitions (e.g., `settings-schema-v1.ts`).
- **Migrations:** If changing the structure of a config file, consider backward compatibility.
