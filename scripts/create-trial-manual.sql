-- Quick script to create a 30-day trial for a test user
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users

-- First, check if user exists and get their ID:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then create trial subscription (replace the UUID below):
INSERT INTO public.subscriptions (
    user_id,
    status,
    plan,
    current_period_start,
    current_period_end
) VALUES (
    'YOUR_USER_ID_HERE',  -- Replace with actual user ID
    'trial',
    'free_trial',
    NOW(),
    NOW() + INTERVAL '30 days'
)
ON CONFLICT (user_id) DO UPDATE SET
    status = 'trial',
    plan = 'free_trial',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '30 days';
