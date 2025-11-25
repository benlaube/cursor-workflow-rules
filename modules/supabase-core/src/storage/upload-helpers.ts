/**
 * Storage Upload Helpers
 * 
 * Utilities for uploading files to Supabase Storage with validation and error handling.
 * 
 * Dependencies: @supabase/supabase-js
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * File upload configuration.
 */
export interface UploadConfig {
  /** Bucket name */
  bucket: string
  /** File path in bucket */
  path: string
  /** File object or Blob */
  file: File | Blob
  /** Content type (auto-detected if not provided) */
  contentType?: string
  /** Whether to overwrite existing file */
  upsert?: boolean
  /** Cache control header */
  cacheControl?: string
  /** Custom metadata */
  metadata?: Record<string, string>
}

/**
 * Upload result.
 */
export interface UploadResult {
  /** File path in bucket */
  path: string
  /** Full public URL (if bucket is public) */
  publicUrl?: string
  /** Signed URL (for private buckets) */
  signedUrl?: string
}

/**
 * File validation options.
 */
export interface FileValidationOptions {
  /** Maximum file size in bytes */
  maxSize?: number
  /** Allowed MIME types */
  allowedTypes?: string[]
  /** Allowed file extensions */
  allowedExtensions?: string[]
}

/**
 * Validates a file before upload.
 * 
 * @param file - File to validate
 * @param options - Validation options
 * @throws Error if validation fails
 * 
 * @example
 * ```typescript
 * validateFile(file, {
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: ['image/jpeg', 'image/png'],
 * })
 * ```
 */
export function validateFile(file: File | Blob, options: FileValidationOptions = {}): void {
  const { maxSize, allowedTypes, allowedExtensions } = options

  if (file instanceof File) {
    // Check file size
    if (maxSize && file.size > maxSize) {
      throw new Error(`File size exceeds maximum of ${maxSize} bytes`)
    }

    // Check MIME type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Check file extension
    if (allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(extension)) {
        throw new Error(`File extension .${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`)
      }
    }
  } else if (maxSize && file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize} bytes`)
  }
}

/**
 * Uploads a file to Supabase Storage with validation.
 * 
 * @param supabase - Supabase client instance
 * @param config - Upload configuration
 * @param validation - Optional file validation options
 * @returns Upload result with file path and URLs
 * 
 * @example
 * ```typescript
 * const result = await uploadFile(supabase, {
 *   bucket: 'user-uploads',
 *   path: 'avatars/user-123.jpg',
 *   file: file,
 *   contentType: 'image/jpeg',
 * }, {
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: ['image/jpeg', 'image/png'],
 * })
 * ```
 */
export async function uploadFile(
  supabase: SupabaseClient<Database>,
  config: UploadConfig,
  validation?: FileValidationOptions
): Promise<UploadResult> {
  // Validate file if options provided
  if (validation) {
    validateFile(config.file, validation)
  }

  // Determine content type
  const contentType = config.contentType || (config.file instanceof File ? config.file.type : 'application/octet-stream')

  // Upload file
  const { data, error } = await supabase.storage
    .from(config.bucket)
    .upload(config.path, config.file, {
      contentType,
      upsert: config.upsert ?? false,
      cacheControl: config.cacheControl,
      metadata: config.metadata,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  if (!data) {
    throw new Error('Upload failed: No data returned')
  }

  // Get public URL if bucket is public
  const { data: publicUrlData } = supabase.storage.from(config.bucket).getPublicUrl(config.path)
  const publicUrl = publicUrlData?.publicUrl

  // Get signed URL for private buckets (valid for 1 hour)
  let signedUrl: string | undefined
  if (!publicUrl) {
    const { data: signedUrlData } = supabase.storage
      .from(config.bucket)
      .createSignedUrl(config.path, 3600) // 1 hour
    signedUrl = signedUrlData?.signedUrl
  }

  return {
    path: data.path,
    publicUrl,
    signedUrl,
  }
}

/**
 * Uploads multiple files to Supabase Storage.
 * 
 * @param supabase - Supabase client instance
 * @param files - Array of file upload configurations
 * @param validation - Optional file validation options (applied to all files)
 * @returns Array of upload results
 * 
 * @example
 * ```typescript
 * const results = await uploadFiles(supabase, [
 *   { bucket: 'uploads', path: 'file1.jpg', file: file1 },
 *   { bucket: 'uploads', path: 'file2.jpg', file: file2 },
 * ])
 * ```
 */
export async function uploadFiles(
  supabase: SupabaseClient<Database>,
  files: UploadConfig[],
  validation?: FileValidationOptions
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (const fileConfig of files) {
    try {
      const result = await uploadFile(supabase, fileConfig, validation)
      results.push(result)
    } catch (error: any) {
      // Continue with other files, but log error
      console.error(`Failed to upload ${fileConfig.path}:`, error.message)
      throw error // Re-throw to stop batch upload
    }
  }

  return results
}

