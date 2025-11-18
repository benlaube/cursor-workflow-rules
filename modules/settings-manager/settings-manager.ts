/**
 * Settings Manager - Reusable settings management module
 * Can be easily copied to other projects
 * 
 * Provides:
 * - Settings CRUD operations
 * - Environment support (default/dev/prod)
 * - Encryption/decryption for secrets
 * - Masking for UI display
 */

import { db } from '../db/client'
import { settings, environmentVariables, type Setting, type NewSetting, type EnvironmentVariable, type NewEnvironmentVariable } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { encrypt, decrypt, serializeEncrypted, deserializeEncrypted, maskSecret, isEncryptedFormat } from '../security/encryption'

export type Environment = 'default' | 'development' | 'production'
export type SettingCategory = 'api_keys' | 'url_config' | 'app_config' | 'mcp_env'
export type DataType = 'string' | 'number' | 'boolean' | 'json' | 'url'

export interface SettingInput {
  key: string
  value: string
  environment?: Environment
  category?: SettingCategory
  description?: string
  dataType?: DataType
  isSecret?: boolean
  validationRules?: Record<string, any>
  updatedBy?: string
}

export interface EnvironmentVariableInput {
  key: string
  value: string
  environment?: Environment
  description?: string
  mcpServerId?: string | null
  updatedBy?: string
}

/**
 * Settings Manager Class
 * Provides methods for managing application settings
 */
export class SettingsManager {
  /**
   * Get a setting value
   * Tries specific environment first, then falls back to 'default'
   */
  static async getSetting(
    key: string,
    environment: Environment = 'default',
    decryptValue: boolean = false
  ): Promise<Setting | null> {
    // Try specific environment first
    let result = await db
      .select()
      .from(settings)
      .where(
        and(
          eq(settings.key, key),
          eq(settings.environment, environment)
        )
      )
      .limit(1)

    // Fallback to default if not found
    if (result.length === 0 && environment !== 'default') {
      result = await db
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

    if (result.length === 0) {
      return null
    }

    const setting = result[0]

    // Decrypt if requested and encrypted
    if (decryptValue && setting.isEncrypted && setting.value) {
      try {
        const encrypted = deserializeEncrypted(setting.value)
        return {
          ...setting,
          value: decrypt(encrypted),
        }
      } catch (error) {
        console.error(`Failed to decrypt setting ${key}:`, error)
        return setting
      }
    }

    return setting
  }

  /**
   * Get setting value (decrypted if secret)
   * Returns just the value string
   */
  static async getSettingValue(
    key: string,
    environment: Environment = 'default'
  ): Promise<string | null> {
    const setting = await this.getSetting(key, environment, true)
    return setting?.value || null
  }

  /**
   * Get all settings for an environment
   */
  static async getSettings(
    environment: Environment = 'default',
    category?: SettingCategory
  ): Promise<Setting[]> {
    let query = db
      .select()
      .from(settings)
      .where(eq(settings.environment, environment))

    if (category) {
      query = query.where(eq(settings.category, category)) as any
    }

    return await query
  }

  /**
   * Save or update a setting
   */
  static async saveSetting(input: SettingInput): Promise<Setting> {
    const {
      key,
      value,
      environment = 'default',
      category,
      description,
      dataType = 'string',
      isSecret = false,
      validationRules,
      updatedBy,
    } = input

    // Encrypt if secret
    let encryptedValue = value
    let isEncrypted = false
    if (isSecret && value) {
      try {
        const encrypted = encrypt(value)
        encryptedValue = serializeEncrypted(encrypted)
        isEncrypted = true
      } catch (error) {
        console.error(`Failed to encrypt setting ${key}:`, error)
        // Continue with plain text if encryption fails
      }
    }

    // Check if exists
    const existing = await db
      .select()
      .from(settings)
      .where(
        and(
          eq(settings.key, key),
          eq(settings.environment, environment)
        )
      )
      .limit(1)

    const now = new Date()
    const settingData: NewSetting = {
      id: existing[0]?.id || uuidv4(),
      key,
      value: encryptedValue,
      environment,
      category: category || null,
      description: description || null,
      dataType,
      isSecret,
      isEncrypted,
      validationRules: validationRules ? JSON.stringify(validationRules) : null,
      createdAt: existing[0]?.createdAt || now,
      updatedAt: now,
      createdBy: existing[0]?.createdBy || updatedBy || null,
      updatedBy: updatedBy || null,
    }

    if (existing.length > 0) {
      // Update
      await db
        .update(settings)
        .set(settingData)
        .where(
          and(
            eq(settings.key, key),
            eq(settings.environment, environment)
          )
        )
    } else {
      // Insert
      await db.insert(settings).values(settingData)
    }

    // Return the saved setting
    const saved = await this.getSetting(key, environment, isSecret)
    return saved!
  }

  /**
   * Delete a setting
   */
  static async deleteSetting(
    key: string,
    environment: Environment = 'default'
  ): Promise<boolean> {
    const result = await db
      .delete(settings)
      .where(
        and(
          eq(settings.key, key),
          eq(settings.environment, environment)
        )
      )

    return true
  }

  /**
   * Mask setting value for UI display
   */
  static maskSettingValue(setting: Setting): string {
    if (!setting.value) return ''
    if (setting.isSecret) {
      return maskSecret(setting.value)
    }
    return setting.value
  }
}

/**
 * Environment Variables Manager Class
 * Provides methods for managing environment variables
 */
export class EnvironmentVariablesManager {
  /**
   * Get an environment variable
   */
  static async getVariable(
    key: string,
    environment: Environment = 'default',
    mcpServerId?: string | null,
    decryptValue: boolean = false
  ): Promise<EnvironmentVariable | null> {
    let query = db
      .select()
      .from(environmentVariables)
      .where(
        and(
          eq(environmentVariables.key, key),
          eq(environmentVariables.environment, environment)
        )
      )

    if (mcpServerId !== undefined) {
      query = query.where(eq(environmentVariables.mcpServerId, mcpServerId)) as any
    } else {
      query = query.where(eq(environmentVariables.mcpServerId, null)) as any
    }

    const result = await query.limit(1)

    if (result.length === 0) {
      return null
    }

    const envVar = result[0]

    // Decrypt if requested and encrypted
    if (decryptValue && envVar.isEncrypted && envVar.value) {
      try {
        const encrypted = deserializeEncrypted(envVar.value)
        return {
          ...envVar,
          value: decrypt(encrypted),
        }
      } catch (error) {
        console.error(`Failed to decrypt env var ${key}:`, error)
        return envVar
      }
    }

    return envVar
  }

  /**
   * Get all environment variables
   */
  static async getVariables(
    environment: Environment = 'default',
    mcpServerId?: string | null
  ): Promise<EnvironmentVariable[]> {
    let query = db
      .select()
      .from(environmentVariables)
      .where(eq(environmentVariables.environment, environment))

    if (mcpServerId !== undefined) {
      query = query.where(eq(environmentVariables.mcpServerId, mcpServerId)) as any
    }

    return await query
  }

  /**
   * Save or update an environment variable
   */
  static async saveVariable(input: EnvironmentVariableInput): Promise<EnvironmentVariable> {
    const {
      key,
      value,
      environment = 'default',
      description,
      mcpServerId = null,
      updatedBy,
    } = input

    // Encrypt (env vars are secrets by default)
    let encryptedValue = value
    let isEncrypted = false
    if (value) {
      try {
        const encrypted = encrypt(value)
        encryptedValue = serializeEncrypted(encrypted)
        isEncrypted = true
      } catch (error) {
        console.error(`Failed to encrypt env var ${key}:`, error)
      }
    }

    // Check if exists
    const existing = await db
      .select()
      .from(environmentVariables)
      .where(
        and(
          eq(environmentVariables.key, key),
          eq(environmentVariables.environment, environment),
          mcpServerId !== null
            ? eq(environmentVariables.mcpServerId, mcpServerId)
            : eq(environmentVariables.mcpServerId, null)
        )
      )
      .limit(1)

    const now = new Date()
    const varData: NewEnvironmentVariable = {
      id: existing[0]?.id || uuidv4(),
      key,
      value: encryptedValue,
      environment,
      description: description || null,
      isSecret: true,
      isEncrypted,
      mcpServerId,
      createdAt: existing[0]?.createdAt || now,
      updatedAt: now,
      createdBy: existing[0]?.createdBy || updatedBy || null,
      updatedBy: updatedBy || null,
    }

    if (existing.length > 0) {
      // Update
      await db
        .update(environmentVariables)
        .set(varData)
        .where(
          and(
            eq(environmentVariables.key, key),
            eq(environmentVariables.environment, environment),
            mcpServerId !== null
              ? eq(environmentVariables.mcpServerId, mcpServerId)
              : eq(environmentVariables.mcpServerId, null)
          )
        )
    } else {
      // Insert
      await db.insert(environmentVariables).values(varData)
    }

    // Return the saved variable
    const saved = await this.getVariable(key, environment, mcpServerId, true)
    return saved!
  }

  /**
   * Delete an environment variable
   */
  static async deleteVariable(
    key: string,
    environment: Environment = 'default',
    mcpServerId?: string | null
  ): Promise<boolean> {
    await db
      .delete(environmentVariables)
      .where(
        and(
          eq(environmentVariables.key, key),
          eq(environmentVariables.environment, environment),
          mcpServerId !== null
            ? eq(environmentVariables.mcpServerId, mcpServerId)
            : eq(environmentVariables.mcpServerId, null)
        )
      )

    return true
  }

  /**
   * Mask variable value for UI display
   */
  static maskVariableValue(envVar: EnvironmentVariable): string {
    if (!envVar.value) return ''
    if (envVar.isSecret) {
      return maskSecret(envVar.value)
    }
    return envVar.value
  }

  /**
   * Get all variables as a key-value object (for process.env usage)
   */
  static async getVariablesAsObject(
    environment: Environment = 'default',
    mcpServerId?: string | null
  ): Promise<Record<string, string>> {
    const variables = await this.getVariables(environment, mcpServerId)
    const result: Record<string, string> = {}

    for (const envVar of variables) {
      if (envVar.isEncrypted && envVar.value) {
        try {
          const encrypted = deserializeEncrypted(envVar.value)
          result[envVar.key] = decrypt(encrypted)
        } catch (error) {
          console.error(`Failed to decrypt ${envVar.key}:`, error)
        }
      } else {
        result[envVar.key] = envVar.value || ''
      }
    }

    return result
  }
}

