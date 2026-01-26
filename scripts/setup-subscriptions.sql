-- Create subscription types
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled', 'expired');
CREATE TYPE subscription_plan AS ENUM ('free_trial', 'sa_monthly', 'intl_monthly');

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE, -- One active sub per user
    gateway_subscription_id TEXT, -- External ID from Paystack/Stripe
    gateway_customer_id TEXT, -- External Customer ID
    status subscription_status NOT NULL DEFAULT 'trial',
    plan subscription_plan NOT NULL DEFAULT 'free_trial',
    currency TEXT DEFAULT 'GHS',
    amount DECIMAL(10, 2) DEFAULT 0,
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ, -- For trial, this will be set to created_at + 30 days
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup (auto-create trial)
-- This assumes we might use a Supabase Auth hook later, but for now we can call it manually or via trigger if we had a public.users table synced with auth.users
-- For simplicity in this app, we will handle trial creation in the onboarding API flow or strictly via RLS-compliant client insert if permitted, or server action.
-- Let's allow users to insert their own initial trial record if it doesn't exist? 
-- Safer: Only allow server-side creation. But for now, let's stick to the pattern used in business_profiles (Users can insert their own).

CREATE POLICY "Users can create their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
