-- SEED VERIFICATION DATA
-- Run locally to verify booking slots

-- 1. Create a dummy user (if RLS allows, otherwise we might need to be clever)
-- Actually, we can just insert into business_profiles and availability_settings with a random UUID
-- since the public booking page mainly joins on these or queries them by user_id.

DO $$
DECLARE
  new_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Cleanup old test data
  DELETE FROM public.bookings WHERE user_id = new_user_id;
  DELETE FROM public.availability_settings WHERE user_id = new_user_id;
  DELETE FROM public.services WHERE user_id = new_user_id;
  DELETE FROM public.business_profiles WHERE user_id = new_user_id;

  -- 1. Profile
  INSERT INTO public.business_profiles (user_id, business_name, business_type, contact_phone, currency_display)
  VALUES (new_user_id, 'Test Salon', 'Salon', '1234567890', 'USD');

  -- 2. Service
  INSERT INTO public.services (user_id, name, category, price, duration, active)
  VALUES (new_user_id, 'Test Haircut', 'Hair', 50, 30, true);

  -- 3. Availability (Enable All Days)
  INSERT INTO public.availability_settings (
    user_id, 
    monday, tuesday, wednesday, thursday, friday, saturday, sunday,
    slot_duration, buffer_time, advance_booking_days
  )
  VALUES (
    new_user_id,
    '{"enabled": true, "start": "09:00", "end": "17:00"}'::jsonb,
    '{"enabled": true, "start": "09:00", "end": "17:00"}'::jsonb,
    '{"enabled": true, "start": "09:00", "end": "17:00"}'::jsonb,
    '{"enabled": true, "start": "09:00", "end": "17:00"}'::jsonb,
    '{"enabled": true, "start": "09:00", "end": "17:00"}'::jsonb,
    '{"enabled": true, "start": "09:00", "end": "17:00"}'::jsonb,
    '{"enabled": true, "start": "09:00", "end": "17:00"}'::jsonb,
    30, 0, 30
  );
END $$;
