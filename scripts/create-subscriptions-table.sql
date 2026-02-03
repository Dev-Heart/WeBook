-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('trial', 'active', 'expired')),
  plan TEXT NOT NULL CHECK (plan IN ('free_trial', 'monthly', 'yearly')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users can read their own subscription
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Service role (and Admins via backend actions) can do everything
-- Note: We generally use service_role key for admin actions in Supabase, 
-- but if we want direct SQL access we can add a policy for admin emails later.
-- For now, backend actions using service_role are sufficient for updates.

-- Create a function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
