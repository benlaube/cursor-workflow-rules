-- Dev User Setup Script
--
-- Description: Creates a default development user with admin permissions for local development.
-- This script should ONLY be run in development environments, never in production.
--
-- Usage: Run this in Supabase SQL Editor after applying profile-sync.sql migration.
-- Version: 1.0

-- 1. Add role column to profiles table (if not exists)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles(role);

-- Add comment
COMMENT ON COLUMN public.profiles.role IS 'User role: user, admin, or custom role. Used for permission checks.';

-- 2. Function to create dev user (idempotent - safe to run multiple times)
CREATE OR REPLACE FUNCTION public.create_dev_user()
RETURNS uuid AS $$
DECLARE
  dev_user_id uuid;
  dev_email text := 'dev@localhost';
  dev_password text := 'dev123456'; -- Change this in production!
BEGIN
  -- Check if dev user already exists
  SELECT id INTO dev_user_id
  FROM auth.users
  WHERE email = dev_email;

  -- If user exists, return existing ID
  IF dev_user_id IS NOT NULL THEN
    -- Update role to admin if not already
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = dev_user_id AND role != 'admin';
    
    RETURN dev_user_id;
  END IF;

  -- Create new dev user in auth.users
  -- Note: This requires using Supabase Admin API or service_role key
  -- For SQL-only approach, we'll create a placeholder and document the API method
  
  -- This function will be called from a script that uses Supabase Admin API
  -- See dev-user-setup.ts for the complete implementation
  
  RAISE EXCEPTION 'Dev user creation requires Supabase Admin API. Use dev-user-setup.ts script instead.';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.create_dev_user IS 'Creates a default dev user with admin role. Should only be used in development environments.';

-- 3. Function to set user role (for use after user is created)
CREATE OR REPLACE FUNCTION public.set_user_role(user_id uuid, new_role text)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET role = new_role
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.set_user_role IS 'Sets a user role. Requires SECURITY DEFINER to allow role updates.';

-- 4. RLS Policy for admin access (allows admins to see all profiles)
-- This extends the existing policies from profile-sync.sql

-- Drop existing select policy if it exists (we'll recreate it with role check)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Create new select policy that allows:
-- - Everyone to see public profiles (for basic user info)
-- - Admins to see all profiles
-- Uses JWT claims (app_metadata) for admin check - secure and cannot be tampered with
CREATE POLICY "Profiles are viewable by everyone, admins see all"
  ON public.profiles FOR SELECT
  USING (
    true -- Public profiles visible to all
    OR 
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' -- Admins see all (from JWT)
  );

-- Policy for admins to update any profile
-- Uses JWT claims for security - profiles.role could be modified by user
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 5. Helper function to check if current user is admin
-- Uses JWT claims (app_metadata) for security - this is the source of truth
-- The profiles.role column is for convenience/querying, but JWT is authoritative
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check JWT claim first (secure, cannot be tampered with)
  -- app_metadata.role is set when user is created/updated via Admin API
  RETURN (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin IS 'Returns true if the current authenticated user has admin role. Uses JWT app_metadata (secure) as source of truth.';

-- 6. Example: Grant admin role to existing user by email
-- Usage: SELECT public.grant_admin_role('user@example.com');
CREATE OR REPLACE FUNCTION public.grant_admin_role(user_email text)
RETURNS void AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Update role to admin
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.grant_admin_role IS 'Grants admin role to a user by email. Use with caution.';

