# Supabase Secrets Management Guide v1.0

Description: Comprehensive guide for managing secrets and sensitive configuration in Supabase projects, covering multiple storage options and when to use each.
Created: 2025-01-27
Last_Updated: 2025-01-27

---

## 1. Purpose of This Document

This document explains the different ways to store and manage secrets in Supabase projects, helping you choose the right approach for each type of secret.

**Version:** v1.0

---

## 2. Overview: Three Types of Secret Storage

Supabase projects can store secrets in three primary locations:

1. **Environment Variables (`.env` files)** - Local development, build-time config
2. **Supabase Project Secrets** - Edge Functions, project-level configuration
3. **Database-Backed Secrets** - Application settings, runtime configuration

Each has specific use cases and security considerations.

---

## 3. Environment Variables (`.env` files)

### 3.1 What Goes Here

**Best For:**
- Supabase connection credentials (URL, keys)
- Build-time configuration
- Local development secrets
- Secrets that don't change frequently
- Secrets needed before the database is available

**Examples:**
```bash
# Supabase Connection (always in .env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Application Config
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
PORT=3000

# Encryption Key (for database secrets)
ENCRYPTION_KEY=your_64_character_hex_key
```

### 3.2 Characteristics

- ✅ **Fast Access:** Available immediately at application startup
- ✅ **Simple:** No database queries needed
- ✅ **Platform Support:** Works with Vercel, Netlify, Railway, etc.
- ❌ **Static:** Requires redeploy to change
- ❌ **No UI:** Must edit files or platform dashboard
- ❌ **Limited Organization:** Flat key-value structure

### 3.3 When to Use

- **Supabase credentials** (always)
- **Build-time configuration** (ports, URLs)
- **Encryption keys** for database-backed secrets
- **Platform-specific secrets** (Vercel, Netlify env vars)

---

## 4. Supabase Project Secrets (Edge Functions & Project Settings)

### 4.1 What Goes Here

**Best For:**
- Edge Function environment variables
- Project-level configuration
- Secrets used only in Edge Functions
- Secrets that need to be managed via Supabase Dashboard

**Examples:**
- `OPENAI_API_KEY` - Used in Edge Functions for AI operations
- `STRIPE_SECRET_KEY` - Used in webhook Edge Functions
- `SENDGRID_API_KEY` - Used for email in Edge Functions
- `SITE_URL` - Base URL for sitemap generation

### 4.2 How to Set Supabase Secrets

**Via Supabase Dashboard:**
1. Go to **Project Settings** > **Edge Functions** > **Secrets**
2. Add secret key-value pairs
3. Secrets are automatically available in Edge Functions via `Deno.env.get()`

**Via Supabase CLI:**
```bash
# Set a secret for local development
supabase secrets set OPENAI_API_KEY=sk-...

# Set a secret for production (requires project link)
supabase secrets set OPENAI_API_KEY=sk-... --project-ref your-project-ref
```

**Via Supabase Management API:**
```typescript
// Using Supabase Management API
await supabaseAdmin.projects.updateSecrets(projectId, {
  secrets: {
    OPENAI_API_KEY: 'sk-...',
    STRIPE_SECRET_KEY: 'sk_live_...'
  }
})
```

### 4.3 Accessing Secrets in Edge Functions

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std/http/server.ts"

serve(async (req) => {
  // Secrets are automatically available via Deno.env
  const openaiKey = Deno.env.get("OPENAI_API_KEY")
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")
  
  // Use secrets...
})
```

### 4.4 Characteristics

- ✅ **Edge Function Native:** Built-in support for Edge Functions
- ✅ **Dashboard Management:** Can be updated via Supabase UI
- ✅ **Automatic Injection:** Available via `Deno.env.get()` in Edge Functions
- ❌ **Edge Functions Only:** Not accessible from client or API routes
- ❌ **No Encryption:** Stored as plain text (Supabase manages security)
- ❌ **Limited Organization:** Flat key-value structure

### 4.5 When to Use

- **Edge Function secrets** (primary use case)
- **Project-level configuration** used only in Edge Functions
- **External API keys** used in serverless functions
- **Secrets that need dashboard management**

---

## 5. Database-Backed Secrets (Settings Manager)

### 5.1 What Goes Here

**Best For:**
- Application settings that change at runtime
- User-configurable secrets (via admin UI)
- Multi-tenant secrets (different per tenant)
- Secrets that need encryption at rest
- Secrets that need audit trails
- Environment-specific values (dev/prod)

**Examples:**
- `openai_api_key` - User-configurable API key
- `stripe_webhook_secret` - Per-environment webhook secrets
- `email_smtp_password` - SMTP credentials
- `third_party_api_key` - External service API keys
- `feature_flags` - Feature toggle settings

### 5.2 How It Works

The `modules/settings-manager` provides a database-backed secrets system. **This module is the recommended solution for all database-backed secrets.**

**Schema:**
- `settings` table - Application settings with encryption
- `environment_variables` table - Environment variables with encryption

**Features:**
- ✅ AES-256-GCM encryption at rest
- ✅ Environment support (default/dev/prod)
- ✅ Audit trail (created_by, updated_by, timestamps)
- ✅ UI masking (shows `••••••••1234` in admin panels)
- ✅ Category organization (api_keys, url_config, app_config, mcp_env)
- ✅ Validation rules (JSON-based)
- ✅ Automatic encryption/decryption
- ✅ Fallback to default environment
- ✅ MCP server association (for environment_variables)

**Module Location:** `modules/settings-manager/`
**Documentation:** See `modules/settings-manager/README.md` and `modules/settings-manager/INTEGRATION_GUIDE.md`

### 5.3 Setting Up Database Secrets

**Quick Start:**
1. **Copy the module** from `modules/settings-manager/` to your project
2. **Add schema tables** (see `modules/settings-manager/schema-example.ts`)
3. **Set encryption key** in `.env`: `ENCRYPTION_KEY=your_64_character_hex_key`
4. **Use the SettingsManager class**

**Full Integration Guide:** See `modules/settings-manager/INTEGRATION_GUIDE.md`

**Basic Usage:**
```typescript
import { SettingsManager } from '@/lib/settings/settings-manager'

// Save a secret (automatically encrypted)
await SettingsManager.saveSetting({
  key: 'openai_api_key',
  value: 'sk-...',
  environment: 'production',
  category: 'api_keys',
  isSecret: true,
  description: 'OpenAI API key for production',
  updatedBy: 'user@example.com'
})

// Retrieve a secret (automatically decrypted)
const apiKey = await SettingsManager.getSettingValue(
  'openai_api_key',
  'production'
)

// Get all settings for an environment
const allSettings = await SettingsManager.getSettings('production', 'api_keys')

// Mask for UI display
const masked = SettingsManager.maskSettingValue(setting) // Returns "••••••••1234"
```

### 5.4 Characteristics

- ✅ **Runtime Updates:** Change without redeploy
- ✅ **Encryption:** AES-256-GCM encryption at rest
- ✅ **UI Management:** Can build admin panels
- ✅ **Audit Trail:** Track who changed what
- ✅ **Environment Support:** Different values per environment
- ✅ **Organization:** Categories, descriptions, validation
- ❌ **Database Dependency:** Requires database connection
- ❌ **Latency:** Requires database query (can cache)
- ❌ **Setup Required:** Need to create schema and encryption setup

### 5.5 When to Use

**✅ Use Database Secrets (Settings Manager) for:**

1. **User-Configurable Secrets**
   - Secrets that admins need to change via UI
   - Example: API keys that users configure themselves
   - **Reference:** `modules/settings-manager/` - Provides full CRUD with UI masking

2. **Runtime Configuration**
   - Settings that need to change without redeploy
   - Example: Feature flags, rate limits, maintenance mode
   - **Reference:** `SettingsManager.saveSetting()` - Update via API/UI

3. **Secrets Needing Audit Trails**
   - Track who changed what and when
   - Example: Compliance requirements, security audits
   - **Reference:** `createdBy`, `updatedBy`, `createdAt`, `updatedAt` fields

4. **Application-Level Settings**
   - Settings with categories, descriptions, validation
   - Example: Email templates, notification settings
   - **Reference:** `category`, `description`, `validationRules` fields

5. **Multi-Environment Secrets**
   - Different values for dev/prod
   - Example: Different API keys per environment
   - **Reference:** `environment` parameter (default/dev/prod)

6. **MCP Server Configuration**
   - Environment variables for MCP servers
   - Example: GoHighLevel API key for specific MCP server
   - **Reference:** `EnvironmentVariablesManager` with `mcpServerId`

**⚠️ Multi-Tenant Note:**
The settings-manager doesn't have explicit `tenant_id` support, but you can:
- Use the `environment` field for tenant-specific values
- Extend the schema to add `tenant_id` column
- Use separate databases per tenant (SaaS pattern)

---

## 6. Decision Matrix: Where Should My Secret Go?

| Secret Type | Storage Location | Module/Reference | Reason |
|------------|-----------------|------------------|--------|
| **Supabase URL/Keys** | `.env` file | N/A | Required for Supabase connection, never changes |
| **Encryption Key** | `.env` file | N/A | Needed before database is available |
| **Build-time Config** | `.env` file | N/A | Used during build process |
| **Edge Function API Keys** | Supabase Secrets | Supabase Dashboard/CLI | Native Edge Function support |
| **Edge Function Config** | Supabase Secrets | Supabase Dashboard/CLI | Used only in Edge Functions |
| **User-Configurable Secrets** | Database (Settings) | `modules/settings-manager/` | Need UI management, runtime updates |
| **Multi-Environment Secrets** | Database (Settings) | `SettingsManager` with `environment` param | Different values per environment |
| **Application Settings** | Database (Settings) | `SettingsManager` with `category` | Need categories, validation, audit |
| **MCP Server Secrets** | Database (Settings) | `EnvironmentVariablesManager` with `mcpServerId` | MCP server-specific configuration |
| **External Service Keys** | Database (Settings) or Supabase Secrets | `SettingsManager` if user-configurable | User-configurable → Database, Static → Supabase Secrets |

---

## 7. Security Best Practices

### 7.1 Environment Variables

- ✅ **Never commit `.env` files** to version control
- ✅ **Use `.env.example`** with placeholder values
- ✅ **Rotate secrets periodically**
- ✅ **Use different values per environment**
- ✅ **Restrict access** to platform dashboards

### 7.2 Supabase Secrets

- ✅ **Use service role key** only in Edge Functions
- ✅ **Never expose** in client-side code
- ✅ **Rotate secrets** via Supabase Dashboard
- ✅ **Use least privilege** (only necessary secrets)
- ✅ **Monitor access** via Supabase logs

### 7.3 Database Secrets

- ✅ **Always encrypt** secrets (`is_secret = true`)
- ✅ **Use strong encryption key** (64 hex characters)
- ✅ **Rotate encryption key** periodically
- ✅ **Mask in UI** (show only last 4 characters)
- ✅ **Log access** (audit trail)
- ✅ **Use RLS policies** to restrict access
- ✅ **Rate limit** secret retrieval

---

## 8. Example: Complete Secret Management Setup

### 8.1 Local Development

```bash
# .env.local
# Supabase connection (always in .env)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<from supabase status>

# Encryption key for database secrets
ENCRYPTION_KEY=<generated 64-char hex key>

# Application config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 8.2 Edge Function Secrets

```bash
# Set via Supabase CLI or Dashboard
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

### 8.3 Database Secrets

```typescript
// Save via SettingsManager (encrypted automatically)
await SettingsManager.saveSetting({
  key: 'sendgrid_api_key',
  value: 'SG.xxx',
  environment: 'production',
  category: 'api_keys',
  isSecret: true,
  description: 'SendGrid API key for email sending'
})

// Retrieve (decrypted automatically)
const sendgridKey = await SettingsManager.getSettingValue(
  'sendgrid_api_key',
  'production'
)
```

---

## 9. Migration Strategy

### 9.1 Moving from .env to Database

If you want to make a secret user-configurable:

1. **Keep in .env initially** (for backward compatibility)
2. **Add to database** via SettingsManager
3. **Update code** to check database first, fallback to `.env`
4. **Remove from .env** once database value is set

```typescript
// Migration pattern
async function getApiKey() {
  // Try database first
  const dbKey = await SettingsManager.getSettingValue('api_key', 'production')
  if (dbKey) return dbKey
  
  // Fallback to .env
  return process.env.API_KEY
}
```

### 9.2 Moving from Database to Supabase Secrets

If a secret is only used in Edge Functions:

1. **Retrieve from database**
2. **Set in Supabase Secrets** via CLI or Dashboard
3. **Update Edge Function** to use `Deno.env.get()`
4. **Remove from database** (optional)

---

## 10. Summary

**Use `.env` files for:**
- Supabase connection credentials
- Build-time configuration
- Encryption keys
- Platform-specific secrets

**Use Supabase Secrets for:**
- Edge Function environment variables
- Project-level Edge Function configuration
- Secrets used only in serverless functions

**Use Database (Settings Manager) for:**
- User-configurable secrets
- Runtime configuration
- Multi-tenant secrets
- Secrets needing encryption + audit trails
- Application settings with categories/validation

**Key Principle:** Choose the storage method that matches your use case:
- **Static, build-time** → `.env`
- **Edge Function only** → Supabase Secrets
- **Runtime, user-configurable** → Database

---

## 11. When to Reference Settings Manager

**Always reference `modules/settings-manager/` when:**

1. ✅ **Building admin UI for secrets** - Use `SettingsManager.maskSettingValue()` for display
2. ✅ **Storing user-configurable secrets** - Use `SettingsManager.saveSetting()` with `isSecret: true`
3. ✅ **Implementing runtime configuration** - Use `SettingsManager.getSettingValue()` to retrieve
4. ✅ **Managing environment-specific secrets** - Use `environment` parameter (default/dev/prod)
5. ✅ **Organizing settings by category** - Use `category` parameter (api_keys, url_config, etc.)
6. ✅ **Tracking who changed secrets** - Use `updatedBy` parameter for audit trails
7. ✅ **Configuring MCP servers** - Use `EnvironmentVariablesManager` with `mcpServerId`

**Don't use Settings Manager for:**
- ❌ Supabase connection credentials (use `.env`)
- ❌ Edge Function-only secrets (use Supabase Secrets)
- ❌ Build-time configuration (use `.env`)

**Quick Reference:**
- **Setup:** `modules/settings-manager/INTEGRATION_GUIDE.md`
- **API Reference:** `modules/settings-manager/QUICK_REFERENCE.md`
- **Schema:** `modules/settings-manager/schema-example.ts`
- **Full Standard:** `standards/database/settings-schema.md`

## 12. Related Documentation

- `standards/configuration.md` - Configuration standards
- `standards/database/settings-schema.md` - Database schema for settings
- `modules/settings-manager/README.md` - Settings manager module overview
- `modules/settings-manager/INTEGRATION_GUIDE.md` - Complete integration guide
- `modules/settings-manager/QUICK_REFERENCE.md` - Quick API reference
- `standards/architecture/supabase-local-setup.md` - Local Supabase setup
- `standards/architecture/supabase-edge-functions.md` - Edge Functions guide

---

*Last Updated: 2025-01-27*

