-- Notifications Schema

-- 1. Create Notification Types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
        CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('confirmation', 'reminder', 'cancellation');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
        CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'failed');
    END IF;
END$$;

-- 2. Create Notification Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Business Owner
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    channel notification_channel NOT NULL,
    type notification_type NOT NULL,
    recipient TEXT NOT NULL,
    content TEXT,
    status notification_status DEFAULT 'sent', -- Mocking as sent by default
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
DROP POLICY IF EXISTS "Users can view their own notification logs" ON public.notification_logs;
CREATE POLICY "Users can view their own notification logs"
  ON public.notification_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Only server should insert, but if we allow client side reminders (via server action which has privileges, or RLS if we insert directly):
DROP POLICY IF EXISTS "Users can insert their own notification logs" ON public.notification_logs;
CREATE POLICY "Users can insert their own notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
