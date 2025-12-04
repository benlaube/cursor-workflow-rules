# Settings Management Module

## Metadata

- **Module:** settings-manager
- **Version:** 1.0.0
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Description:** A reusable settings and environment variables management module with encryption support, environment separation, and MCP server association

## What It Does

This module provides a complete solution for managing application settings and environment variables in your database with:

- **Environment Separation** - Different settings for default, development, and production environments
- **Encryption** - AES-256-GCM encryption for sensitive values (API keys, secrets)
- **MCP Server Association** - Link environment variables to MCP (Model Context Protocol) servers
- **Automatic Masking** - Automatically mask secrets in UI displays
- **Type Safety** - Full TypeScript support with validation
- **Migration Support** - Tools for upgrading from old schema versions

The module is designed to work with Supabase (PostgreSQL) and integrates with the `logger-module` for audit trails.

## Features

- ✅ **Environment Support** - Separate settings for default/dev/prod environments
- ✅ **Encryption** - AES-256-GCM encryption for secrets
- ✅ **MCP Server Association** - Link env vars to MCP servers
- ✅ **Automatic Masking** - Mask secrets in UI automatically
- ✅ **Migration Support** - Upgrade from old schema versions
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Validation** - Data type validation (string, number, boolean, json, url)

## Installation

### 1. Copy the Module

Copy these files to your project:

```bash
cp modules/settings-manager/settings-manager.ts /path/to/your/project/lib/settings/
cp modules/settings-manager/encryption.ts /path/to/your/project/lib/security/
cp modules/settings-manager/schema-example.ts /path/to/your/project/lib/db/
```

### 2. Add Database Schema

Add the schema tables to your database. See `schema-example.ts` for the complete schema definition.

**Required Tables:**

- `settings` - Application settings with environment support
- `environment_variables` - Environment variables with MCP association

### 3. Set Encryption Key

Set the encryption key in your `.env` file:

```bash
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

**Important:** Generate a secure random key:

```bash
# Generate a secure key
openssl rand -hex 32
```

### 4. Update Imports

Update import paths in `settings-manager.ts` to match your project structure:

```typescript
// Update these imports
import { db } from '../db/client'; // Your database client
import { settings, environmentVariables } from '../db/schema'; // Your schema
```

## Quick Start

### 1. Initialize Settings Manager

```typescript
import { SettingsManager, EnvironmentVariablesManager } from '@/lib/settings/settings-manager';

// Settings Manager is static - no initialization needed
```

### 2. Create a Setting

```typescript
await SettingsManager.createSetting({
  key: 'api_timeout',
  value: '5000',
  environment: 'production',
  category: 'api_keys',
  description: 'API request timeout in milliseconds',
  dataType: 'number',
  isSecret: false,
});
```

### 3. Get a Setting

```typescript
// Get setting (tries specific environment, falls back to default)
const setting = await SettingsManager.getSetting('api_timeout', 'production');

if (setting) {
  console.log(setting.value); // '5000'
}

// Get and decrypt a secret
const secret = await SettingsManager.getSetting(
  'api_key',
  'production',
  true // decryptValue = true
);
```

### 4. Create Environment Variable

```typescript
await EnvironmentVariablesManager.createEnvVar({
  key: 'OPENAI_API_KEY',
  value: 'sk-...',
  environment: 'production',
  description: 'OpenAI API key for AI features',
  mcpServerId: 'mcp-server-123',
});
```

## Usage

### Settings Manager

#### Get Setting

```typescript
// Get setting with environment fallback
const setting = await SettingsManager.getSetting(
  'api_timeout',
  'production' // Tries 'production', falls back to 'default'
);

// Get and decrypt secret
const secret = await SettingsManager.getSetting(
  'api_key',
  'production',
  true // decryptValue
);
```

#### Create Setting

```typescript
await SettingsManager.createSetting({
  key: 'max_upload_size',
  value: '10485760', // 10MB in bytes
  environment: 'production',
  category: 'app_config',
  description: 'Maximum file upload size',
  dataType: 'number',
  isSecret: false,
  validationRules: {
    min: 0,
    max: 100000000, // 100MB
  },
});
```

#### Update Setting

```typescript
await SettingsManager.updateSetting('api_timeout', 'production', {
  value: '10000',
  updatedBy: 'user-123',
});
```

#### Delete Setting

```typescript
await SettingsManager.deleteSetting('api_timeout', 'production');
```

### Environment Variables Manager

#### Get Environment Variable

```typescript
const envVar = await EnvironmentVariablesManager.getEnvVar('OPENAI_API_KEY', 'production');
```

#### Create Environment Variable

```typescript
await EnvironmentVariablesManager.createEnvVar({
  key: 'DATABASE_URL',
  value: 'postgresql://...',
  environment: 'production',
  description: 'Database connection string',
  mcpServerId: null, // Not associated with MCP server
});
```

#### Update Environment Variable

```typescript
await EnvironmentVariablesManager.updateEnvVar('OPENAI_API_KEY', 'production', {
  value: 'sk-new-key',
  updatedBy: 'user-123',
});
```

### Encryption

The module automatically encrypts values when `isSecret: true`:

```typescript
// Create encrypted setting
await SettingsManager.createSetting({
  key: 'secret_api_key',
  value: 'my-secret-key',
  isSecret: true, // Will be encrypted automatically
  environment: 'production',
});

// Get and decrypt
const setting = await SettingsManager.getSetting(
  'secret_api_key',
  'production',
  true // decryptValue = true
);
console.log(setting.value); // 'my-secret-key' (decrypted)
```

### Masking

Secrets are automatically masked in UI:

```typescript
const setting = await SettingsManager.getSetting('api_key', 'production');

// For UI display (masked)
const displayValue = SettingsManager.maskSecret(setting.value);
console.log(displayValue); // 'sk-***...***xyz'

// For actual use (decrypted)
const actualValue = await SettingsManager.getSetting('api_key', 'production', true);
```

## Integration

### With Backend API Module

Use in Next.js API routes:

```typescript
import { createApiHandler } from '@/lib/backend-api';
import { SettingsManager } from '@/lib/settings/settings-manager';

export const GET = createApiHandler({
  requireAuth: true,
  handler: async ({ ctx }) => {
    // Get setting for current environment
    const timeout = await SettingsManager.getSetting(
      'api_timeout',
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    );

    return { timeout: timeout?.value || '5000' };
  },
});
```

### With Logger Module

Log setting changes:

```typescript
import { setupLogger } from '@/modules/logger-module';
import { SettingsManager } from '@/lib/settings/settings-manager';

const logger = setupLogger('settings', { env: 'production' });

await SettingsManager.updateSetting('api_timeout', 'production', {
  value: '10000',
  updatedBy: ctx.auth.user.id,
});

logger.info('Setting updated', {
  key: 'api_timeout',
  environment: 'production',
  updatedBy: ctx.auth.user.id,
});
```

### With Supabase

The module works with Supabase (PostgreSQL). Ensure your database schema matches `schema-example.ts`.

## API Reference

### SettingsManager

**Static Methods:**

- `getSetting(key, environment, decryptValue?)` - Get setting with fallback
- `createSetting(input)` - Create new setting
- `updateSetting(key, environment, updates)` - Update existing setting
- `deleteSetting(key, environment)` - Delete setting
- `listSettings(environment, category?)` - List all settings
- `maskSecret(value)` - Mask secret for UI display

### EnvironmentVariablesManager

**Static Methods:**

- `getEnvVar(key, environment)` - Get environment variable
- `createEnvVar(input)` - Create new environment variable
- `updateEnvVar(key, environment, updates)` - Update environment variable
- `deleteEnvVar(key, environment)` - Delete environment variable
- `listEnvVars(environment, mcpServerId?)` - List environment variables

## Related Documentation

- **`INTEGRATION_GUIDE.md`** - Complete step-by-step integration guide
- **`QUICK_REFERENCE.md`** - Quick reference for common operations
- **`schema-example.ts`** - Database schema definitions
- **`migrate-settings.ts`** - Migration script for upgrading schemas
- `modules/logger-module/` - Logging for audit trails
- `standards/database/schema.md` - Database schema standards

## Possible Enhancements

### Short-term Improvements

- **Setting Validation** - Runtime validation based on `validationRules`
- **Setting History** - Track changes to settings over time
- **Bulk Operations** - Create/update/delete multiple settings at once
- **Setting Templates** - Pre-defined setting templates for common use cases
- **Import/Export** - Export settings to JSON, import from file
- **Setting Dependencies** - Define dependencies between settings
- **Default Values** - Set default values for missing settings

### Medium-term Enhancements

- **Setting Groups** - Group related settings together
- **Setting Permissions** - Role-based access control for settings
- **Setting Notifications** - Notify when critical settings change
- **Setting Validation Rules** - More complex validation (regex, ranges, etc.)
- **Setting Search** - Full-text search across settings
- **Setting Tags** - Tag settings for better organization
- **Setting Documentation** - Rich documentation for each setting
- **Setting UI** - Web interface for managing settings

### Long-term Enhancements

- **Setting Versioning** - Full version control for settings
- **Setting Rollback** - Rollback to previous setting values
- **Setting Analytics** - Track setting usage and changes
- **Setting Recommendations** - AI-powered setting recommendations
- **Setting Templates Marketplace** - Share and discover setting templates
- **Multi-tenant Support** - Tenant-specific settings
- **Setting Sync** - Sync settings across environments
- **Setting Monitoring** - Monitor setting values and alert on changes
- **API Rate Limiting** - Built-in rate limiting for setting APIs
