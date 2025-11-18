# Settings Module Quick Reference

**Quick guide for copying the settings module to other projects**

---

## Files to Copy

Copy these files to your project:

```
lib/
  ├── settings/
  │   └── settings-manager.ts      # Main manager classes
  ├── security/
  │   └── encryption.ts            # Encryption utilities
  └── db/
      ├── schema.ts                # Add settings/env_vars tables
      └── migrate-settings.ts      # Migration (if needed)
```

---

## Quick Setup

### 1. Copy Files

```bash
# Copy settings manager
cp lib/settings/settings-manager.ts /path/to/other/project/lib/settings/

# Copy encryption
cp lib/security/encryption.ts /path/to/other/project/lib/security/

# Copy migration script (if needed)
cp lib/db/migrate-settings.ts /path/to/other/project/lib/db/
```

### 2. Update Imports

In `settings-manager.ts`, update imports to match your project:

```typescript
// Change these lines:
import { db } from '../db/client'           // Your DB client path
import { settings, environmentVariables } from '../db/schema'  // Your schema path
```

### 3. Add Schema Tables

Add to your `schema.ts`:

```typescript
export const settings = sqliteTable('settings', { /* ... */ })
export const environmentVariables = sqliteTable('environment_variables', { /* ... */ })
```

### 4. Set Encryption Key

Add to `.env`:

```bash
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 5. Use in Code

```typescript
import { SettingsManager } from '@/lib/settings/settings-manager'

// Get setting
const apiKey = await SettingsManager.getSettingValue('openai_api_key', 'production')

// Save setting
await SettingsManager.saveSetting({
  key: 'openai_api_key',
  value: 'sk-...',
  environment: 'production',
  isSecret: true
})
```

---

## API Route Example

```typescript
// app/api/settings/route.ts
import { SettingsManager } from '@/lib/settings/settings-manager'

export async function GET(request: NextRequest) {
  const env = request.nextUrl.searchParams.get('environment') || 'default'
  const settings = await SettingsManager.getSettings(env)
  return NextResponse.json({ 
    settings: settings.map(s => ({
      ...s,
      value: SettingsManager.maskSettingValue(s)
    }))
  })
}

export async function POST(request: NextRequest) {
  const { key, value, environment, isSecret } = await request.json()
  await SettingsManager.saveSetting({ key, value, environment, isSecret })
  return NextResponse.json({ success: true })
}
```

---

## Key Features

✅ Environment support (default/dev/prod)  
✅ Encryption for secrets  
✅ MCP server association  
✅ Automatic masking in UI  
✅ Fallback to process.env  

---

**Full Documentation**: See `settings_module_integration_guide.md`

