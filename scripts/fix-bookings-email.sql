-- FIX BOOKING SCHEMA: Add missing client_email column
-- Run this in Supabase SQL Editor

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Verify it exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'client_email';
