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

-- 2. Fix Availability Settings (Add missing JSONB columns)
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

-- 3. Ensure the Subscriptions Table has all required columns
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free_trial';

-- 4. Set RLS for public access to availability (Critical for booking page)
DROP POLICY IF EXISTS "Public can view availability" ON public.availability_settings;
CREATE POLICY "Public can view availability"
  ON public.availability_settings FOR SELECT
  USING (true);
