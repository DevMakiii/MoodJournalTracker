-- Check current auth configuration and policies
-- Run this in Supabase SQL Editor to diagnose auth issues

-- Check current policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Check if auth.users table is accessible
SELECT COUNT(*) as user_count FROM auth.users;

-- Check current user/session info (if available)
SELECT auth.uid() as current_user_id;

-- Check if profiles table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;