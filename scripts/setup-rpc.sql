-- Secure function to check if a user has an active subscription
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
  
  -- If no subscription found, return false (or true if you want to allow access by default, but requirement says lock)
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
