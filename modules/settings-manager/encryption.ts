/**
 * Encryption utilities for securing sensitive settings and environment variables
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16

/**
 * Get encryption key from environment or generate one
 * In production, ENCRYPTION_KEY should be set as a secure environment variable
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    console.warn('⚠️  ENCRYPTION_KEY not set. Using generated key (not persistent across restarts).')
    // Generate a key for development (not secure for production)
    return crypto.randomBytes(32)
  }
  
  // Key should be 64 hex characters (32 bytes)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  
  return Buffer.from(key, 'hex')
}

export interface EncryptedValue {
  encrypted: string
  iv: string
  authTag: string
}

/**
 * Encrypt a plaintext value
 * Returns encrypted data with IV and auth tag for authenticated decryption
 */
export function encrypt(plaintext: string): EncryptedValue {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty value')
  }
  
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  }
}

/**
 * Decrypt an encrypted value
 * Requires the encrypted data, IV, and auth tag
 */
export function decrypt(encryptedData: EncryptedValue): string {
  if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
    throw new Error('Invalid encrypted data format')
  }
  
  const key = getEncryptionKey()
  const iv = Buffer.from(encryptedData.iv, 'hex')
  const authTag = Buffer.from(encryptedData.authTag, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Serialize encrypted value to JSON string for database storage
 */
export function serializeEncrypted(encryptedData: EncryptedValue): string {
  return JSON.stringify(encryptedData)
}

/**
 * Deserialize encrypted value from JSON string
 */
export function deserializeEncrypted(jsonString: string): EncryptedValue {
  try {
    return JSON.parse(jsonString) as EncryptedValue
  } catch (error) {
    throw new Error('Invalid encrypted value format')
  }
}

/**
 * Check if a value appears to be encrypted (has encrypted structure)
 */
export function isEncryptedFormat(value: string): boolean {
  try {
    const parsed = JSON.parse(value)
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      'encrypted' in parsed &&
      'iv' in parsed &&
      'authTag' in parsed
    )
  } catch {
    return false
  }
}

/**
 * Mask a secret value for display (shows last 4 characters)
 */
export function maskSecret(value: string, showLast: number = 4): string {
  if (!value || value.length <= showLast) {
    return '••••••••'
  }
  return '••••••••' + value.slice(-showLast)
}

