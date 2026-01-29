-- FINAL STABILITY FIX: Add missing columns to the bookings table
-- Run this in the Supabase SQL Editor

-- 1. Add missing columns
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_name TEXT;

-- 2. Migrate legacy data if necessary (best effort)
UPDATE public.bookings 
SET 
  date = booking_date::text, 
  time = booking_time::text 
WHERE date IS NULL AND booking_date IS NOT NULL;

-- 3. Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings';
