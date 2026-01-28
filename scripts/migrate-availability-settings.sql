-- Migration: Add missing columns to availability_settings table
-- Run this in Supabase SQL Editor

-- Add missing columns to availability_settings
ALTER TABLE public.availability_settings 
ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS buffer_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS advance_booking_days INTEGER DEFAULT 30;

-- Update existing records to have default values
UPDATE public.availability_settings 
SET 
  slot_duration = COALESCE(slot_duration, 60),
  buffer_time = COALESCE(buffer_time, 0),
  advance_booking_days = COALESCE(advance_booking_days, 30)
WHERE slot_duration IS NULL OR buffer_time IS NULL OR advance_booking_days IS NULL;
