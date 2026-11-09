-- Migration 3: User Profiles, Assessments, and Learning Progress Tables
-- Author: SAT Platform Database Architecture Team
-- Description: Establishes user profiles linked to auth.users, diagnostic assessments,
--              assessment responses, lesson progress, skill mastery, and study activity logs.

-- 1. Profiles Table (Linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role public.user_role NOT NULL DEFAULT 'student',
    target_score INTEGER CHECK (target_score IS NULL OR (target_score >= 400 AND target_score <= 1600)),
    target_math_score INTEGER CHECK (target_math_score IS NULL OR (target_math_score >= 200 AND target_math_score <= 800)),
    target_rw_score INTEGER CHECK (target_rw_score IS NULL OR (target_rw_score >= 200 AND target_rw_score <= 800)),
    target_exam_date DATE CHECK (target_exam_date IS NULL OR target_exam_date >= CURRENT_DATE - INTERVAL '1 day'),
    starting_level public.learning_pathway NOT NULL DEFAULT 'pre_sat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_target_score_sum CHECK (
        target_score IS NULL 
        OR target_math_score IS NULL 
        OR target_rw_score IS NULL 
        OR target_score = (target_math_score + target_rw_score)
    )
);

COMMENT ON TABLE public.profiles IS 'Student and educator profiles linked directly to Supabase Auth.';

-- 2. Student Preferences Table
CREATE TABLE IF NOT EXISTS public.student_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    weekly_study_hours_budget NUMERIC(4, 1) NOT NULL DEFAULT 5.0 CHECK (weekly_study_hours_budget > 0 AND weekly_study_hours_budget <= 60.0),
    preferred_study_days TEXT[] NOT NULL DEFAULT ARRAY['monday', 'wednesday', 'saturday']::TEXT[],
    reminder_notifications BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    preferred_pathway public.learning_pathway NOT NULL DEFAULT 'pre_sat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.student_preferences IS 'User preferences for pacing, study scheduling, and notifications.';

-- 3. Diagnostic and Practice Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assessment_type public.assessment_type NOT NULL DEFAULT 'diagnostic',
    subject public.app_subject NULL,
    pathway public.learning_pathway NULL,
    status public.assessment_status NOT NULL DEFAULT 'not_started',
    total_questions INTEGER NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
    answered_questions INTEGER NOT NULL DEFAULT 0 CHECK (answered_questions >= 0 AND answered_questions <= total_questions),
    total_score INTEGER CHECK (total_score IS NULL OR (total_score >= 0 AND total_score <= 1600)),
    math_score INTEGER CHECK (math_score IS NULL OR (math_score >= 0 AND math_score <= 800)),
    rw_score INTEGER CHECK (rw_score IS NULL OR (rw_score >= 0 AND rw_score <= 800)),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    diagnostic_results JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_assessment_completed_timing CHECK (
        (status = 'completed' AND completed_at IS NOT NULL AND started_at IS NOT NULL AND completed_at >= started_at)
        OR (status <> 'completed')
    )
);

COMMENT ON TABLE public.assessments IS 'Student diagnostic tests and full-length practice exam attempts.';

-- 4. Assessment Question-Level Answers Table
CREATE TABLE IF NOT EXISTS public.assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_assessment_question UNIQUE (assessment_id, question_id)
);

COMMENT ON TABLE public.assessment_answers IS 'Granular question responses submitted during an assessment session.';

-- 5. Lesson Progress Tracking Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status public.progress_status NOT NULL DEFAULT 'not_started',
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_step_index INTEGER NOT NULL DEFAULT 0 CHECK (last_step_index >= 0),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    notes TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id),
    CONSTRAINT chk_lesson_progress_completed CHECK (
        (status = 'completed' AND progress_percent = 100 AND completed_at IS NOT NULL)
        OR (status <> 'completed')
    )
);

COMMENT ON TABLE public.lesson_progress IS 'Per-student resumable progress through instructional lessons.';

-- 6. Student Skill Mastery Aggregate Table
CREATE TABLE IF NOT EXISTS public.student_skill_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    mastery_level public.mastery_level NOT NULL DEFAULT 'novice',
    mastery_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (mastery_score >= 0.00 AND mastery_score <= 100.00),
    questions_attempted INTEGER NOT NULL DEFAULT 0 CHECK (questions_attempted >= 0),
    questions_correct INTEGER NOT NULL DEFAULT 0 CHECK (questions_correct >= 0 AND questions_correct <= questions_attempted),
    last_practiced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_skill_mastery UNIQUE (user_id, skill_id)
);

COMMENT ON TABLE public.student_skill_mastery IS 'Continuous mastery score per skill to power intelligent roadmap adaptations.';

-- 7. Daily/Weekly Study Activities Log Table
CREATE TABLE IF NOT EXISTS public.study_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('lesson', 'quiz', 'diagnostic', 'tutor_chat', 'review')),
    reference_id UUID,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.study_activities IS 'Time and action logs powering student streaks, weekly study hours, and analytics.';
