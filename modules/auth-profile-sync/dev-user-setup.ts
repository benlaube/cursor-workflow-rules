/**
 * Dev User Setup Script
 * 
 * Description: Creates a default development user with admin permissions.
 * This script should ONLY be run in development environments.
 * 
 * Dependencies: @supabase/supabase-js
 * Usage: Run with `tsx dev-user-setup.ts` or `node --loader ts-node/esm dev-user-setup.ts`
 * Version: 1.0
 */

import { createClient } from '@supabase/supabase-js'

// Configuration - Change these for your environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Dev user credentials (CHANGE THESE IN PRODUCTION!)
const DEV_USER_EMAIL = process.env.DEV_USER_EMAIL || 'dev@localhost'
const DEV_USER_PASSWORD = process.env.DEV_USER_PASSWORD || 'dev123456'
const DEV_USER_NAME = process.env.DEV_USER_NAME || 'Dev User'

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  console.error('   Get it from: Supabase Dashboard > Settings > API > service_role key')
  process.exit(1)
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Create or update dev user with admin role.
 */
async function setupDevUser() {
  console.log('🔧 Setting up dev user...')
  console.log(`   Email: ${DEV_USER_EMAIL}`)
  console.log(`   Name: ${DEV_USER_NAME}`)

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw listError
    }

    const existingUser = existingUsers?.users?.find(u => u.email === DEV_USER_EMAIL)

    let userId: string

    if (existingUser) {
      console.log('✅ Dev user already exists, updating...')
      userId = existingUser.id

      // Update user metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: DEV_USER_NAME,
          role: 'admin',
        },
        app_metadata: {
          role: 'admin',
        },
      })

      if (updateError) {
        throw updateError
      }
    } else {
      console.log('📝 Creating new dev user...')
      
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: DEV_USER_EMAIL,
        password: DEV_USER_PASSWORD,
        email_confirm: true, // Auto-confirm email for dev user
        user_metadata: {
          full_name: DEV_USER_NAME,
          role: 'admin',
        },
        app_metadata: {
          role: 'admin',
        },
      })

      if (createError) {
        throw createError
      }

      if (!newUser.user) {
        throw new Error('Failed to create user')
      }

      userId = newUser.user.id
      console.log('✅ Dev user created successfully')
    }

    // Ensure profile exists and has admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: DEV_USER_EMAIL,
        full_name: DEV_USER_NAME,
        role: 'admin',
      }, {
        onConflict: 'id',
      })

    if (profileError) {
      throw profileError
    }

    console.log('✅ Profile updated with admin role')

    // Verify setup
    const { data: profile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .single()

    if (verifyError) {
      throw verifyError
    }

    console.log('\n🎉 Dev user setup complete!')
    console.log('\n📋 User Details:')
    console.log(`   ID: ${profile.id}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Name: ${profile.full_name}`)
    console.log(`   Role: ${profile.role}`)
    console.log(`\n🔑 Login Credentials:`)
    console.log(`   Email: ${DEV_USER_EMAIL}`)
    console.log(`   Password: ${DEV_USER_PASSWORD}`)
    console.log('\n⚠️  WARNING: Never run this script in production!')

    return profile
  } catch (error: any) {
    console.error('❌ Error setting up dev user:', error.message)
    if (error.details) {
      console.error('   Details:', error.details)
    }
    process.exit(1)
  }
}

// Run setup
setupDevUser()

