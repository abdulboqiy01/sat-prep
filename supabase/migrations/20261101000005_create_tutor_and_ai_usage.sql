-- Migration 5: AI Tutor Sessions, Messages, and Backend AI Usage Tracking
-- Author: SAT Platform Database Architecture Team
-- Description: Creates AI conversational tutor storage and strictly audited AI token usage tracking.

-- 1. AI Tutor Sessions Table
CREATE TABLE IF NOT EXISTS public.tutor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    subject public.app_subject NULL,
    context_type TEXT NOT NULL DEFAULT 'general' CHECK (
        context_type IN ('general', 'lesson', 'question', 'quiz', 'roadmap', 'assessment')
    ),
    context_id UUID NULL,
    status public.session_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_tutor_session_title_non_empty CHECK (char_length(trim(title)) > 0)
);

COMMENT ON TABLE public.tutor_sessions IS 'AI conversational tutoring sessions linked to specific learning contexts.';

-- 2. AI Tutor Messages Table
CREATE TABLE IF NOT EXISTS public.tutor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.tutor_sessions(id) ON DELETE CASCADE,
    sender_role public.message_role NOT NULL,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tutor_messages IS 'Message history between student and the Gemini-powered AI Tutor.';

-- 3. AI Usage & Token Tracking Table
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.tutor_sessions(id) ON DELETE SET NULL,
    feature public.ai_feature NOT NULL,
    model TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0 CHECK (prompt_tokens >= 0),
    completion_tokens INTEGER NOT NULL DEFAULT 0 CHECK (completion_tokens >= 0),
    total_tokens INTEGER NOT NULL DEFAULT 0 CHECK (total_tokens >= 0),
    request_duration_ms INTEGER CHECK (request_duration_ms IS NULL OR request_duration_ms >= 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_ai_total_tokens CHECK (total_tokens = (prompt_tokens + completion_tokens))
);

COMMENT ON TABLE public.ai_usage IS 'Immutable backend audit ledger of AI token usage and quota consumption.';
