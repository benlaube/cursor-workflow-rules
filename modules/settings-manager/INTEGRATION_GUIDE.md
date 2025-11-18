# Settings Module Integration Guide

**Created:** November 18, 2025  
**Purpose:** Guide for integrating the reusable settings management module into other projects

---

## Overview

The settings management module provides a complete solution for handling application settings and environment variables with:

- ✅ Environment support (default/dev/prod)
- ✅ Encryption for secrets
- ✅ MCP server association
- ✅ Metadata and validation
- ✅ Audit trail

---

## Quick Start

### Option 1: Copy Module Files (Recommended)

Copy these files to your project:

```
lib/
  ├── settings/
  │   └── settings-manager.ts      # Main settings manager
  ├── security/
  │   └── encryption.ts            # Encryption utilities
  └── db/
      ├── schema.ts                 # Database schema (settings + env_vars tables)
      └── migrate-settings.ts       # Migration script (if needed)
```

### Option 2: Use as NPM Package (Future)

```bash
npm install @your-org/settings-manager
```

---

## Integration Steps

### Step 1: Copy Required Files

Copy the following files to your project:

1. **`lib/settings/settings-manager.ts`** - Main manager classes
2. **`lib/security/encryption.ts`** - Encryption utilities
3. **Database schema** - Add settings and environment_variables tables to your schema

### Step 2: Update Database Schema

Add these tables to your database schema:

```typescript
// Add to your schema file (e.g., lib/db/schema.ts)

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  value: text('value'),
  environment: text('environment').notNull().default('default'),
  category: text('category'),
  description: text('description'),
  dataType: text('data_type').default('string'),
  isSecret: integer('is_secret', { mode: 'boolean' }).notNull().default(false),
  isEncrypted: integer('is_encrypted', { mode: 'boolean' }).notNull().default(false),
  validationRules: text('validation_rules'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  keyEnvUnique: sql`UNIQUE(${table.key}, ${table.environment})`,
}));

export const environmentVariables = sqliteTable('environment_variables', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  value: text('value'),
  environment: text('environment').notNull().default('default'),
  description: text('description'),
  isSecret: integer('is_secret', { mode: 'boolean' }).notNull().default(true),
  isEncrypted: integer('is_encrypted', { mode: 'boolean' }).notNull().default(false),
  mcpServerId: text('mcp_server_id'), // Optional: adjust FK based on your schema
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  keyEnvServerUnique: sql`UNIQUE(${table.key}, ${table.environment}, ${table.mcpServerId})`,
}));
```

### Step 3: Set Encryption Key

Add to your `.env` file:

```bash
ENCRYPTION_KEY=your_64_character_hex_key_here
```

Generate a key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Update Imports

Update imports in `settings-manager.ts` to match your project structure:

```typescript
// Adjust these imports based on your project structure
import { db } from '../db/client'  // Your database client
import { settings, environmentVariables } from '../db/schema'  // Your schema
import { eq, and } from 'drizzle-orm'  // Your ORM
```

### Step 5: Create API Routes

Create API routes using the manager:

```typescript
// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SettingsManager } from '@/lib/settings/settings-manager'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const environment = (searchParams.get('environment') || 'default') as any
  const category = searchParams.get('category') as any

  const settings = await SettingsManager.getSettings(environment, category)
  
  // Mask secrets for API response
  const masked = settings.map(s => ({
    ...s,
    value: SettingsManager.maskSettingValue(s)
  }))

  return NextResponse.json({ settings: masked })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { key, value, environment, isSecret, ...rest } = body

  const setting = await SettingsManager.saveSetting({
    key,
    value,
    environment: environment || 'default',
    isSecret: Boolean(isSecret),
    updatedBy: 'user@example.com', // Get from auth
    ...rest
  })

  return NextResponse.json({ success: true, setting })
}
```

### Step 6: Create UI Components

Use the manager in your React components:

```typescript
// components/SettingsForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { SettingsManager } from '@/lib/settings/settings-manager'

export function SettingsForm() {
  const [environment, setEnvironment] = useState('default')
  const [settings, setSettings] = useState([])

  useEffect(() => {
    loadSettings()
  }, [environment])

  const loadSettings = async () => {
    const res = await fetch(`/api/settings?environment=${environment}`)
    const data = await res.json()
    setSettings(data.settings)
  }

  const handleSave = async (key: string, value: string) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        value,
        environment,
        isSecret: true, // or determine based on key
      })
    })
    loadSettings()
  }

  return (
    <div>
      <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
        <option value="default">Default</option>
        <option value="development">Development</option>
        <option value="production">Production</option>
      </select>
      {/* Render settings form */}
    </div>
  )
}
```

---

## Usage Examples

### Getting a Setting

```typescript
import { SettingsManager } from '@/lib/settings/settings-manager'

// Get setting value (decrypted if secret)
const apiKey = await SettingsManager.getSettingValue('openai_api_key', 'production')

// Get full setting object
const setting = await SettingsManager.getSetting('openai_api_key', 'production', true)
```

### Saving a Setting

```typescript
await SettingsManager.saveSetting({
  key: 'openai_api_key',
  value: 'sk-...',
  environment: 'production',
  category: 'api_keys',
  description: 'OpenAI API key for production',
  isSecret: true,
  updatedBy: 'user@example.com'
})
```

### Environment Variables

```typescript
import { EnvironmentVariablesManager } from '@/lib/settings/settings-manager'

// Save env var for MCP server
await EnvironmentVariablesManager.saveVariable({
  key: 'GHL_API_KEY',
  value: 'secret-key',
  environment: 'development',
  mcpServerId: 'ghl-server-id',
  description: 'GoHighLevel API key'
})

// Get all env vars as object (for process.env)
const envVars = await EnvironmentVariablesManager.getVariablesAsObject('development', 'ghl-server-id')
```

---

## Customization

### Adjusting for Different ORMs

If using a different ORM (Prisma, TypeORM, etc.), update the query methods:

```typescript
// Example for Prisma
static async getSetting(key: string, environment: string) {
  return await prisma.settings.findFirst({
    where: {
      key,
      environment
    }
  })
}
```

### Adjusting for Different Databases

The schema uses SQLite syntax. For PostgreSQL/MySQL:

```sql
-- PostgreSQL example
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL,
  value TEXT,
  environment VARCHAR(50) NOT NULL DEFAULT 'default',
  -- ... rest of columns
  UNIQUE(key, environment)
);
```

### Removing MCP Server Association

If you don't need MCP server association:

1. Remove `mcpServerId` from `environmentVariables` table
2. Update unique constraint to `UNIQUE(key, environment)`
3. Remove `mcpServerId` parameters from `EnvironmentVariablesManager` methods

---

## Migration from Existing Systems

### From Simple Key-Value Store

```typescript
// Old way
const apiKey = await db.get('SELECT value FROM settings WHERE key = ?', ['openai_api_key'])

// New way
const apiKey = await SettingsManager.getSettingValue('openai_api_key')
```

### From Environment Variables Only

```typescript
// Old way
const apiKey = process.env.OPENAI_API_KEY

// New way
const apiKey = await SettingsManager.getSettingValue('openai_api_key', 'production')
// Falls back to process.env if not in database
```

---

## Testing

Create test utilities:

```typescript
// lib/settings/__tests__/settings-manager.test.ts
import { SettingsManager } from '../settings-manager'

describe('SettingsManager', () => {
  it('should save and retrieve a setting', async () => {
    await SettingsManager.saveSetting({
      key: 'test_key',
      value: 'test_value',
      environment: 'default'
    })

    const value = await SettingsManager.getSettingValue('test_key')
    expect(value).toBe('test_value')
  })

  it('should encrypt secrets', async () => {
    await SettingsManager.saveSetting({
      key: 'secret_key',
      value: 'secret_value',
      isSecret: true
    })

    const setting = await SettingsManager.getSetting('secret_key', 'default', false)
    expect(setting?.isEncrypted).toBe(true)
    expect(setting?.value).not.toBe('secret_value')
  })
})
```

---

## Best Practices

1. **Always use environment parameter** - Don't hardcode 'default'
2. **Encrypt secrets** - Set `isSecret: true` for sensitive data
3. **Use categories** - Organize settings by category
4. **Provide descriptions** - Help users understand what each setting does
5. **Track updates** - Set `updatedBy` to track who made changes
6. **Handle errors** - Wrap in try/catch for production code
7. **Cache decrypted values** - Don't decrypt on every request

---

## Troubleshooting

### Encryption Key Not Set

```
Error: ENCRYPTION_KEY must be 64 hex characters
```

**Solution**: Set `ENCRYPTION_KEY` in `.env` file

### Migration Issues

If migration fails, check:
- Database permissions
- Table already exists
- Foreign key constraints

### Type Errors

If TypeScript errors occur:
- Check import paths match your project structure
- Ensure schema types are exported
- Update type imports in settings-manager.ts

---

## Summary

The settings module is designed to be:

✅ **Portable** - Copy files and adjust imports  
✅ **Flexible** - Works with different ORMs/databases  
✅ **Secure** - Built-in encryption  
✅ **Complete** - Includes API patterns and examples  

Follow the integration steps above to add settings management to any project!

---

**Related Documents:**
- `settings_schema_handling_standard_v1_0.md` - Complete standard documentation
- `settings_schema_improvements_v1_0.md` - Schema design details

