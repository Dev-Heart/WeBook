-- FIX FULL BOOKING SCHEMA: Add all missing denormalized columns
-- Run this in Supabase SQL Editor

-- 1. Add client_name
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_name TEXT;

-- 2. Add client_phone
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- 3. Add service_name
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS service_name TEXT;

-- 4. Ensure client_email exists (just in case previous script wasn't run)
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- 5. Verify all columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('client_name', 'client_phone', 'service_name', 'client_email');
