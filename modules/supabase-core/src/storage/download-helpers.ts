/**
 * Storage Download Helpers
 * 
 * Utilities for downloading files from Supabase Storage.
 * 
 * Dependencies: @supabase/supabase-js
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Download configuration.
 */
export interface DownloadConfig {
  /** Bucket name */
  bucket: string
  /** File path in bucket */
  path: string
  /** Optional transformation options */
  transform?: {
    width?: number
    height?: number
    resize?: 'cover' | 'contain' | 'fill'
    quality?: number
  }
}

/**
 * Download result.
 */
export interface DownloadResult {
  /** File data as Blob */
  data: Blob
  /** Content type */
  contentType: string
  /** File size in bytes */
  size: number
}

/**
 * Downloads a file from Supabase Storage.
 * 
 * @param supabase - Supabase client instance
 * @param config - Download configuration
 * @returns File data as Blob
 * 
 * @example
 * ```typescript
 * const { data, contentType } = await downloadFile(supabase, {
 *   bucket: 'user-uploads',
 *   path: 'avatars/user-123.jpg',
 * })
 * ```
 */
export async function downloadFile(
  supabase: SupabaseClient<Database>,
  config: DownloadConfig
): Promise<DownloadResult> {
  let url = `${supabase.storage.from(config.bucket).getPublicUrl(config.path).data.publicUrl}`

  // Apply image transformations if provided
  if (config.transform) {
    const params = new URLSearchParams()
    if (config.transform.width) params.set('width', String(config.transform.width))
    if (config.transform.height) params.set('height', String(config.transform.height))
    if (config.transform.resize) params.set('resize', config.transform.resize)
    if (config.transform.quality) params.set('quality', String(config.transform.quality))
    url += `?${params.toString()}`
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`)
  }

  const blob = await response.blob()
  const contentType = response.headers.get('content-type') || 'application/octet-stream'

  return {
    data: blob,
    contentType,
    size: blob.size,
  }
}

/**
 * Gets a signed URL for downloading a private file.
 * 
 * @param supabase - Supabase client instance
 * @param bucket - Bucket name
 * @param path - File path in bucket
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL
 * 
 * @example
 * ```typescript
 * const signedUrl = await getSignedUrl(supabase, 'private-uploads', 'document.pdf', 7200)
 * // URL is valid for 2 hours
 * ```
 */
export async function getSignedUrl(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  if (!data?.signedUrl) {
    throw new Error('Failed to create signed URL: No URL returned')
  }

  return data.signedUrl
}

/**
 * Deletes a file from Supabase Storage.
 * 
 * @param supabase - Supabase client instance
 * @param bucket - Bucket name
 * @param paths - File path(s) to delete
 * @returns Array of deleted file paths
 * 
 * @example
 * ```typescript
 * await deleteFile(supabase, 'user-uploads', 'avatars/user-123.jpg')
 * // Or delete multiple files
 * await deleteFile(supabase, 'user-uploads', ['file1.jpg', 'file2.jpg'])
 * ```
 */
export async function deleteFile(
  supabase: SupabaseClient<Database>,
  bucket: string,
  paths: string | string[]
): Promise<string[]> {
  const pathsArray = Array.isArray(paths) ? paths : [paths]

  const { data, error } = await supabase.storage.from(bucket).remove(pathsArray)

  if (error) {
    throw new Error(`Failed to delete file(s): ${error.message}`)
  }

  return data?.map((item) => item.name) || []
}

