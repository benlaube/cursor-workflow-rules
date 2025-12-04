# Configuration_Standards_v1.2

## Metadata
- **Created:** 2025-11-17
- **Last Updated:** 2025-01-27
- **Version:** 1.2
- **Description:** Standards for configuration management, distinguishing between secrets and settings, with centralized and type-safe approaches.

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

**Storage Options:**
Supabase projects support three types of secret storage. See `standards/architecture/supabase-secrets-management.md` for a complete guide.

**Quick Reference:**
- **`.env` files:** Supabase credentials, build-time config, encryption keys
- **Supabase Secrets:** Edge Function environment variables (via Dashboard or CLI)
- **Database (Settings Manager):** User-configurable secrets, runtime settings, multi-tenant secrets

**Development:** Use `.env.local` for local development.
**Production:** Use platform environment variables (Supabase/Vercel) or database-backed settings.
**Loading:** Use `modules/settings-manager` (preferred) or `process.env` with Zod validation.

### 3.4 Supabase Configuration

**Local Development Setup:**
For detailed Supabase local installation and setup instructions, see `standards/architecture/supabase-local-setup.md`.

**Required Environment Variables for Local Development:**

When running Supabase locally, the following environment variables must be set in `.env.local`:

```bash
# Supabase Local Development Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<retrieved-from-supabase-status>
SUPABASE_SERVICE_ROLE_KEY=<retrieved-from-supabase-status>
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_STORAGE_URL=http://localhost:54321/storage/v1
```

**Retrieving Local Credentials:**
After starting Supabase locally with `supabase start`, run `supabase status` to retrieve the current API keys and connection strings. Copy these values into your `.env.local` file.

**Production Configuration:**
In production, these same environment variables should be set with production Supabase project values:
- `SUPABASE_URL`: Your production Supabase project URL
- `SUPABASE_ANON_KEY`: Production anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Production service role key (server-side only)
- `SUPABASE_DB_URL`: Production database connection string
- `SUPABASE_STORAGE_URL`: Production storage URL (typically same as SUPABASE_URL + `/storage/v1`)

**Important Notes:**
- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used in server-side contexts (Edge Functions, API routes)
- For client-side code, use `SUPABASE_ANON_KEY` only
- See `templates/file-templates/env.example` for a complete template

## 4. AI Agent Rules for Config
- **Discovery:** When asked for a value (e.g., "What is the site name?"), check `/config/site.ts` first.
- **Modification:** If a user asks to change a global setting, update it in `/config`, not in individual files.

## 5. Versioning
- **Version Numbers:** Configuration files do not strictly require version numbers unless they are schema definitions (e.g., `settings-schema-v1.ts`).
- **Migrations:** If changing the structure of a config file, consider backward compatibility.
