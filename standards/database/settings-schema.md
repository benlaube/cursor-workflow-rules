# Settings_Schema_Handling_Standard_v1.0

## Metadata
- **Created:** 2025-11-18
- **Last Updated:** 2025-11-18
- **Version:** 1.0
- **Description:** Standard guide for handling settings and configuration data in any application, covering database schema, API design, UI patterns, security, and best practices.

---

## Table of Contents

1. [Overview](#overview)
2. [Schema Design](#schema-design)
3. [Data Types and Categories](#data-types-and-categories)
4. [Environment Management](#environment-management)
5. [Security and Encryption](#security-and-encryption)
6. [API Design Patterns](#api-design-patterns)
7. [UI/UX Patterns](#uiux-patterns)
8. [Migration Strategy](#migration-strategy)
9. [Best Practices](#best-practices)
10. [Examples](#examples)

---

## Overview

### Purpose

This standard defines how applications should handle settings, configuration, and environment variables to ensure:

- **Security**: Secrets are encrypted at rest
- **Flexibility**: Support for multiple environments (dev/prod)
- **Organization**: Clear categorization and metadata
- **Auditability**: Track who changed what and when
- **Maintainability**: Easy to query, update, and manage

### Core Principles

1. **Separation of Concerns**: App settings vs. environment variables
2. **Environment Isolation**: Different values for dev/prod
3. **Security First**: Encrypt secrets, mask in UI
4. **Metadata Rich**: Descriptions, types, validation rules
5. **Audit Trail**: Track all changes
6. **Backward Compatible**: Support migration from simple key-value stores

---

## Schema Design

### Settings Table

**Purpose**: Application-level configuration settings

```sql
CREATE TABLE settings (
  id TEXT PRIMARY KEY,                    -- UUID for each setting instance
  key TEXT NOT NULL,                      -- Setting key (e.g., 'openai_api_key')
  value TEXT,                             -- Setting value (encrypted if is_secret=true)
  environment TEXT NOT NULL DEFAULT 'default', -- 'default' | 'development' | 'production'
  category TEXT,                          -- 'api_keys' | 'url_config' | 'app_config' | 'mcp_env'
  description TEXT,                       -- Human-readable description
  data_type TEXT DEFAULT 'string',        -- 'string' | 'number' | 'boolean' | 'json' | 'url'
  is_secret INTEGER NOT NULL DEFAULT 0,   -- 1 if value should be encrypted
  is_encrypted INTEGER NOT NULL DEFAULT 0, -- 1 if value is currently encrypted
  validation_rules TEXT,                  -- JSON validation rules
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  created_by TEXT,                       -- User/system that created
  updated_by TEXT,                        -- User/system that last updated
  
  UNIQUE(key, environment)                -- One value per key per environment
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_environment ON settings(environment);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_key_env ON settings(key, environment);
```

### Environment Variables Table

**Purpose**: Environment variables for external services (MCP servers, APIs, etc.)

```sql
CREATE TABLE environment_variables (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,                      -- Environment variable name (e.g., 'GHL_API_KEY')
  value TEXT,                             -- Value (encrypted if is_secret=true)
  environment TEXT NOT NULL DEFAULT 'default', -- 'default' | 'development' | 'production'
  description TEXT,                       -- What this variable is used for
  is_secret INTEGER NOT NULL DEFAULT 1,   -- Most env vars are secrets (default: true)
  is_encrypted INTEGER NOT NULL DEFAULT 0, -- 1 if value is currently encrypted
  mcp_server_id TEXT,                     -- Optional: associate with specific MCP server
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  created_by TEXT,
  updated_by TEXT,
  
  FOREIGN KEY (mcp_server_id) REFERENCES mcp_servers(id) ON DELETE SET NULL,
  UNIQUE(key, environment, mcp_server_id)  -- Allow same key for different servers
);

CREATE INDEX idx_env_vars_key ON environment_variables(key);
CREATE INDEX idx_env_vars_environment ON environment_variables(environment);
CREATE INDEX idx_env_vars_mcp_server ON environment_variables(mcp_server_id);
CREATE INDEX idx_env_vars_key_env ON environment_variables(key, environment);
```

### Key Differences

| Feature | Settings | Environment Variables |
|---------|----------|----------------------|
| **Purpose** | App configuration | External service config |
| **Default Secret** | No | Yes |
| **Server Association** | No | Yes (optional) |
| **Categories** | Yes | No |
| **Data Types** | Yes | No |
| **Validation Rules** | Yes | No |

---

## Data Types and Categories

### Data Types

- **`string`**: Plain text (default)
- **`number`**: Numeric values
- **`boolean`**: true/false values
- **`json`**: JSON objects/arrays
- **`url`**: URLs (validated)

### Categories (Settings Only)

- **`api_keys`**: API keys, tokens, secrets
- **`url_config`**: URLs, ports, hostnames
- **`app_config`**: General application settings
- **`mcp_env`**: MCP server related settings

### Environments

- **`default`**: Default/fallback values
- **`development`**: Development environment
- **`production`**: Production environment

---

## Environment Management

### Querying by Environment

```typescript
// Get setting for specific environment
const setting = await db
  .select()
  .from(settings)
  .where(
    and(
      eq(settings.key, 'openai_api_key'),
      eq(settings.environment, 'production')
    )
  )

// Fallback to default if not found
if (!setting) {
  setting = await db
    .select()
    .from(settings)
    .where(
      and(
        eq(settings.key, 'openai_api_key'),
        eq(settings.environment, 'default')
      )
    )
}
```

### Environment Priority

1. **Specific environment** (production, development)
2. **Default environment** (fallback)
3. **Environment variable** (process.env)
4. **Hardcoded default** (last resort)

---

## Security and Encryption

### Encryption Requirements

1. **All secrets must be encrypted** (`is_secret = true` → encrypt)
2. **Use AES-256-GCM** for authenticated encryption
3. **Store encryption metadata** (IV, auth tag) with encrypted value
4. **Never log decrypted secrets**
5. **Mask secrets in UI** (show only last 4 characters)

### Encryption Implementation

```typescript
// Encrypt before storing
if (isSecret) {
  const encrypted = encrypt(plaintext)
  value = serializeEncrypted(encrypted)
  isEncrypted = true
}

// Decrypt when needed
if (isEncrypted) {
  const encryptedData = deserializeEncrypted(value)
  const plaintext = decrypt(encryptedData)
}
```

### Encryption Key Management

- **Store in environment variable**: `ENCRYPTION_KEY`
- **64 hex characters** (32 bytes)
- **Never commit to git**
- **Rotate periodically**
- **Use different keys per environment** (recommended)

### Access Control

- **Authenticate users** before allowing access
- **Log all secret access** (audit trail)
- **Rate limit** secret retrieval
- **Use least privilege** (only necessary access)

---

## API Design Patterns

### GET Settings

```typescript
// GET /api/settings?environment=production&category=api_keys
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const environment = searchParams.get('environment') || 'default'
  const category = searchParams.get('category')
  
  let query = db.select().from(settings)
    .where(eq(settings.environment, environment))
  
  if (category) {
    query = query.where(eq(settings.category, category))
  }
  
  const results = await query
  
  // Mask secrets
  return results.map(setting => ({
    ...setting,
    value: setting.isSecret ? maskSecret(setting.value) : setting.value
  }))
}
```

### POST Settings

```typescript
// POST /api/settings
export async function POST(request: NextRequest) {
  const { key, value, environment, isSecret, category } = await request.json()
  
  // Validate
  if (!key) throw new ValidationError('Key is required')
  
  // Encrypt if secret
  let encryptedValue = value
  let isEncrypted = false
  if (isSecret && value) {
    const encrypted = encrypt(value)
    encryptedValue = serializeEncrypted(encrypted)
    isEncrypted = true
  }
  
  // Upsert
  await db.insert(settings)
    .values({
      id: uuidv4(),
      key,
      value: encryptedValue,
      environment: environment || 'default',
      category,
      isSecret: Boolean(isSecret),
      isEncrypted,
      updatedAt: new Date(),
      updatedBy: getCurrentUser()
    })
    .onConflictDoUpdate({
      target: [settings.key, settings.environment],
      set: {
        value: encryptedValue,
        isEncrypted,
        updatedAt: new Date(),
        updatedBy: getCurrentUser()
      }
    })
}
```

### GET Environment Variables

```typescript
// GET /api/env-vars?environment=production&mcpServerId=ghl
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const environment = searchParams.get('environment') || 'default'
  const mcpServerId = searchParams.get('mcpServerId')
  
  let query = db.select().from(environmentVariables)
    .where(eq(environmentVariables.environment, environment))
  
  if (mcpServerId) {
    query = query.where(eq(environmentVariables.mcpServerId, mcpServerId))
  }
  
  const results = await query
  
  // Mask secrets
  return results.map(envVar => ({
    ...envVar,
    value: envVar.isSecret ? maskSecret(envVar.value) : envVar.value
  }))
}
```

### API Response Format

```typescript
// Success response
{
  success: true,
  data: [...settings],
  message?: string
}

// Error response
{
  success: false,
  error: string,
  details?: any
}
```

---

## UI/UX Patterns

### Settings Page Structure

```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│                                     │
│ ┌─ Environment Selector ─────────┐ │
│ │ [Default ▼] [Dev] [Production] │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌─ API Configuration ────────────┐ │
│ │ OpenAI API Key: [••••••••1234] │ │
│ │ [Show] [Edit]                  │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌─ URL Configuration ────────────┐ │
│ │ Port: [3001]                   │ │
│ │ Base URL: [http://...]         │ │
│ └────────────────────────────────┘ │
│                                     │
│ [Save Settings]                    │
└─────────────────────────────────────┘
```

### Environment Variables Page Structure

```
┌─────────────────────────────────────┐
│ Environment Variables                │
├─────────────────────────────────────┤
│                                     │
│ ┌─ Filter ────────────────────────┐ │
│ │ Environment: [All ▼]            │ │
│ │ MCP Server: [All ▼]             │ │
│ └────────────────────────────────┘ │
│                                     │
│ ┌─ Variable List ─────────────────┐ │
│ │ GHL_API_KEY    [••••••••abcd]  │ │
│ │ OPENAI_KEY     [••••••••1234]   │ │
│ │ [Add Variable]                  │ │
│ └────────────────────────────────┘ │
│                                     │
│ [Save Changes]                     │
└─────────────────────────────────────┘
```

### UI Best Practices

1. **Mask Secrets**: Always show `••••••••` + last 4 chars
2. **Show/Hide Toggle**: Allow viewing full value with confirmation
3. **Environment Selector**: Clear visual indicator of current environment
4. **Validation Feedback**: Real-time validation with clear error messages
5. **Save Indicators**: Show when changes are saved, require restart, etc.
6. **Grouping**: Group by category for better organization
7. **Search/Filter**: Allow filtering by category, environment, etc.

---

## Migration Strategy

### Phase 1: Preparation

1. Create new tables alongside existing
2. Implement encryption utilities
3. Create migration script

### Phase 2: Data Migration

1. Backup existing data
2. Migrate individual settings → `settings` table
3. Migrate JSON env_vars → `environment_variables` table
4. Encrypt secrets during migration
5. Verify data integrity

### Phase 3: Code Updates

1. Update API routes to use new schema
2. Update UI components
3. Add environment switching
4. Add encryption/decryption logic

### Phase 4: Cleanup

1. Remove old table structure
2. Update documentation
3. Remove migration code (after verification)

### Migration Checklist

- [ ] Backup database
- [ ] Create new tables
- [ ] Run migration script
- [ ] Verify data migrated correctly
- [ ] Test encryption/decryption
- [ ] Update API routes
- [ ] Update UI components
- [ ] Test environment switching
- [ ] Update documentation
- [ ] Remove old code

---

## Best Practices

### 1. Naming Conventions

- **Settings keys**: Use snake_case (`openai_api_key`, `base_url`)
- **Environment variables**: Use UPPER_SNAKE_CASE (`GHL_API_KEY`)
- **Categories**: Use lowercase (`api_keys`, `url_config`)

### 2. Secret Management

- ✅ Always encrypt secrets
- ✅ Never log decrypted secrets
- ✅ Mask in UI (show last 4 chars)
- ✅ Rotate encryption keys periodically
- ✅ Use different keys per environment

### 3. Environment Handling

- ✅ Always specify environment in queries
- ✅ Provide fallback to 'default'
- ✅ Clear separation between environments
- ✅ Don't mix dev/prod values

### 4. Validation

- ✅ Validate data types
- ✅ Validate formats (URLs, emails, etc.)
- ✅ Use validation rules JSON for complex validation
- ✅ Provide clear error messages

### 5. Audit Trail

- ✅ Track who created/updated settings
- ✅ Log all secret access
- ✅ Keep updated_at timestamps accurate
- ✅ Consider audit log table for compliance

### 6. Performance

- ✅ Index frequently queried columns
- ✅ Cache decrypted values (in-memory, short TTL)
- ✅ Batch operations when possible
- ✅ Use connection pooling

---

## Examples

### Example 1: Storing API Key

```typescript
// Save OpenAI API key for production
await db.insert(settings).values({
  id: uuidv4(),
  key: 'openai_api_key',
  value: serializeEncrypted(encrypt(apiKey)),
  environment: 'production',
  category: 'api_keys',
  description: 'OpenAI API key for production environment',
  dataType: 'string',
  isSecret: true,
  isEncrypted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  updatedBy: 'user@example.com'
})
```

### Example 2: Storing Environment Variable for MCP Server

```typescript
// Save GHL API key for specific MCP server
await db.insert(environmentVariables).values({
  id: uuidv4(),
  key: 'GHL_API_KEY',
  value: serializeEncrypted(encrypt(apiKey)),
  environment: 'development',
  description: 'GoHighLevel API key for GHL MCP server',
  mcpServerId: 'ghl-server-id',
  isSecret: true,
  isEncrypted: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Example 3: Retrieving Setting with Fallback

```typescript
async function getSetting(key: string, environment: string = 'default'): Promise<string | null> {
  // Try specific environment first
  let setting = await db
    .select()
    .from(settings)
    .where(
      and(
        eq(settings.key, key),
        eq(settings.environment, environment)
      )
    )
    .limit(1)
  
  // Fallback to default
  if (!setting[0] && environment !== 'default') {
    setting = await db
      .select()
      .from(settings)
      .where(
        and(
          eq(settings.key, key),
          eq(settings.environment, 'default')
        )
      )
      .limit(1)
  }
  
  if (!setting[0]) {
    return null
  }
  
  // Decrypt if needed
  if (setting[0].isEncrypted) {
    const encrypted = deserializeEncrypted(setting[0].value!)
    return decrypt(encrypted)
  }
  
  return setting[0].value
}
```

### Example 4: UI Component Pattern

```typescript
// SettingsForm component
function SettingsForm() {
  const [environment, setEnvironment] = useState('default')
  const [settings, setSettings] = useState([])
  
  useEffect(() => {
    loadSettings(environment)
  }, [environment])
  
  const loadSettings = async (env: string) => {
    const res = await fetch(`/api/settings?environment=${env}`)
    const data = await res.json()
    setSettings(data.settings)
  }
  
  return (
    <div>
      <EnvironmentSelector value={environment} onChange={setEnvironment} />
      {settings.map(setting => (
        <SettingField key={setting.id} setting={setting} />
      ))}
    </div>
  )
}
```

---

## Summary

This standard provides a comprehensive approach to handling settings and configuration:

✅ **Secure**: Encryption for secrets, access control  
✅ **Flexible**: Multiple environments, categories, types  
✅ **Organized**: Clear structure, metadata, validation  
✅ **Auditable**: Track changes, who made them  
✅ **Maintainable**: Easy to query, update, migrate  

Follow these patterns to ensure consistent, secure, and maintainable settings management across any application.

---

## Related Documents

- `settings_schema_improvements_v1_0.md` - Detailed schema improvements
- `database_architecture_v1_0.md` - Overall database architecture
- `mcp_config_format_v1_0.md` - MCP server configuration

---

**Last Updated**: November 18, 2025  
**Version**: 1.0  
**Status**: Active Standard

