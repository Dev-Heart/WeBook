-- FIX PUBLIC ACCESS: Enable RLS policies for public read access
-- Critical for Share Link and Incognito Booking
-- Run this in Supabase SQL Editor

-- 1. Business Profiles: Allow public read
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.business_profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.business_profiles FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Services: Allow public read
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active services are viewable by everyone" ON public.services;
CREATE POLICY "Active services are viewable by everyone"
ON public.services FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Availability Settings: Allow public read
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Availability settings are viewable by everyone" ON public.availability_settings;
CREATE POLICY "Availability settings are viewable by everyone"
ON public.availability_settings FOR SELECT
TO anon, authenticated
USING (true);
