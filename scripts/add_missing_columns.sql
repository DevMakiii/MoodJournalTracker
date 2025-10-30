-- Add missing columns to profiles table
-- Run this in Supabase SQL Editor to fix the signup issue

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;