-- Migration 4: Personalized Learning Roadmaps and Quiz Attempts
-- Author: SAT Platform Database Architecture Team
-- Description: Creates roadmap structures, roadmap items, student quiz attempts, and answers.

-- 1. Personalized Roadmaps Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    title TEXT NOT NULL,
    subject public.app_subject NULL,
    pathway public.learning_pathway NOT NULL,
    status public.roadmap_status NOT NULL DEFAULT 'active',
    is_active BOOLEAN NOT NULL DEFAULT true,
    generation_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_exam_date DATE,
    weekly_study_budget_hours NUMERIC(4, 1) NOT NULL DEFAULT 5.0 CHECK (weekly_study_budget_hours > 0),
    total_items INTEGER NOT NULL DEFAULT 0 CHECK (total_items >= 0),
    completed_items INTEGER NOT NULL DEFAULT 0 CHECK (completed_items >= 0 AND completed_items <= total_items),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_roadmap_dates CHECK (target_exam_date IS NULL OR target_exam_date >= start_date)
);

COMMENT ON TABLE public.roadmaps IS 'Versioned learning roadmaps customized based on diagnostic results.';
COMMENT ON COLUMN public.roadmaps.is_active IS 'Flag ensuring students have at most one currently active learning roadmap.';

-- Partial unique index ensuring single active roadmap per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_roadmaps_user_active 
ON public.roadmaps (user_id) 
WHERE (is_active = true);

-- 2. Roadmap Items Table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    item_type public.roadmap_item_type NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL CHECK (order_index >= 0),
    estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0),
    scheduled_date DATE,
    status public.roadmap_item_status NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_roadmap_items_order UNIQUE (roadmap_id, order_index),
    CONSTRAINT chk_roadmap_item_reference CHECK (
        (item_type = 'lesson' AND lesson_id IS NOT NULL) OR
        (item_type = 'quiz' AND quiz_id IS NOT NULL) OR
        (item_type IN ('practice_test', 'review_session', 'diagnostic'))
    )
);

COMMENT ON TABLE public.roadmap_items IS 'Individual sequential milestones, lessons, and checkpoints within a roadmap.';

-- 3. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
    status public.quiz_attempt_status NOT NULL DEFAULT 'in_progress',
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
    max_score INTEGER NOT NULL DEFAULT 0 CHECK (max_score >= 0),
    score_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (score_percentage >= 0.00 AND score_percentage <= 100.00),
    passed BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_quiz_attempt_number UNIQUE (quiz_id, user_id, attempt_number),
    CONSTRAINT chk_quiz_attempt_submitted CHECK (
        (status = 'submitted' AND submitted_at IS NOT NULL AND submitted_at >= started_at)
        OR (status <> 'submitted')
    )
);

COMMENT ON TABLE public.quiz_attempts IS 'Recorded attempts by students on formative mini-quizzes.';

-- 4. Quiz Answers Table
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
    user_answer TEXT,
    is_correct BOOLEAN,
    points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_quiz_attempt_question UNIQUE (attempt_id, question_id)
);

COMMENT ON TABLE public.quiz_answers IS 'Detailed submitted answer per question within a quiz attempt.';
