-- Consolidated Fix Script for Subscriptions
-- Run this in your Supabase SQL Editor to set up everything correctly.

-- 1. Create Types (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled', 'expired');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
        CREATE TYPE subscription_plan AS ENUM ('free_trial', 'sa_monthly', 'intl_monthly');
    END IF;
END$$;

-- 2. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gateway_subscription_id TEXT,
    gateway_customer_id TEXT,
    status subscription_status NOT NULL DEFAULT 'trial',
    plan subscription_plan NOT NULL DEFAULT 'free_trial',
    currency TEXT DEFAULT 'GHS',
    amount DECIMAL(10, 2) DEFAULT 0,
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscriptions;
CREATE POLICY "Users can create their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Create Security RPC Function
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
  
  IF sub_status IS NULL THEN 
    RETURN FALSE; 
  END IF;

  IF sub_status = 'active' OR sub_status = 'trial' THEN
     IF sub_end > NOW() THEN 
       RETURN TRUE; 
     END IF;
  END IF;

  RETURN FALSE;
END;
$$;

-- 6. Grant Permissions
GRANT EXECUTE ON FUNCTION public.is_subscription_active TO anon, authenticated, service_role;
