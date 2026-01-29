-- FIX AVAILABILITY PERSISTENCE: Add unique constraint on user_id
-- Run this in Supabase SQL Editor

-- 1. Clean up duplicate rows (keep the most recently updated one)
DELETE FROM public.availability_settings a
USING public.availability_settings b
WHERE a.user_id = b.user_id
AND a.updated_at < b.updated_at;

-- 2. Add Unique Constraint on user_id
ALTER TABLE public.availability_settings
ADD CONSTRAINT availability_settings_user_id_key UNIQUE (user_id);
