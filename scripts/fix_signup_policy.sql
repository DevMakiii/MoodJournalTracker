-- Fix for signup profile creation issue
-- Run this in Supabase SQL Editor to allow profile creation during signup

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Recreate with proper permissions for signup
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Add service policy that allows profile creation during signup process
CREATE POLICY "profiles_insert_service" ON public.profiles FOR INSERT WITH CHECK (true);