-- Migration 10: Create Telegram Bot & Reminder Tables
-- Author: SAT Platform Integration Team
-- Description: Sets up Telegram account linking, linking tokens, reminder preferences, and notification history.

-- 1. Telegram Connections Table
CREATE TABLE IF NOT EXISTS public.telegram_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    telegram_chat_id BIGINT NOT NULL,
    telegram_username TEXT,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uq_telegram_connections_user UNIQUE (user_id),
    CONSTRAINT uq_telegram_connections_chat UNIQUE (telegram_chat_id)
);

-- 2. Telegram Single-Use Linking Tokens Table
CREATE TABLE IF NOT EXISTS public.telegram_link_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_telegram_link_tokens_hash UNIQUE (token_hash)
);

-- 3. Reminder Settings Table
CREATE TABLE IF NOT EXISTS public.reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    reminder_time TIME NOT NULL DEFAULT '18:00:00',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    study_days TEXT[] NOT NULL DEFAULT ARRAY['monday', 'wednesday', 'saturday']::TEXT[],
    reminder_before_minutes INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_reminder_settings_user UNIQUE (user_id)
);

-- 4. Notification Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance & query isolation
CREATE INDEX IF NOT EXISTS idx_telegram_connections_user_id ON public.telegram_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_connections_chat_id ON public.telegram_connections(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_link_tokens_hash ON public.telegram_link_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_telegram_link_tokens_user_id ON public.telegram_link_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_settings_user_id ON public.reminder_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_scheduled ON public.notification_logs(user_id, notification_type, scheduled_at);

-- Trigger to update updated_at on reminder_settings
CREATE OR REPLACE TRIGGER set_reminder_settings_updated_at
    BEFORE UPDATE ON public.reminder_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.telegram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: telegram_connections
DROP POLICY IF EXISTS "Users can view own telegram connection" ON public.telegram_connections;
CREATE POLICY "Users can view own telegram connection"
    ON public.telegram_connections
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own telegram connection" ON public.telegram_connections;
CREATE POLICY "Users can update own telegram connection"
    ON public.telegram_connections
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own telegram connection" ON public.telegram_connections;
CREATE POLICY "Users can delete own telegram connection"
    ON public.telegram_connections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Service role full access for Edge Functions
DROP POLICY IF EXISTS "Service role manages all telegram connections" ON public.telegram_connections;
CREATE POLICY "Service role manages all telegram connections"
    ON public.telegram_connections
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies: telegram_link_tokens
DROP POLICY IF EXISTS "Users can create own link tokens" ON public.telegram_link_tokens;
CREATE POLICY "Users can create own link tokens"
    ON public.telegram_link_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own link tokens" ON public.telegram_link_tokens;
CREATE POLICY "Users can view own link tokens"
    ON public.telegram_link_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages link tokens" ON public.telegram_link_tokens;
CREATE POLICY "Service role manages link tokens"
    ON public.telegram_link_tokens
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies: reminder_settings
DROP POLICY IF EXISTS "Users can view own reminder settings" ON public.reminder_settings;
CREATE POLICY "Users can view own reminder settings"
    ON public.reminder_settings
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reminder settings" ON public.reminder_settings;
CREATE POLICY "Users can insert own reminder settings"
    ON public.reminder_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reminder settings" ON public.reminder_settings;
CREATE POLICY "Users can update own reminder settings"
    ON public.reminder_settings
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages reminder settings" ON public.reminder_settings;
CREATE POLICY "Service role manages reminder settings"
    ON public.reminder_settings
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies: notification_logs
DROP POLICY IF EXISTS "Users can view own notification logs" ON public.notification_logs;
CREATE POLICY "Users can view own notification logs"
    ON public.notification_logs
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages notification logs" ON public.notification_logs;
CREATE POLICY "Service role manages notification logs"
    ON public.notification_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Helper RPC function: Atomically link telegram account and mark token as used
CREATE OR REPLACE FUNCTION public.link_telegram_account(
    p_token_hash TEXT,
    p_telegram_chat_id BIGINT,
    p_telegram_username TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_token RECORD;
    v_profile RECORD;
BEGIN
    -- 1. Find valid, non-expired, unused token
    SELECT * INTO v_token
    FROM public.telegram_link_tokens
    WHERE token_hash = p_token_hash
      AND used_at IS NULL
      AND expires_at > timezone('utc'::text, now())
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'EXPIRED_OR_INVALID_TOKEN'
        );
    END IF;

    -- 2. Mark token as used
    UPDATE public.telegram_link_tokens
    SET used_at = timezone('utc'::text, now())
    WHERE id = v_token.id;

    -- 3. Upsert into telegram_connections
    INSERT INTO public.telegram_connections (
        user_id,
        telegram_chat_id,
        telegram_username,
        connected_at,
        is_active
    )
    VALUES (
        v_token.user_id,
        p_telegram_chat_id,
        p_telegram_username,
        timezone('utc'::text, now()),
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        telegram_chat_id = EXCLUDED.telegram_chat_id,
        telegram_username = EXCLUDED.telegram_username,
        connected_at = timezone('utc'::text, now()),
        is_active = true;

    -- 4. Ensure default reminder_settings exists for this user
    INSERT INTO public.reminder_settings (
        user_id,
        enabled,
        reminder_time,
        timezone,
        study_days,
        reminder_before_minutes
    )
    VALUES (
        v_token.user_id,
        true,
        '18:00:00',
        'UTC',
        ARRAY['monday', 'wednesday', 'saturday']::TEXT[],
        30
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- 5. Return user profile info
    SELECT id, full_name, starting_level, target_score INTO v_profile
    FROM public.profiles
    WHERE id = v_token.user_id;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_token.user_id,
        'full_name', v_profile.full_name,
        'target_score', v_profile.target_score,
        'starting_level', v_profile.starting_level
    );
END;
$$;

