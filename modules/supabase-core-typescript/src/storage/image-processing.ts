/**
 * Image Processing Helpers
 * 
 * Utilities for image manipulation using Supabase Storage image transformations.
 * 
 * Dependencies: @supabase/supabase-js
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Image transformation options.
 */
export interface ImageTransformOptions {
  /** Target width in pixels */
  width?: number
  /** Target height in pixels */
  height?: number
  /** Resize mode */
  resize?: 'cover' | 'contain' | 'fill'
  /** Image quality (1-100) */
  quality?: number
  /** Image format (webp, jpeg, png) */
  format?: 'webp' | 'jpeg' | 'png'
}

/**
 * Gets a transformed image URL from Supabase Storage.
 * Supabase automatically handles image transformations via URL parameters.
 * 
 * @param supabase - Supabase client instance
 * @param bucket - Bucket name
 * @param path - Image path in bucket
 * @param options - Transformation options
 * @returns Transformed image URL
 * 
 * @example
 * ```typescript
 * const thumbnailUrl = getImageUrl(supabase, 'uploads', 'photo.jpg', {
 *   width: 200,
 *   height: 200,
 *   resize: 'cover',
 *   quality: 80,
 * })
 * ```
 */
export function getImageUrl(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string,
  options: ImageTransformOptions = {}
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  const baseUrl = data.publicUrl

  if (!options.width && !options.height && !options.quality && !options.format) {
    return baseUrl
  }

  const params = new URLSearchParams()

  if (options.width) params.set('width', String(options.width))
  if (options.height) params.set('height', String(options.height))
  if (options.resize) params.set('resize', options.resize)
  if (options.quality) params.set('quality', String(options.quality))
  if (options.format) params.set('format', options.format)

  return `${baseUrl}?${params.toString()}`
}

/**
 * Creates a thumbnail URL for an image.
 * Convenience function for common thumbnail use case.
 * 
 * @param supabase - Supabase client instance
 * @param bucket - Bucket name
 * @param path - Image path in bucket
 * @param size - Thumbnail size (square, in pixels)
 * @returns Thumbnail URL
 * 
 * @example
 * ```typescript
 * const thumbUrl = getThumbnailUrl(supabase, 'uploads', 'photo.jpg', 150)
 * // Returns URL for 150x150 thumbnail
 * ```
 */
export function getThumbnailUrl(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string,
  size: number = 200
): string {
  return getImageUrl(supabase, bucket, path, {
    width: size,
    height: size,
    resize: 'cover',
    quality: 80,
    format: 'webp',
  })
}

