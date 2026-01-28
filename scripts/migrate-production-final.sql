-- MIGRATE PRODUCTION DATABASE TO ALIGN WITH APPLICATION CODE
-- Run this in the Supabase SQL Editor

-- 1. Fix Bookings Table (Add missing 'date' and 'time' columns)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS time TEXT;

-- Migrate data if exists (optional but good for consistency)
UPDATE public.bookings 
SET date = booking_date::text, 
    time = booking_time::text 
WHERE date IS NULL;

-- 2. Fix Availability Settings (Add missing JSONB columns and fix legacy constraints)
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS monday JSONB;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS tuesday JSONB;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS wednesday JSONB;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS thursday JSONB;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS friday JSONB;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS saturday JSONB;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS sunday JSONB;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS buffer_time INTEGER DEFAULT 0;
ALTER TABLE public.availability_settings ADD COLUMN IF NOT EXISTS advance_booking_days INTEGER DEFAULT 30;

-- FIX CONSTRAINT ERROR: Make legacy columns nullable since we now use JSONB
ALTER TABLE public.availability_settings ALTER COLUMN day_of_week DROP NOT NULL;
ALTER TABLE public.availability_settings ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE public.availability_settings ALTER COLUMN end_time DROP NOT NULL;

-- Drop the unique constraint on day_of_week if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'availability_settings_user_id_day_of_week_key') THEN
        ALTER TABLE public.availability_settings DROP CONSTRAINT availability_settings_user_id_day_of_week_key;
    END IF;
END $$;

-- 3. Ensure the Subscriptions Table has all required columns
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free_trial';

-- 4. Set RLS for public access to availability (Critical for booking page)
DROP POLICY IF EXISTS "Public can view availability" ON public.availability_settings;
CREATE POLICY "Public can view availability"
  ON public.availability_settings FOR SELECT
  USING (true);

-- 5. Secure function to check if a user has an active subscription
-- This function is SECURITY DEFINER, meaning it runs with the privileges of the creator
-- allowing it to bypass RLS on the subscriptions table to return a simple boolean.
CREATE OR REPLACE FUNCTION public.is_subscription_active(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_status subscription_status;
  sub_end TIMESTAMPTZ;
BEGIN
  SELECT status, current_period_end INTO sub_status, sub_end
  FROM public.subscriptions
  WHERE user_id = target_user_id;
  
  -- If no subscription found, return false
  IF sub_status IS NULL THEN 
    RETURN FALSE; 
  END IF;

  -- Active or Trial status check
  IF sub_status = 'active' OR sub_status = 'trial' THEN
     -- Check if period has not expired
     IF sub_end > NOW() THEN 
       RETURN TRUE; 
     END IF;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_subscription_active TO anon, authenticated, service_role;
