/**
 * Migration script to migrate from old settings schema to new enhanced schema
 * Migrates existing settings and environment variables to new structure
 */

import { db, sqlite } from './client'
import { settings, environmentVariables } from './schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { encrypt, serializeEncrypted } from '../security/encryption'

/**
 * Check if old settings table exists (has 'key' as primary key without 'id')
 */
async function hasOldSettingsTable(): Promise<boolean> {
  try {
    const result = await sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='settings'
    `).get() as { name: string } | undefined

    if (!result) return false

    // Check if table has old structure (key as primary key, no id column)
    const tableInfo = await sqlite.prepare(`
      PRAGMA table_info(settings)
    `).all() as Array<{ name: string; pk: number }>

    const hasId = tableInfo.some(col => col.name === 'id' && col.pk === 1)
    const hasKeyAsPk = tableInfo.some(col => col.name === 'key' && col.pk === 1)

    return hasKeyAsPk && !hasId
  } catch {
    return false
  }
}

/**
 * Migrate old settings to new schema
 */
export async function migrateSettingsSchema(): Promise<void> {
  try {
    const hasOldSchema = await hasOldSettingsTable()

    if (!hasOldSchema) {
      console.log('✅ Settings schema is already up to date')
      return
    }

    console.log('🔄 Migrating settings schema...')

    // Step 1: Create temporary table with old data
    await sqlite.exec(`
      CREATE TABLE IF NOT EXISTS settings_old_backup AS 
      SELECT * FROM settings
    `)

    // Step 2: Drop old table
    await sqlite.exec(`DROP TABLE IF EXISTS settings`)

    // Step 3: Recreate with new schema (will be done by initializeDatabase)
    // But we need to create it manually here for migration
    await sqlite.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL,
        value TEXT,
        environment TEXT NOT NULL DEFAULT 'default',
        category TEXT,
        description TEXT,
        data_type TEXT DEFAULT 'string',
        is_secret INTEGER NOT NULL DEFAULT 0,
        is_encrypted INTEGER NOT NULL DEFAULT 0,
        validation_rules TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        created_by TEXT,
        updated_by TEXT,
        UNIQUE(key, environment)
      )
    `)

    // Step 4: Migrate old settings data
    const oldSettings = await sqlite.prepare(`
      SELECT key, value, updated_at FROM settings_old_backup
    `).all() as Array<{ key: string; value: string; updated_at: number }>

    for (const oldSetting of oldSettings) {
      // Skip the env_vars key - we'll migrate that separately
      if (oldSetting.key === 'env_vars') {
        continue
      }

      // Determine category and if it's a secret
      const category = categorizeKey(oldSetting.key)
      const isSecret = isSecretKey(oldSetting.key)
      let value = oldSetting.value
      let isEncrypted = false

      // Encrypt if it's a secret
      if (isSecret && value) {
        try {
          const encrypted = encrypt(value)
          value = serializeEncrypted(encrypted)
          isEncrypted = true
        } catch (error) {
          console.warn(`Failed to encrypt ${oldSetting.key}, storing as plain text:`, error)
        }
      }

      await db.insert(settings).values({
        id: uuidv4(),
        key: oldSetting.key,
        value,
        environment: 'default',
        category,
        dataType: inferDataType(oldSetting.value),
        isSecret,
        isEncrypted,
        createdAt: new Date(oldSetting.updated_at),
        updatedAt: new Date(oldSetting.updated_at),
      })
    }

    // Step 5: Migrate environment variables
    const envVarsRow = oldSettings.find(s => s.key === 'env_vars')
    if (envVarsRow) {
      try {
        const envVars = JSON.parse(envVarsRow.value) as Array<{ key: string; value: string }>

        for (const envVar of envVars) {
          let value = envVar.value
          let isEncrypted = false

          // Encrypt secrets
          if (value) {
            try {
              const encrypted = encrypt(value)
              value = serializeEncrypted(encrypted)
              isEncrypted = true
            } catch (error) {
              console.warn(`Failed to encrypt ${envVar.key}, storing as plain text:`, error)
            }
          }

          await db.insert(environmentVariables).values({
            id: uuidv4(),
            key: envVar.key,
            value,
            environment: 'default',
            isSecret: true,
            isEncrypted,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      } catch (error) {
        console.error('Failed to migrate environment variables:', error)
      }
    }

    // Step 6: Create indexes
    await sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
      CREATE INDEX IF NOT EXISTS idx_settings_environment ON settings(environment);
      CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
      CREATE INDEX IF NOT EXISTS idx_settings_key_env ON settings(key, environment);
      CREATE INDEX IF NOT EXISTS idx_env_vars_key ON environment_variables(key);
      CREATE INDEX IF NOT EXISTS idx_env_vars_environment ON environment_variables(environment);
      CREATE INDEX IF NOT EXISTS idx_env_vars_mcp_server ON environment_variables(mcp_server_id);
      CREATE INDEX IF NOT EXISTS idx_env_vars_key_env ON environment_variables(key, environment);
    `)

    // Step 7: Drop backup table
    await sqlite.exec(`DROP TABLE IF EXISTS settings_old_backup`)

    console.log('✅ Settings migration completed successfully')
  } catch (error) {
    console.error('❌ Settings migration failed:', error)
    throw error
  }
}

/**
 * Categorize a setting key
 */
function categorizeKey(key: string): string {
  if (key.includes('api_key') || key.includes('token') || key.includes('secret')) {
    return 'api_keys'
  }
  if (key.includes('url') || key.includes('port') || key.includes('host')) {
    return 'url_config'
  }
  if (key.includes('mcp') || key.includes('server')) {
    return 'mcp_env'
  }
  return 'app_config'
}

/**
 * Check if a key represents a secret
 */
function isSecretKey(key: string): boolean {
  const secretKeywords = ['api_key', 'token', 'secret', 'password', 'credential']
  return secretKeywords.some(keyword => key.toLowerCase().includes(keyword))
}

/**
 * Infer data type from value
 */
function inferDataType(value: string): string {
  if (value === 'true' || value === 'false') {
    return 'boolean'
  }
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return 'number'
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return 'url'
  }
  try {
    JSON.parse(value)
    return 'json'
  } catch {
    return 'string'
  }
}

