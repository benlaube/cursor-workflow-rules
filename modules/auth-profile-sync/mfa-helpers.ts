/**
 * Multi-Factor Authentication (MFA) Helpers
 * 
 * Provides helper functions for MFA enrollment, verification, and management
 * using Supabase Auth's built-in MFA support.
 * 
 * Dependencies: @supabase/supabase-js
 * 
 * Supabase MFA supports:
 * - TOTP (Time-based One-Time Password) via authenticator apps
 * - SMS (if configured)
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * MFA enrollment result.
 */
export interface MFAEnrollmentResult {
  /** QR code data URL for TOTP setup */
  qrCode: string
  /** Secret key for manual entry */
  secret: string
  /** Verification URI for authenticator apps */
  uri: string
}

/**
 * Start MFA enrollment process.
 * 
 * Generates a TOTP secret and QR code for the user to scan with an authenticator app.
 * 
 * @param supabase - Authenticated Supabase client
 * @param friendlyName - Name for the authenticator (e.g., "My Phone")
 * @returns Enrollment data including QR code
 * 
 * @example
 * ```typescript
 * const { data, error } = await enrollMFA(supabase, 'My iPhone')
 * if (error) {
 *   console.error('Enrollment error:', error)
 *   return
 * }
 * // Display data.qrCode to user for scanning
 * ```
 */
export async function enrollMFA(
  supabase: SupabaseClient,
  friendlyName: string = 'Authenticator'
): Promise<{ data: MFAEnrollmentResult | null; error: any }> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
  })

  if (error) {
    return { data: null, error }
  }

  return {
    data: {
      qrCode: data.qr_code || '',
      secret: data.secret || '',
      uri: data.uri || '',
    },
    error: null,
  }
}

/**
 * Verify MFA enrollment with a TOTP code.
 * 
 * After user scans QR code, they enter a code from their authenticator app
 * to complete enrollment.
 * 
 * @param supabase - Authenticated Supabase client
 * @param factorId - Factor ID from enrollment
 * @param code - TOTP code from authenticator app
 * @returns Success or error
 * 
 * @example
 * ```typescript
 * const { error } = await verifyMFAEnrollment(supabase, factorId, '123456')
 * if (error) {
 *   console.error('Verification failed:', error)
 * } else {
 *   console.log('MFA enrolled successfully')
 * }
 * ```
 */
export async function verifyMFAEnrollment(
  supabase: SupabaseClient,
  factorId: string,
  code: string
): Promise<{ error: any }> {
  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: '', // Will be set by Supabase
    code,
  })

  return { error }
}

/**
 * Challenge MFA (request verification code).
 * 
 * Call this before verifying MFA during sign-in.
 * 
 * @param supabase - Authenticated Supabase client
 * @param factorId - Factor ID to challenge
 * @returns Challenge ID for verification
 * 
 * @example
 * ```typescript
 * const { data, error } = await challengeMFA(supabase, factorId)
 * if (error) {
 *   console.error('Challenge error:', error)
 *   return
 * }
 * // Use data.id in verifyMFASignIn
 * ```
 */
export async function challengeMFA(
  supabase: SupabaseClient,
  factorId: string
): Promise<{ data: { id: string } | null; error: any }> {
  const { data, error } = await supabase.auth.mfa.challenge({
    factorId,
  })

  if (error) {
    return { data: null, error }
  }

  return {
    data: { id: data.id },
    error: null,
  }
}

/**
 * Verify MFA during sign-in.
 * 
 * After challenging MFA, verify the TOTP code from authenticator app.
 * 
 * @param supabase - Authenticated Supabase client
 * @param challengeId - Challenge ID from challengeMFA
 * @param code - TOTP code from authenticator app
 * @returns Success or error
 * 
 * @example
 * ```typescript
 * const { error } = await verifyMFASignIn(supabase, challengeId, '123456')
 * if (error) {
 *   console.error('MFA verification failed:', error)
 * } else {
 *   console.log('Sign-in successful')
 * }
 * ```
 */
export async function verifyMFASignIn(
  supabase: SupabaseClient,
  challengeId: string,
  code: string
): Promise<{ error: any }> {
  const { error } = await supabase.auth.mfa.verify({
    challengeId,
    code,
  })

  return { error }
}

/**
 * List user's enrolled MFA factors.
 * 
 * @param supabase - Authenticated Supabase client
 * @returns List of enrolled factors
 * 
 * @example
 * ```typescript
 * const { data, error } = await listMFAFactors(supabase)
 * if (error) {
 *   console.error('List error:', error)
 *   return
 * }
 * console.log('Enrolled factors:', data)
 * ```
 */
export async function listMFAFactors(
  supabase: SupabaseClient
): Promise<{ data: any[] | null; error: any }> {
  const { data, error } = await supabase.auth.mfa.listFactors()

  if (error) {
    return { data: null, error }
  }

  return { data: data?.all || [], error: null }
}

/**
 * Unenroll (remove) an MFA factor.
 * 
 * @param supabase - Authenticated Supabase client
 * @param factorId - Factor ID to remove
 * @returns Success or error
 * 
 * @example
 * ```typescript
 * const { error } = await unenrollMFA(supabase, factorId)
 * if (error) {
 *   console.error('Unenroll error:', error)
 * } else {
 *   console.log('MFA factor removed')
 * }
 * ```
 */
export async function unenrollMFA(
  supabase: SupabaseClient,
  factorId: string
): Promise<{ error: any }> {
  const { error } = await supabase.auth.mfa.unenroll({
    factorId,
  })

  return { error }
}

/**
 * Check if user has MFA enabled.
 * 
 * @param supabase - Authenticated Supabase client
 * @returns True if user has at least one enrolled factor
 * 
 * @example
 * ```typescript
 * const hasMFA = await hasMFAEnabled(supabase)
 * if (hasMFA) {
 *   // Show MFA verification UI
 * }
 * ```
 */
export async function hasMFAEnabled(
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.listFactors()

  if (error || !data) {
    return false
  }

  return (data.all?.length || 0) > 0
}

/**
 * Update MFA status in profiles table.
 * 
 * Call this after successful MFA enrollment/unenrollment to sync with profiles.
 * 
 * @param supabase - Authenticated Supabase client
 * @returns Success or error
 */
export async function syncMFAStatus(
  supabase: SupabaseClient
): Promise<{ error: any }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: new Error('User not authenticated') }
  }

  const hasMFA = await hasMFAEnabled(supabase)

  const { error } = await supabase
    .from('profiles')
    .update({ mfa_enabled: hasMFA, mfa_enabled_at: hasMFA ? new Date().toISOString() : null })
    .eq('id', user.id)

  return { error }
}

