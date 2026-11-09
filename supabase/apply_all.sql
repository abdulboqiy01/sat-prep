-- ================================================================
-- SAT PREPARATION PLATFORM - COMPLETE DATABASE SCHEMA & SEED DATA
-- Generated for execution in Supabase Dashboard SQL Editor
-- ================================================================

-- >>> FILE: 20261101000001_create_enums_and_extensions.sql <<<
-- Migration 1: Extensions and Domain Enums
-- Author: SAT Platform Database Architecture Team
-- Description: Enables required extensions and defines strongly typed domain enums for the platform.

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Domain Enums

-- Core academic subjects
DO $$ BEGIN
    CREATE TYPE public.app_subject AS ENUM (
        'math',
        'reading_writing'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Learning pathways tailored to student performance & goals
DO $$ BEGIN
    CREATE TYPE public.learning_pathway AS ENUM (
        'foundation',
        'pre_sat',
        'sat_advanced'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User roles within the platform
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM (
        'student',
        'tutor',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Question difficulty levels
DO $$ BEGIN
    CREATE TYPE public.difficulty_level AS ENUM (
        'easy',
        'medium',
        'hard'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Supported SAT question formats
DO $$ BEGIN
    CREATE TYPE public.question_type AS ENUM (
        'multiple_choice',
        'student_produced_response'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Diagnostic and practice assessment types
DO $$ BEGIN
    CREATE TYPE public.assessment_type AS ENUM (
        'diagnostic',
        'practice_test',
        'domain_quiz'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Assessment execution statuses
DO $$ BEGIN
    CREATE TYPE public.assessment_status AS ENUM (
        'not_started',
        'in_progress',
        'completed',
        'abandoned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Lesson completion progression
DO $$ BEGIN
    CREATE TYPE public.progress_status AS ENUM (
        'not_started',
        'in_progress',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Roadmap lifecycle statuses
DO $$ BEGIN
    CREATE TYPE public.roadmap_status AS ENUM (
        'draft',
        'active',
        'completed',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Types of actionable items in a study roadmap
DO $$ BEGIN
    CREATE TYPE public.roadmap_item_type AS ENUM (
        'lesson',
        'quiz',
        'practice_test',
        'review_session',
        'diagnostic'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Progress state of an individual roadmap item
DO $$ BEGIN
    CREATE TYPE public.roadmap_item_status AS ENUM (
        'pending',
        'in_progress',
        'completed',
        'skipped'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mini-quiz attempt status
DO $$ BEGIN
    CREATE TYPE public.quiz_attempt_status AS ENUM (
        'in_progress',
        'submitted',
        'abandoned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AI Tutor session status
DO $$ BEGIN
    CREATE TYPE public.session_status AS ENUM (
        'active',
        'closed',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Messages roles for AI dialogue
DO $$ BEGIN
    CREATE TYPE public.message_role AS ENUM (
        'user',
        'assistant',
        'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Features generating AI consumption
DO $$ BEGIN
    CREATE TYPE public.ai_feature AS ENUM (
        'tutor_chat',
        'roadmap_generation',
        'question_explanation',
        'diagnostic_analysis'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Skill mastery tier
DO $$ BEGIN
    CREATE TYPE public.mastery_level AS ENUM (
        'novice',
        'developing',
        'proficient',
        'mastered'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Utility Trigger Function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- >>> FILE: 20261101000002_create_curriculum_tables.sql <<<
-- Migration 2: Curriculum Core Tables
-- Author: SAT Platform Database Architecture Team
-- Description: Creates skills, modules, lessons, questions, quizzes, and quiz question mappings.

-- 1. Skills Taxonomy Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    code TEXT NOT NULL UNIQUE,
    subject public.app_subject NOT NULL,
    domain TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    pathway public.learning_pathway NOT NULL DEFAULT 'pre_sat',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_skill_parent_not_self CHECK (parent_id IS NULL OR parent_id <> id),
    CONSTRAINT chk_skill_code_non_empty CHECK (char_length(trim(code)) > 0),
    CONSTRAINT chk_skill_domain_non_empty CHECK (char_length(trim(domain)) > 0),
    CONSTRAINT chk_skill_name_non_empty CHECK (char_length(trim(name)) > 0)
);

COMMENT ON TABLE public.skills IS 'Hierarchical taxonomy of SAT skills across Math and Reading & Writing.';
COMMENT ON COLUMN public.skills.domain IS 'High-level official SAT domain (e.g., Algebra, Craft and Structure).';

-- 2. Lesson Modules Table (Groups lessons into thematic learning units)
CREATE TABLE IF NOT EXISTS public.lesson_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject public.app_subject NOT NULL,
    pathway public.learning_pathway NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_module_title_non_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT chk_module_slug_valid CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

COMMENT ON TABLE public.lesson_modules IS 'Curricular units grouping related lessons by subject and pathway.';

-- 3. Structured Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.lesson_modules(id) ON DELETE SET NULL,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    subject public.app_subject NOT NULL,
    pathway public.learning_pathway NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0 AND estimated_duration_minutes <= 180),
    difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_lesson_title_non_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT chk_lesson_slug_valid CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

COMMENT ON TABLE public.lessons IS 'Interactive structured lesson content with rich JSONB instructional blocks.';

-- 4. Questions Bank Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    subject public.app_subject NOT NULL,
    pathway public.learning_pathway NOT NULL DEFAULT 'pre_sat',
    difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
    question_type public.question_type NOT NULL DEFAULT 'multiple_choice',
    passage TEXT,
    prompt TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_question_prompt_non_empty CHECK (char_length(trim(prompt)) > 0),
    CONSTRAINT chk_question_correct_answer_non_empty CHECK (char_length(trim(correct_answer)) > 0),
    CONSTRAINT chk_question_explanation_non_empty CHECK (char_length(trim(explanation)) > 0)
);

COMMENT ON TABLE public.questions IS 'Master bank of practice questions, diagnostic items, and quiz questions.';

-- 5. Mini-Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
    subject public.app_subject NOT NULL,
    pathway public.learning_pathway NOT NULL DEFAULT 'pre_sat',
    title TEXT NOT NULL,
    description TEXT,
    passing_score_percent INTEGER NOT NULL DEFAULT 70 CHECK (passing_score_percent >= 0 AND passing_score_percent <= 100),
    time_limit_minutes INTEGER CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_quiz_title_non_empty CHECK (char_length(trim(title)) > 0)
);

COMMENT ON TABLE public.quizzes IS 'Formative mini-quizzes assessing understanding of specific lessons or skills.';

-- 6. Quiz Questions Junction Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
    order_index INTEGER NOT NULL DEFAULT 0 CHECK (order_index >= 0),
    points INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_quiz_question UNIQUE (quiz_id, question_id)
);

COMMENT ON TABLE public.quiz_questions IS 'Ordered relationship between quizzes and questions in the question bank.';


-- >>> FILE: 20261101000003_create_user_and_progress_tables.sql <<<
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


-- >>> FILE: 20261101000004_create_roadmaps_and_quizzes.sql <<<
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


-- >>> FILE: 20261101000005_create_tutor_and_ai_usage.sql <<<
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


-- >>> FILE: 20261101000006_create_indexes_and_constraints.sql <<<
-- Migration 6: Performance Indexes and Optimization
-- Author: SAT Platform Database Architecture Team
-- Description: Adds B-tree indexes for all foreign keys, status filters, ordering, and analytical lookups.

-- Curriculum & Questions Indexes
CREATE INDEX IF NOT EXISTS idx_skills_parent_id ON public.skills(parent_id);
CREATE INDEX IF NOT EXISTS idx_skills_subject_domain ON public.skills(subject, domain);
CREATE INDEX IF NOT EXISTS idx_skills_pathway ON public.skills(pathway);

CREATE INDEX IF NOT EXISTS idx_modules_subject_pathway ON public.lesson_modules(subject, pathway, order_index);

CREATE INDEX IF NOT EXISTS idx_lessons_skill_id ON public.lessons(skill_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_pathway ON public.lessons(subject, pathway, order_index);

CREATE INDEX IF NOT EXISTS idx_questions_skill_id ON public.questions(skill_id);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON public.questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_difficulty ON public.questions(subject, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_pathway ON public.questions(pathway);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(question_type);

CREATE INDEX IF NOT EXISTS idx_quizzes_skill_id ON public.quizzes(skill_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_pathway ON public.quizzes(subject, pathway);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_id ON public.quiz_questions(question_id);

-- User Profiles & Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_student_preferences_user_id ON public.student_preferences(user_id);

-- Assessments & Answers Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_user_id_status ON public.assessments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_assessments_user_created ON public.assessments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id ON public.assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_question_id ON public.assessment_answers(question_id);

-- Learning Progress & Mastery Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_status ON public.lesson_progress(user_id, status);

CREATE INDEX IF NOT EXISTS idx_skill_mastery_user_id ON public.student_skill_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_mastery_skill_id ON public.student_skill_mastery(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_mastery_level ON public.student_skill_mastery(user_id, mastery_level);

CREATE INDEX IF NOT EXISTS idx_study_activities_user_date ON public.study_activities(user_id, activity_date DESC);

-- Roadmaps & Roadmap Items Indexes
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_status ON public.roadmaps(user_id, status);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_roadmap_id ON public.roadmap_items(roadmap_id, order_index);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_lesson_id ON public.roadmap_items(lesson_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_quiz_id ON public.roadmap_items(quiz_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_status ON public.roadmap_items(roadmap_id, status);

-- Quiz Attempts & Answers Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id, attempt_number DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON public.quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON public.quiz_answers(question_id);

-- AI Tutor Sessions, Messages & Usage Indexes
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_user_id ON public.tutor_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_session_id ON public.tutor_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON public.ai_usage(user_id, feature, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON public.ai_usage(created_at);


-- >>> FILE: 20261101000007_create_functions_and_triggers.sql <<<
-- Migration 7: Database Functions, Triggers, and Authoritative Scoring RPCs
-- Author: SAT Platform Database Architecture Team
-- Description: Contains business logic, lifecycle triggers, role protection, and authoritative grading functions.

-- ==============================================================================
-- 1. Automatic updated_at Triggers
-- ==============================================================================

CREATE TRIGGER trg_skills_updated_at BEFORE UPDATE ON public.skills
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_lesson_modules_updated_at BEFORE UPDATE ON public.lesson_modules
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON public.lessons
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_quizzes_updated_at BEFORE UPDATE ON public.quizzes
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_student_preferences_updated_at BEFORE UPDATE ON public.student_preferences
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_assessments_updated_at BEFORE UPDATE ON public.assessments
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_assessment_answers_updated_at BEFORE UPDATE ON public.assessment_answers
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_student_skill_mastery_updated_at BEFORE UPDATE ON public.student_skill_mastery
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_roadmaps_updated_at BEFORE UPDATE ON public.roadmaps
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_roadmap_items_updated_at BEFORE UPDATE ON public.roadmap_items
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_quiz_attempts_updated_at BEFORE UPDATE ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trg_tutor_sessions_updated_at BEFORE UPDATE ON public.tutor_sessions
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ==============================================================================
-- 2. Auth User Initialization Trigger
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
BEGIN
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Create user profile with student role
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        role,
        starting_level
    ) VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        NEW.raw_user_meta_data->>'avatar_url',
        'student',
        'pre_sat'
    ) ON CONFLICT (id) DO NOTHING;

    -- Create default student study preferences
    INSERT INTO public.student_preferences (
        user_id,
        weekly_study_hours_budget,
        preferred_study_days,
        reminder_notifications,
        email_notifications,
        theme,
        preferred_pathway
    ) VALUES (
        NEW.id,
        5.0,
        ARRAY['monday', 'wednesday', 'saturday']::TEXT[],
        true,
        true,
        'system',
        'pre_sat'
    ) ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Connect trigger to Supabase auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. Privilege Escalation Guard Trigger
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_executing_role TEXT;
    v_is_admin BOOLEAN := false;
BEGIN
    -- Check executing role from auth context
    v_executing_role := auth.role();

    -- Service role can perform any administrative updates
    IF v_executing_role = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- Check if calling user is an existing admin
    IF auth.uid() IS NOT NULL THEN
        SELECT (role = 'admin') INTO v_is_admin
        FROM public.profiles
        WHERE id = auth.uid();
    END IF;

    -- If a non-admin user attempts to alter their role, block the transaction
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT COALESCE(v_is_admin, false) THEN
        RAISE EXCEPTION 'Unauthorized: Standard users cannot alter account roles or permissions.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ==============================================================================
-- 4. Authoritative Quiz Submission & Grading Function
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
    p_attempt_id UUID,
    p_answers JSONB -- Array of {"question_id": "uuid", "user_answer": "text", "time_spent_seconds": 15}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_quiz_id UUID;
    v_passing_score INT;
    v_attempt_status public.quiz_attempt_status;
    v_item JSONB;
    v_q_id UUID;
    v_ans TEXT;
    v_q_time INT;
    v_correct_ans TEXT;
    v_is_correct BOOLEAN;
    v_points INT;
    v_total_points_earned INT := 0;
    v_total_max_points INT := 0;
    v_pct NUMERIC(5, 2);
    v_passed BOOLEAN;
    v_skill_id UUID;
    v_attempt_time INT := 0;
BEGIN
    -- Verify caller ownership
    SELECT user_id, quiz_id, status INTO v_user_id, v_quiz_id, v_attempt_status
    FROM public.quiz_attempts
    WHERE id = p_attempt_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quiz attempt % not found.', p_attempt_id;
    END IF;

    IF v_user_id <> auth.uid() AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: You do not own this quiz attempt.';
    END IF;

    IF v_attempt_status = 'submitted' THEN
        RAISE EXCEPTION 'Quiz attempt has already been submitted and scored.';
    END IF;

    SELECT passing_score_percent, skill_id INTO v_passing_score, v_skill_id
    FROM public.quizzes
    WHERE id = v_quiz_id;

    -- Process submitted answers
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_q_id := (v_item->>'question_id')::UUID;
        v_ans := trim(v_item->>'user_answer');
        v_q_time := COALESCE((v_item->>'time_spent_seconds')::INT, 0);
        v_attempt_time := v_attempt_time + v_q_time;

        -- Fetch official correct answer and configured question points
        SELECT q.correct_answer, COALESCE(qq.points, 1)
        INTO v_correct_ans, v_points
        FROM public.questions q
        JOIN public.quiz_questions qq ON qq.question_id = q.id AND qq.quiz_id = v_quiz_id
        WHERE q.id = v_q_id;

        IF FOUND THEN
            v_total_max_points := v_total_max_points + v_points;
            v_is_correct := (lower(v_ans) = lower(trim(v_correct_ans)));
            
            IF v_is_correct THEN
                v_total_points_earned := v_total_points_earned + v_points;
            END IF;

            -- Record authoritative answer
            INSERT INTO public.quiz_answers (
                attempt_id,
                question_id,
                user_answer,
                is_correct,
                points_awarded,
                time_spent_seconds
            ) VALUES (
                p_attempt_id,
                v_q_id,
                v_ans,
                v_is_correct,
                CASE WHEN v_is_correct THEN v_points ELSE 0 END,
                v_q_time
            ) ON CONFLICT (attempt_id, question_id) DO UPDATE SET
                user_answer = EXCLUDED.user_answer,
                is_correct = EXCLUDED.is_correct,
                points_awarded = EXCLUDED.points_awarded,
                time_spent_seconds = EXCLUDED.time_spent_seconds;
        END IF;
    END LOOP;

    -- Calculate final score
    IF v_total_max_points > 0 THEN
        v_pct := round((v_total_points_earned::NUMERIC / v_total_max_points::NUMERIC) * 100.0, 2);
    ELSE
        v_pct := 0.00;
    END IF;

    v_passed := (v_pct >= v_passing_score);

    -- Update attempt status
    UPDATE public.quiz_attempts SET
        status = 'submitted',
        score = v_total_points_earned,
        max_score = v_total_max_points,
        score_percentage = v_pct,
        passed = v_passed,
        submitted_at = now(),
        time_spent_seconds = v_attempt_time
    WHERE id = p_attempt_id;

    -- Update student skill mastery
    IF v_skill_id IS NOT NULL THEN
        INSERT INTO public.student_skill_mastery (
            user_id,
            skill_id,
            mastery_level,
            mastery_score,
            questions_attempted,
            questions_correct,
            last_practiced_at
        ) VALUES (
            v_user_id,
            v_skill_id,
            CASE 
                WHEN v_pct >= 90 THEN 'mastered'::public.mastery_level
                WHEN v_pct >= 75 THEN 'proficient'::public.mastery_level
                WHEN v_pct >= 50 THEN 'developing'::public.mastery_level
                ELSE 'novice'::public.mastery_level
            END,
            v_pct,
            v_total_max_points,
            v_total_points_earned,
            now()
        ) ON CONFLICT (user_id, skill_id) DO UPDATE SET
            mastery_score = round((student_skill_mastery.mastery_score * 0.4 + v_pct * 0.6), 2),
            questions_attempted = student_skill_mastery.questions_attempted + v_total_max_points,
            questions_correct = student_skill_mastery.questions_correct + v_total_points_earned,
            mastery_level = CASE 
                WHEN (student_skill_mastery.mastery_score * 0.4 + v_pct * 0.6) >= 90 THEN 'mastered'::public.mastery_level
                WHEN (student_skill_mastery.mastery_score * 0.4 + v_pct * 0.6) >= 75 THEN 'proficient'::public.mastery_level
                WHEN (student_skill_mastery.mastery_score * 0.4 + v_pct * 0.6) >= 50 THEN 'developing'::public.mastery_level
                ELSE 'novice'::public.mastery_level
            END,
            last_practiced_at = now();
    END IF;

    -- Log study activity
    INSERT INTO public.study_activities (
        user_id,
        activity_type,
        reference_id,
        duration_seconds,
        metadata
    ) VALUES (
        v_user_id,
        'quiz',
        v_quiz_id,
        v_attempt_time,
        jsonb_build_object('score_percentage', v_pct, 'passed', v_passed, 'attempt_id', p_attempt_id)
    );

    RETURN jsonb_build_object(
        'attempt_id', p_attempt_id,
        'score', v_total_points_earned,
        'max_score', v_total_max_points,
        'score_percentage', v_pct,
        'passed', v_passed,
        'status', 'submitted'
    );
END;
$$;

-- ==============================================================================
-- 5. Authoritative Assessment Scoring & Pathway Recommendation Function
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_assessment(
    p_assessment_id UUID,
    p_answers JSONB -- Array of {"question_id": "uuid", "user_answer": "text", "time_spent_seconds": 20}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_assessment_type public.assessment_type;
    v_status public.assessment_status;
    v_item JSONB;
    v_q_id UUID;
    v_ans TEXT;
    v_q_time INT;
    v_q_subject public.app_subject;
    v_q_skill_id UUID;
    v_correct_ans TEXT;
    v_is_correct BOOLEAN;
    v_math_correct INT := 0;
    v_math_total INT := 0;
    v_rw_correct INT := 0;
    v_rw_total INT := 0;
    v_scaled_math INT;
    v_scaled_rw INT;
    v_total_score INT;
    v_recommended_pathway public.learning_pathway;
    v_total_time INT := 0;
    v_results JSONB;
BEGIN
    SELECT user_id, assessment_type, status INTO v_user_id, v_assessment_type, v_status
    FROM public.assessments
    WHERE id = p_assessment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Assessment % not found.', p_assessment_id;
    END IF;

    IF v_user_id <> auth.uid() AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: You do not own this assessment session.';
    END IF;

    IF v_status = 'completed' THEN
        RAISE EXCEPTION 'Assessment has already been completed and finalized.';
    END IF;

    -- Process answers
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_q_id := (v_item->>'question_id')::UUID;
        v_ans := trim(v_item->>'user_answer');
        v_q_time := COALESCE((v_item->>'time_spent_seconds')::INT, 0);
        v_total_time := v_total_time + v_q_time;

        SELECT subject, skill_id, correct_answer INTO v_q_subject, v_q_skill_id, v_correct_ans
        FROM public.questions
        WHERE id = v_q_id;

        IF FOUND THEN
            v_is_correct := (lower(v_ans) = lower(trim(v_correct_ans)));

            IF v_q_subject = 'math' THEN
                v_math_total := v_math_total + 1;
                IF v_is_correct THEN
                    v_math_correct := v_math_correct + 1;
                END IF;
            ELSE
                v_rw_total := v_rw_total + 1;
                IF v_is_correct THEN
                    v_rw_correct := v_rw_correct + 1;
                END IF;
            END IF;

            INSERT INTO public.assessment_answers (
                assessment_id,
                question_id,
                user_answer,
                is_correct,
                time_spent_seconds
            ) VALUES (
                p_assessment_id,
                v_q_id,
                v_ans,
                v_is_correct,
                v_q_time
            ) ON CONFLICT (assessment_id, question_id) DO UPDATE SET
                user_answer = EXCLUDED.user_answer,
                is_correct = EXCLUDED.is_correct,
                time_spent_seconds = EXCLUDED.time_spent_seconds;
        END IF;
    END LOOP;

    -- Calculate scaled SAT scores (Scale 200 - 800 per section)
    IF v_math_total > 0 THEN
        v_scaled_math := 200 + round((v_math_correct::NUMERIC / v_math_total::NUMERIC) * 600.0);
    ELSE
        v_scaled_math := 400;
    END IF;

    IF v_rw_total > 0 THEN
        v_scaled_rw := 200 + round((v_rw_correct::NUMERIC / v_rw_total::NUMERIC) * 600.0);
    ELSE
        v_scaled_rw := 400;
    END IF;

    v_total_score := v_scaled_math + v_scaled_rw;

    -- Map total diagnostic score to recommended SAT learning pathway
    IF v_total_score < 1000 THEN
        v_recommended_pathway := 'foundation';
    ELSIF v_total_score < 1300 THEN
        v_recommended_pathway := 'pre_sat';
    ELSE
        v_recommended_pathway := 'sat_advanced';
    END IF;

    v_results := jsonb_build_object(
        'recommended_pathway', v_recommended_pathway,
        'math_correct', v_math_correct,
        'math_total', v_math_total,
        'rw_correct', v_rw_correct,
        'rw_total', v_rw_total,
        'raw_percentage', round(((v_math_correct + v_rw_correct)::NUMERIC / GREATEST((v_math_total + v_rw_total), 1)::NUMERIC) * 100.0, 2)
    );

    -- Update assessment
    UPDATE public.assessments SET
        status = 'completed',
        total_questions = (v_math_total + v_rw_total),
        answered_questions = (v_math_total + v_rw_total),
        total_score = v_total_score,
        math_score = v_scaled_math,
        rw_score = v_scaled_rw,
        pathway = v_recommended_pathway,
        time_spent_seconds = v_total_time,
        diagnostic_results = v_results,
        completed_at = now()
    WHERE id = p_assessment_id;

    -- If this is an initial diagnostic, update starting_level on profile
    IF v_assessment_type = 'diagnostic' THEN
        UPDATE public.profiles SET
            starting_level = v_recommended_pathway
        WHERE id = v_user_id;

        UPDATE public.student_preferences SET
            preferred_pathway = v_recommended_pathway
        WHERE user_id = v_user_id;
    END IF;

    -- Record study activity
    INSERT INTO public.study_activities (
        user_id,
        activity_type,
        reference_id,
        duration_seconds,
        metadata
    ) VALUES (
        v_user_id,
        'diagnostic',
        p_assessment_id,
        v_total_time,
        v_results
    );

    RETURN jsonb_build_object(
        'assessment_id', p_assessment_id,
        'total_score', v_total_score,
        'math_score', v_scaled_math,
        'rw_score', v_scaled_rw,
        'recommended_pathway', v_recommended_pathway,
        'status', 'completed'
    );
END;
$$;

-- ==============================================================================
-- 6. Active Roadmap Lifecycle Management Function
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.activate_roadmap(p_roadmap_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT user_id INTO v_user_id
    FROM public.roadmaps
    WHERE id = p_roadmap_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Roadmap % not found.', p_roadmap_id;
    END IF;

    IF v_user_id <> auth.uid() AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: You do not own this roadmap.';
    END IF;

    -- Safely archive existing active roadmaps preserving all history
    UPDATE public.roadmaps SET
        is_active = false,
        status = CASE WHEN status = 'completed' THEN 'completed' ELSE 'archived' END
    WHERE user_id = v_user_id AND is_active = true AND id <> p_roadmap_id;

    -- Activate target roadmap
    UPDATE public.roadmaps SET
        is_active = true,
        status = 'active'
    WHERE id = p_roadmap_id;
END;
$$;

-- ==============================================================================
-- 7. Resumable Lesson Progress Updater Function
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.save_lesson_progress(
    p_lesson_id UUID,
    p_status public.progress_status,
    p_progress_percent INT,
    p_last_step_index INT,
    p_time_spent_delta_seconds INT,
    p_notes TEXT DEFAULT NULL
)
RETURNS public.lesson_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_result public.lesson_progress;
    v_is_completing BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to save lesson progress.';
    END IF;

    v_is_completing := (p_status = 'completed' OR p_progress_percent = 100);

    INSERT INTO public.lesson_progress (
        user_id,
        lesson_id,
        status,
        progress_percent,
        last_step_index,
        time_spent_seconds,
        notes,
        started_at,
        completed_at
    ) VALUES (
        v_user_id,
        p_lesson_id,
        CASE WHEN v_is_completing THEN 'completed'::public.progress_status ELSE p_status END,
        p_progress_percent,
        p_last_step_index,
        GREATEST(p_time_spent_delta_seconds, 0),
        p_notes,
        now(),
        CASE WHEN v_is_completing THEN now() ELSE NULL END
    ) ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        status = CASE 
            WHEN lesson_progress.status = 'completed' THEN 'completed'::public.progress_status
            WHEN v_is_completing THEN 'completed'::public.progress_status 
            ELSE EXCLUDED.status 
        END,
        progress_percent = GREATEST(lesson_progress.progress_percent, EXCLUDED.progress_percent),
        last_step_index = EXCLUDED.last_step_index,
        time_spent_seconds = lesson_progress.time_spent_seconds + EXCLUDED.time_spent_seconds,
        notes = COALESCE(EXCLUDED.notes, lesson_progress.notes),
        completed_at = CASE 
            WHEN lesson_progress.completed_at IS NOT NULL THEN lesson_progress.completed_at
            WHEN v_is_completing THEN now()
            ELSE NULL
        END
    RETURNING * INTO v_result;

    -- If completed, mark corresponding roadmap item in student's active roadmap as completed
    IF v_is_completing THEN
        UPDATE public.roadmap_items ri SET
            status = 'completed',
            completed_at = now()
        FROM public.roadmaps r
        WHERE ri.roadmap_id = r.id
          AND r.user_id = v_user_id
          AND r.is_active = true
          AND ri.lesson_id = p_lesson_id
          AND ri.status <> 'completed';
    END IF;

    -- Record study activity time
    IF p_time_spent_delta_seconds > 0 THEN
        INSERT INTO public.study_activities (
            user_id,
            activity_type,
            reference_id,
            duration_seconds,
            metadata
        ) VALUES (
            v_user_id,
            'lesson',
            p_lesson_id,
            p_time_spent_delta_seconds,
            jsonb_build_object('status', v_result.status, 'progress_percent', v_result.progress_percent)
        );
    END IF;

    RETURN v_result;
END;
$$;

-- ==============================================================================
-- 8. Backend AI Usage Audit Logging Function
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.log_ai_consumption(
    p_user_id UUID,
    p_feature public.ai_feature,
    p_model TEXT,
    p_prompt_tokens INT,
    p_completion_tokens INT,
    p_duration_ms INT DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_usage_id UUID;
BEGIN
    INSERT INTO public.ai_usage (
        user_id,
        session_id,
        feature,
        model,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        request_duration_ms,
        metadata
    ) VALUES (
        p_user_id,
        p_session_id,
        p_feature,
        p_model,
        GREATEST(p_prompt_tokens, 0),
        GREATEST(p_completion_tokens, 0),
        (GREATEST(p_prompt_tokens, 0) + GREATEST(p_completion_tokens, 0)),
        p_duration_ms,
        COALESCE(p_metadata, '{}'::jsonb)
    ) RETURNING id INTO v_usage_id;

    RETURN v_usage_id;
END;
$$;


-- >>> FILE: 20261101000008_create_row_level_security.sql <<<
-- Migration 8: Comprehensive Row Level Security (RLS) Policies
-- Author: SAT Platform Database Architecture Team
-- Description: Enables RLS on all 20 tables and applies granular, least-privilege security policies.

-- Helper function to check if the current user has the admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- ==============================================================================
-- 1. Enable RLS on All Tables
-- ==============================================================================

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_activities ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. Curriculum Tables Policies (Read-only for students, writable by admins)
-- ==============================================================================

-- skills
CREATE POLICY "skills_select_published"
    ON public.skills FOR SELECT
    USING (is_published = true OR public.is_admin());

CREATE POLICY "skills_admin_all"
    ON public.skills FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- lesson_modules
CREATE POLICY "lesson_modules_select_published"
    ON public.lesson_modules FOR SELECT
    USING (is_published = true OR public.is_admin());

CREATE POLICY "lesson_modules_admin_all"
    ON public.lesson_modules FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- lessons
CREATE POLICY "lessons_select_published"
    ON public.lessons FOR SELECT
    USING (is_published = true OR public.is_admin());

CREATE POLICY "lessons_admin_all"
    ON public.lessons FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- questions
CREATE POLICY "questions_select_published"
    ON public.questions FOR SELECT
    USING (is_published = true OR public.is_admin());

CREATE POLICY "questions_admin_all"
    ON public.questions FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- quizzes
CREATE POLICY "quizzes_select_published"
    ON public.quizzes FOR SELECT
    USING (is_published = true OR public.is_admin());

CREATE POLICY "quizzes_admin_all"
    ON public.quizzes FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- quiz_questions
CREATE POLICY "quiz_questions_select_published"
    ON public.quiz_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_questions.quiz_id
              AND (q.is_published = true OR public.is_admin())
        )
    );

CREATE POLICY "quiz_questions_admin_all"
    ON public.quiz_questions FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 3. Profiles and Preferences Policies
-- ==============================================================================

-- profiles
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- student_preferences
CREATE POLICY "preferences_select_own"
    ON public.student_preferences FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "preferences_insert_own"
    ON public.student_preferences FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_update_own"
    ON public.student_preferences FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- 4. Assessments & Answers Policies
-- ==============================================================================

-- assessments
CREATE POLICY "assessments_select_own"
    ON public.assessments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "assessments_insert_own"
    ON public.assessments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "assessments_update_own"
    ON public.assessments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "assessments_delete_own"
    ON public.assessments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- assessment_answers
CREATE POLICY "assessment_answers_select_own"
    ON public.assessment_answers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assessments a
            WHERE a.id = assessment_answers.assessment_id
              AND (a.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "assessment_answers_insert_own"
    ON public.assessment_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.assessments a
            WHERE a.id = assessment_answers.assessment_id
              AND a.user_id = auth.uid()
              AND a.status IN ('not_started', 'in_progress')
        )
    );

CREATE POLICY "assessment_answers_update_own"
    ON public.assessment_answers FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.assessments a
            WHERE a.id = assessment_answers.assessment_id
              AND a.user_id = auth.uid()
              AND a.status IN ('not_started', 'in_progress')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.assessments a
            WHERE a.id = assessment_answers.assessment_id
              AND a.user_id = auth.uid()
              AND a.status IN ('not_started', 'in_progress')
        )
    );

-- ==============================================================================
-- 5. Learning Progress, Mastery, and Activity Policies
-- ==============================================================================

-- lesson_progress
CREATE POLICY "lesson_progress_select_own"
    ON public.lesson_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "lesson_progress_insert_own"
    ON public.lesson_progress FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lesson_progress_update_own"
    ON public.lesson_progress FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- student_skill_mastery (Read-only for students; updated via authoritative functions)
CREATE POLICY "skill_mastery_select_own"
    ON public.student_skill_mastery FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "skill_mastery_admin_all"
    ON public.student_skill_mastery FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- study_activities
CREATE POLICY "study_activities_select_own"
    ON public.study_activities FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "study_activities_insert_own"
    ON public.study_activities FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 6. Roadmaps & Roadmap Items Policies
-- ==============================================================================

-- roadmaps
CREATE POLICY "roadmaps_select_own"
    ON public.roadmaps FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "roadmaps_insert_own"
    ON public.roadmaps FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "roadmaps_update_own"
    ON public.roadmaps FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "roadmaps_delete_own"
    ON public.roadmaps FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- roadmap_items
CREATE POLICY "roadmap_items_select_own"
    ON public.roadmap_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps r
            WHERE r.id = roadmap_items.roadmap_id
              AND (r.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "roadmap_items_insert_own"
    ON public.roadmap_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roadmaps r
            WHERE r.id = roadmap_items.roadmap_id
              AND (r.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "roadmap_items_update_own"
    ON public.roadmap_items FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps r
            WHERE r.id = roadmap_items.roadmap_id
              AND (r.user_id = auth.uid() OR public.is_admin())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roadmaps r
            WHERE r.id = roadmap_items.roadmap_id
              AND (r.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "roadmap_items_delete_own"
    ON public.roadmap_items FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps r
            WHERE r.id = roadmap_items.roadmap_id
              AND (r.user_id = auth.uid() OR public.is_admin())
        )
    );

-- ==============================================================================
-- 7. Quiz Attempts & Answers Policies
-- ==============================================================================

-- quiz_attempts
CREATE POLICY "quiz_attempts_select_own"
    ON public.quiz_attempts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "quiz_attempts_insert_own"
    ON public.quiz_attempts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_update_own"
    ON public.quiz_attempts FOR UPDATE
    TO authenticated
    USING ((auth.uid() = user_id AND status = 'in_progress') OR public.is_admin())
    WITH CHECK ((auth.uid() = user_id AND status = 'in_progress') OR public.is_admin());

-- quiz_answers
CREATE POLICY "quiz_answers_select_own"
    ON public.quiz_answers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            WHERE qa.id = quiz_answers.attempt_id
              AND (qa.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "quiz_answers_insert_own"
    ON public.quiz_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            WHERE qa.id = quiz_answers.attempt_id
              AND qa.user_id = auth.uid()
              AND qa.status = 'in_progress'
        )
    );

-- ==============================================================================
-- 8. AI Tutor Sessions, Messages & Usage Policies
-- ==============================================================================

-- tutor_sessions
CREATE POLICY "tutor_sessions_select_own"
    ON public.tutor_sessions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "tutor_sessions_insert_own"
    ON public.tutor_sessions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tutor_sessions_update_own"
    ON public.tutor_sessions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "tutor_sessions_delete_own"
    ON public.tutor_sessions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- tutor_messages
CREATE POLICY "tutor_messages_select_own"
    ON public.tutor_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tutor_sessions ts
            WHERE ts.id = tutor_messages.session_id
              AND (ts.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "tutor_messages_insert_own"
    ON public.tutor_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_role = 'user' AND
        EXISTS (
            SELECT 1 FROM public.tutor_sessions ts
            WHERE ts.id = tutor_messages.session_id
              AND ts.user_id = auth.uid()
              AND ts.status = 'active'
        )
    );

-- ai_usage (Immutable audit log: student can view their own tokens, no client insert/update)
CREATE POLICY "ai_usage_select_own"
    ON public.ai_usage FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "ai_usage_admin_all"
    ON public.ai_usage FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- >>> FILE: seed.sql <<<
-- Supabase Seed Data for SAT Learning Platform
-- Curriculum Seed: Skills, Modules, Lessons, Questions, Quizzes, and Question Mappings.
-- Note: Contains only original curriculum content. No fake student accounts or user progress.

-- ==============================================================================
-- 1. ROOT SKILLS (Domains)
-- ==============================================================================

-- Math Root Domains
INSERT INTO public.skills (id, parent_id, code, subject, domain, name, description, pathway, order_index, is_published)
VALUES
    ('10000000-0000-0000-0000-000000000001', NULL, 'MATH_ALG_ROOT', 'math', 'Algebra', 'Algebra (Domain)', 'Linear equations, inequalities, systems of equations, and algebraic representation.', 'foundation', 1, true),
    ('10000000-0000-0000-0000-000000000002', NULL, 'MATH_ADV_ROOT', 'math', 'Advanced Math', 'Advanced Math (Domain)', 'Equivalent expressions, quadratic and exponential equations, polynomial factors, and function notation.', 'pre_sat', 2, true),
    ('10000000-0000-0000-0000-000000000003', NULL, 'MATH_PSDA_ROOT', 'math', 'Problem Solving and Data Analysis', 'Problem Solving and Data Analysis (Domain)', 'Ratios, rates, percentages, unit conversions, data interpretation, and statistical inference.', 'foundation', 3, true),
    ('10000000-0000-0000-0000-000000000004', NULL, 'MATH_GEOM_ROOT', 'math', 'Geometry and Trigonometry', 'Geometry and Trigonometry (Domain)', 'Area, volume, angles, triangles, trigonometry, and circle theorems.', 'pre_sat', 4, true)
ON CONFLICT (code) DO NOTHING;

-- Reading & Writing Root Domains
INSERT INTO public.skills (id, parent_id, code, subject, domain, name, description, pathway, order_index, is_published)
VALUES
    ('10000000-0000-0000-0000-000000000005', NULL, 'RW_INFO_ROOT', 'reading_writing', 'Information and Ideas', 'Information and Ideas (Domain)', 'Locating, interpreting, evaluating, and integrating information from informational and literary texts.', 'foundation', 5, true),
    ('10000000-0000-0000-0000-000000000006', NULL, 'RW_CRAFT_ROOT', 'reading_writing', 'Craft and Structure', 'Craft and Structure (Domain)', 'Determining word meanings in context, rhetorical purpose, text structure, and cross-text relationships.', 'pre_sat', 6, true),
    ('10000000-0000-0000-0000-000000000007', NULL, 'RW_EXPR_ROOT', 'reading_writing', 'Expression of Ideas', 'Expression of Ideas (Domain)', 'Revising text for rhetorical effectiveness, transitional logic, and cohesive flow.', 'foundation', 7, true),
    ('10000000-0000-0000-0000-000000000008', NULL, 'RW_SEC_ROOT', 'reading_writing', 'Standard English Conventions', 'Standard English Conventions (Domain)', 'Sentence boundaries, agreement, punctuation conventions, and grammatical structures.', 'foundation', 8, true)
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 2. CHILD SKILLS (Sub-skills)
-- ==============================================================================

-- Math Child Skills
INSERT INTO public.skills (id, parent_id, code, subject, domain, name, description, pathway, order_index, is_published)
VALUES
    ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'MATH_ALG_LIN_ONE', 'math', 'Algebra', 'Linear Equations in One Variable', 'Solving single-variable linear equations, zero/infinite solutions, and absolute value expressions.', 'foundation', 10, true),
    ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'MATH_ALG_SYSTEMS', 'math', 'Algebra', 'Linear Systems and Modeling', 'Solving 2x2 systems of linear equations and contextual real-world constraint models.', 'pre_sat', 11, true),
    ('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'MATH_ADV_QUADRATICS', 'math', 'Advanced Math', 'Quadratic Equations & Parabolas', 'Factoring, quadratic formula, vertex forms, and parabola vertex/zeros properties.', 'pre_sat', 20, true),
    ('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'MATH_ADV_NONLINEAR', 'math', 'Advanced Math', 'Nonlinear Functions & Exponential Growth', 'Exponential growth/decay models, radical expressions, and composite function analysis.', 'sat_advanced', 21, true),
    ('11000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'MATH_PSDA_RATIOS', 'math', 'Problem Solving and Data Analysis', 'Ratios, Proportions & Percentages', 'Unit analysis, percent increase/decrease, scale factors, and mixture proportions.', 'foundation', 30, true),
    ('11000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'MATH_PSDA_STATS', 'math', 'Problem Solving and Data Analysis', 'Data Distributions & Statistics', 'Mean, median, standard deviation, box plots, and margin of error in observational studies.', 'pre_sat', 31, true),
    ('11000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'MATH_GEOM_CIRCLES', 'math', 'Geometry and Trigonometry', 'Circle Theorems and Equations', 'Circle equation in standard form, arc lengths, sector areas, and radian conversions.', 'pre_sat', 40, true),
    ('11000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'MATH_GEOM_TRIG', 'math', 'Geometry and Trigonometry', 'Right Triangle Trigonometry', 'Sine, cosine, tangent ratios, complementary angles, and special right triangles.', 'sat_advanced', 41, true)
ON CONFLICT (code) DO NOTHING;

-- Reading & Writing Child Skills
INSERT INTO public.skills (id, parent_id, code, subject, domain, name, description, pathway, order_index, is_published)
VALUES
    ('11000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'RW_INFO_CENTRAL_CLAIM', 'reading_writing', 'Information and Ideas', 'Central Ideas and Textual Evidence', 'Evaluating authors core arguments, identifying textual evidence, and interpreting scientific tables.', 'foundation', 50, true),
    ('11000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'RW_INFO_INFERENCES', 'reading_writing', 'Information and Ideas', 'Logical Inferences and Conclusions', 'Completing the logical progression of an academic passage using supported empirical findings.', 'pre_sat', 51, true),
    ('11000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', 'RW_CRAFT_VOCAB_CONTEXT', 'reading_writing', 'Craft and Structure', 'Words and Phrases in Context', 'Determining exact nuance and collegiate definitions of vocabulary conditioned by context.', 'foundation', 60, true),
    ('11000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', 'RW_CRAFT_CROSS_TEXT', 'reading_writing', 'Craft and Structure', 'Cross-Text Connections (Paired Passages)', 'Comparing perspectives, synthesis of conflicting claims, and scholarly rebuttals between paired texts.', 'sat_advanced', 61, true),
    ('11000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000007', 'RW_EXPR_TRANSITIONS', 'reading_writing', 'Expression of Ideas', 'Rhetorical Transitions and Cohesion', 'Selecting precise contrastive, causative, sequential, or elaborative logical connective words.', 'foundation', 70, true),
    ('11000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000007', 'RW_EXPR_RHETORICAL_SYN', 'reading_writing', 'Expression of Ideas', 'Rhetorical Synthesis and Note Integration', 'Synthesizing bulleted research notes to accomplish specific communicative or persuasive goals.', 'pre_sat', 71, true),
    ('11000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000008', 'RW_SEC_BOUNDARIES', 'reading_writing', 'Standard English Conventions', 'Sentence Boundaries and Punctuation', 'Correcting comma splices, run-ons, fragments, and proper use of semicolons, colons, and dashes.', 'foundation', 80, true),
    ('11000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000008', 'RW_SEC_AGREEMENT', 'reading_writing', 'Standard English Conventions', 'Subject-Verb & Pronoun Agreement', 'Identifying complex interrupted subjects, plural/singular consistency, and ambiguous pronoun reference.', 'pre_sat', 81, true)
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 3. CURRICULUM MODULES
-- ==============================================================================

INSERT INTO public.lesson_modules (id, subject, pathway, title, slug, description, order_index, is_published)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'math', 'foundation', 'Algebra Essentials: Linear Equations', 'algebra-essentials-linear-equations', 'Master the foundational mechanics of single-variable equations, isolating terms, and interpreting zero/infinite solutions.', 1, true),
    ('20000000-0000-0000-0000-000000000002', 'math', 'pre_sat', 'Systems of Equations & Coordinate Geometry', 'systems-equations-coordinate-geometry', 'Solve simultaneous 2-variable systems using substitution, elimination, and geometric intersection logic.', 2, true),
    ('20000000-0000-0000-0000-000000000003', 'math', 'sat_advanced', 'Advanced Polynomials, Quadratics & Vertex Form', 'advanced-polynomials-quadratics-vertex', 'Deep dive into vertex forms, discriminant analyses, and high-degree polynomial factor theorems.', 3, true),
    ('20000000-0000-0000-0000-000000000004', 'reading_writing', 'foundation', 'Grammar Core: Boundaries & Punctuation', 'grammar-core-boundaries-punctuation', 'Rule sets for independent clauses, semicolons, relative clauses, and nonessential modifiers.', 4, true),
    ('20000000-0000-0000-0000-000000000005', 'reading_writing', 'pre_sat', 'Rhetorical Flow: Transitions & Synthesis', 'rhetorical-flow-transitions-synthesis', 'Selecting transitional discourse markers and synthesizing student research notes with surgical precision.', 5, true),
    ('20000000-0000-0000-0000-000000000006', 'reading_writing', 'sat_advanced', 'Critical Analysis: Paired Passages & Inferences', 'critical-analysis-paired-passages', 'Complex cross-text reasoning, scholarly critique, and advanced argument modeling on the digital SAT.', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 4. STRUCTURED LESSONS
-- ==============================================================================

INSERT INTO public.lessons (id, module_id, skill_id, subject, pathway, title, slug, summary, content, estimated_duration_minutes, difficulty, order_index, is_published)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        '11000000-0000-0000-0000-000000000001',
        'math',
        'foundation',
        'Solving Single-Variable Linear Equations',
        'solving-single-variable-linear-equations',
        'Learn the core techniques of combining like terms, distributing constants, and determining solution multiplicity.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. The Anatomy of a Linear Equation',
                    'content', 'A linear equation in one variable can always be manipulated into the form ax + b = c. When solving, reverse operations apply symmetrically to both sides.'
                ),
                jsonb_build_object(
                    'title', '2. Special Solution Cases',
                    'content', 'On the SAT, you will frequently be asked whether an equation has one solution, no solution, or infinitely many solutions. If ax + b = cx + d: (1) One solution if a != c; (2) No solution if a = c and b != d; (3) Infinitely many solutions if a = c and b = d.'
                ),
                jsonb_build_object(
                    'title', '3. Worked Example',
                    'content', 'Example: For what value of k does 3(2x - 4) = kx - 12 have infinitely many solutions? Distribute: 6x - 12 = kx - 12. For identity equality, matching coefficients yields k = 6.'
                )
            ),
            'key_takeaways', jsonb_build_array('Always expand and group like terms', 'Identity equations have identical coefficients on both sides', 'Contradictory equations have matching x coefficients but different constants')
        ),
        25,
        'easy',
        1,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002',
        '11000000-0000-0000-0000-000000000002',
        'math',
        'pre_sat',
        'Systems of Linear Equations in SAT Contexts',
        'systems-linear-equations-sat-contexts',
        'Techniques for rapid elimination, substitution, and geometric interpretation of parallel versus intersecting lines.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. Elimination vs Substitution',
                    'content', 'Choose elimination when standard form Ax + By = C is present for both equations. Choose substitution when one variable has a coefficient of 1 or -1.'
                ),
                jsonb_build_object(
                    'title', '2. Geometric Meaning of Solutions',
                    'content', 'A solution to a system is the coordinates (x, y) where lines intersect. Parallel lines have equal slopes (m1 = m2) and distinct intercepts, yielding zero solutions.'
                )
            ),
            'key_takeaways', jsonb_build_array('Check slopes immediately when asked about no solution', 'Look for shortcuts like adding both equations directly when asked for (x + y)')
        ),
        30,
        'medium',
        2,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000003',
        '11000000-0000-0000-0000-000000000003',
        'math',
        'sat_advanced',
        'Quadratic Vertex Form & Optimization',
        'quadratic-vertex-form-optimization',
        'Mastering the vertex form y = a(x - h)^2 + k, axis of symmetry, and identifying maximums/minimums in contextual word problems.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. The Three Quadratic Forms',
                    'content', 'Standard Form: y = ax^2 + bx + c reveals the y-intercept (0, c). Factored Form: y = a(x - r1)(x - r2) reveals the x-intercepts r1 and r2. Vertex Form: y = a(x - h)^2 + k reveals the vertex coordinates (h, k) without any computation.'
                ),
                jsonb_build_object(
                    'title', '2. Finding Extrema in Word Problems',
                    'content', 'Whenever a question asks for the minimum cost, maximum height, or peak profit, it is asking for the vertex! The x-coordinate is h = -b / (2a), and the maximum/minimum value itself is the y-coordinate k.'
                )
            ),
            'key_takeaways', jsonb_build_array('Vertex form displays max/min as constants', 'Axis of symmetry is midway between the zeros: h = (r1 + r2) / 2')
        ),
        35,
        'hard',
        3,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000004',
        '20000000-0000-0000-0000-000000000004',
        '11000000-0000-0000-0000-000000000015',
        'reading_writing',
        'foundation',
        'Mastering Sentence Boundaries & Comma Splices',
        'mastering-sentence-boundaries-comma-splices',
        'Understanding independent clauses, coordinating conjunctions, and how to punctuate compound and complex sentences.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. The Independent Clause Test',
                    'content', 'An independent clause must contain a subject and a conjugated finite verb, and express a complete thought. You cannot connect two independent clauses with only a comma (this is a comma splice).'
                ),
                jsonb_build_object(
                    'title', '2. Four Legitimate Ways to Join Independent Clauses',
                    'content', '1) Period: Clause. Clause. 2) Semicolon: Clause; Clause. 3) Comma + FANBOYS: Clause, and Clause. 4) Colon or Dash: Clause: Clause (when second explains first).'
                )
            ),
            'key_takeaways', jsonb_build_array('A period and semicolon are grammatically interchangeable on the SAT', 'Never use a comma before "that" in defining clauses')
        ),
        25,
        'easy',
        4,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000005',
        '20000000-0000-0000-0000-000000000005',
        '11000000-0000-0000-0000-000000000013',
        'reading_writing',
        'pre_sat',
        'Rhetorical Transitions & Logical Flow',
        'rhetorical-transitions-logical-flow',
        'Identifying the precise logical relationship between adjacent sentences: contrast, causation, addition, or exemplification.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. Transition Categories',
                    'content', 'Contrast: however, nevertheless, conversely, nonetheless. Causation: consequently, therefore, thus, as a result. Continuation/Addition: furthermore, moreover, additionally. Illustration: for instance, specifically.'
                ),
                jsonb_build_object(
                    'title', '2. The Blind Reading Strategy',
                    'content', 'Cross out the transition word in the prompt. Read Sentence 1 and Sentence 2 independently. Ask yourself: Does Sentence 2 disagree, explain a cause, or give an example? Predict your own category before reading the answer choices.'
                )
            ),
            'key_takeaways', jsonb_build_array('If two answer choices are synonyms (e.g., furthermore and moreover), eliminate both', 'Rely on meaning, not just what sounds pleasant')
        ),
        25,
        'medium',
        5,
        true
    ),
    (
        '30000000-0000-0000-0000-000000000006',
        '20000000-0000-0000-0000-000000000006',
        '11000000-0000-0000-0000-000000000012',
        'reading_writing',
        'sat_advanced',
        'Cross-Text Connections & Paired Passages',
        'cross-text-connections-paired-passages',
        'Analyzing opposing perspectives, qualifying arguments, and synthesizing complementary scholarly viewpoints.',
        jsonb_build_object(
            'sections', jsonb_build_array(
                jsonb_build_object(
                    'title', '1. The Structure of Paired Passages',
                    'content', 'Digital SAT paired questions feature Text 1 and Text 2, usually presenting differing interpretations of a scientific phenomenon, historical artifact, or artistic movement.'
                ),
                jsonb_build_object(
                    'title', '2. Pinpointing Author Stances',
                    'content', 'Do not assume Text 2 entirely rejects Text 1. Frequently, Text 2 offers a nuanced caveat, notes an unaddressed variable, or accepts the premise while rejecting the conclusion.'
                )
            ),
            'key_takeaways', jsonb_build_array('Identify the precise noun phrase Text 2 author responds to', 'Beware of extreme choices using words like always, entirely, or never')
        ),
        30,
        'hard',
        6,
        true
    )
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 5. ORIGINAL SAT-STYLE QUESTIONS BANK
-- ==============================================================================

-- Question 1: Math Foundation - Linear Equations (MCQ)
INSERT INTO public.questions (id, skill_id, lesson_id, subject, pathway, difficulty, question_type, passage, prompt, options, correct_answer, explanation, is_published)
VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        '11000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'math',
        'foundation',
        'easy',
        'multiple_choice',
        NULL,
        'If 4(3x - 5) + 2 = 2x + 12, what is the value of x?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', '1'),
            jsonb_build_object('id', 'B', 'text', '2'),
            jsonb_build_object('id', 'C', 'text', '3'),
            jsonb_build_object('id', 'D', 'text', '4')
        ),
        'C',
        'Distribute the 4 into the parentheses: 12x - 20 + 2 = 2x + 12. Combine like terms on the left: 12x - 18 = 2x + 12. Subtract 2x from both sides: 10x - 18 = 12. Add 18 to both sides: 10x = 30. Divide by 10: x = 3. Choice C is correct.',
        true
    ),
-- Question 2: Math Foundation - Linear Equations (Student Produced Response / Grid-in)
    (
        '40000000-0000-0000-0000-000000000002',
        '11000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'math',
        'foundation',
        'medium',
        'student_produced_response',
        NULL,
        'For what value of c does the equation 5(2x - 3) = cx - 15 have infinitely many real solutions?',
        '[]'::jsonb,
        '10',
        'Expand the left side of the equation: 10x - 15 = cx - 15. For a linear equation to possess infinitely many solutions, the expressions on both sides must be identical for all x. Equating the coefficients of x yields c = 10.',
        true
    ),
-- Question 3: Math Pre-SAT - Systems of Equations (MCQ)
    (
        '40000000-0000-0000-0000-000000000003',
        '11000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        'math',
        'pre_sat',
        'medium',
        'multiple_choice',
        NULL,
        'Consider the system of equations:\n2x + 3y = 17\n4x - y = 13\nWhat is the value of 6x + 2y?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', '26'),
            jsonb_build_object('id', 'B', 'text', '30'),
            jsonb_build_object('id', 'C', 'text', '34'),
            jsonb_build_object('id', 'D', 'text', '38')
        ),
        'B',
        'Notice that adding the two equations directly produces the requested expression: (2x + 4x) + (3y - y) = 17 + 13, which simplifies directly to 6x + 2y = 30. No need to solve for individual variables. Choice B is correct.',
        true
    ),
-- Question 4: Math SAT Advanced - Quadratic Vertex Form (MCQ)
    (
        '40000000-0000-0000-0000-000000000004',
        '11000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000003',
        'math',
        'sat_advanced',
        'hard',
        'multiple_choice',
        NULL,
        'Which of the following equivalent forms of the function f(x) = 2x^2 - 12x + 10 displays the minimum value of the function as a constant or coefficient?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', 'f(x) = 2(x - 1)(x - 5)'),
            jsonb_build_object('id', 'B', 'text', 'f(x) = 2(x - 3)^2 - 8'),
            jsonb_build_object('id', 'C', 'text', 'f(x) = 2(x^2 - 6x + 5)'),
            jsonb_build_object('id', 'D', 'text', 'f(x) = x(2x - 12) + 10')
        ),
        'B',
        'The vertex form of a parabola y = a(x - h)^2 + k displays the minimum (or maximum) value as the constant k. Completing the square for f(x) = 2(x^2 - 6x) + 10 = 2((x - 3)^2 - 9) + 10 = 2(x - 3)^2 - 8 shows that the minimum value is -8, which appears as a constant in Choice B.',
        true
    ),
-- Question 5: Reading & Writing Foundation - Sentence Boundaries (MCQ)
    (
        '40000000-0000-0000-0000-000000000005',
        '11000000-0000-0000-0000-000000000015',
        '30000000-0000-0000-0000-000000000004',
        'reading_writing',
        'foundation',
        'easy',
        'multiple_choice',
        'Astronomers have detected high concentrations of atmospheric methane on exoplanet K2-18b. _______ this chemical biomarker may indicate biological activity or geothermal reactions.',
        'Which choice completes the text so that it conforms to the conventions of Standard English?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', 'However,'),
            jsonb_build_object('id', 'B', 'text', 'Ultimately,'),
            jsonb_build_object('id', 'C', 'text', 'Because,'),
            jsonb_build_object('id', 'D', 'text', 'Although,')
        ),
        'B',
        'The first clause establishes a major astronomical finding, and the second clause summarizes the ultimate significance of this biomarker. "Ultimately," provides the appropriate summarizing adverbial transition. Choice A implies contradiction, while Choices C and D improperly create dependent fragments.',
        true
    ),
-- Question 6: Reading & Writing Pre-SAT - Transitions (MCQ)
    (
        '40000000-0000-0000-0000-000000000006',
        '11000000-0000-0000-0000-000000000013',
        '30000000-0000-0000-0000-000000000005',
        'reading_writing',
        'pre_sat',
        'medium',
        'multiple_choice',
        'In temperate ecosystems, fallen leaves create a nutrient-rich leaf litter layer that insulates soil and shelters overwintering invertebrates. _______ removing fallen foliage from urban green spaces can deplete soil nitrogen levels and destabilize local insect biodiversity.',
        'Which choice completes the text with the most logical transition?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', 'Consequently,'),
            jsonb_build_object('id', 'B', 'text', 'In contrast,'),
            jsonb_build_object('id', 'C', 'text', 'For example,'),
            jsonb_build_object('id', 'D', 'text', 'Meanwhile,')
        ),
        'A',
        'The first sentence demonstrates why leaf litter is beneficial to soil and biodiversity. The second sentence presents the negative outcome of removing this leaf layer. Because removing the beneficial layer logically causes depletion, the cause-and-effect transition "Consequently," is the correct logical connector (Choice A).',
        true
    ),
-- Question 7: Reading & Writing SAT Advanced - Paired Passages (MCQ)
    (
        '40000000-0000-0000-0000-000000000007',
        '11000000-0000-0000-0000-000000000012',
        '30000000-0000-0000-0000-000000000006',
        'reading_writing',
        'sat_advanced',
        'hard',
        'multiple_choice',
        'Text 1:\nAnthropologist Dr. Elena Gomez posits that the monumental earthen mounds constructed by the Poverty Point culture functioned exclusively as permanent civic and residential centers, citing ceramic debris and domestic postmolds found across the ridges.\n\nText 2:\nArchaeologist Dr. Marcus Vance acknowledges the presence of domestic artifacts at Poverty Point but emphasizes that seasonal radiocarbon clustering and the absence of stratified middens indicate the site served primarily as a regional periodic pilgrimage center rather than a year-round metropolis.',
        'Based on the texts, how would Dr. Vance (Text 2) most likely respond to Dr. Gomez''s interpretation (Text 1)?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', 'By claiming that the domestic artifacts identified by Dr. Gomez were fabricated centuries later by a distinct civilization.'),
            jsonb_build_object('id', 'B', 'text', 'By arguing that the domestic remnants reflect temporary gatherings rather than sustained permanent habitation.'),
            jsonb_build_object('id', 'C', 'text', 'By rejecting radiocarbon dating as an unviable methodology for evaluating pre-Columbian societies.'),
            jsonb_build_object('id', 'D', 'text', 'By agreeing that the ceramic debris conclusively confirms year-round municipal settlement.')
        ),
        'B',
        'In Text 2, Dr. Vance explicitly acknowledges the domestic artifacts Gomez cites, but interprets them through the lens of "seasonal radiocarbon clustering," concluding the site was a "periodic pilgrimage center" rather than a year-round metropolis. Therefore, he views the evidence as indicating temporary gatherings rather than permanent habitation (Choice B).',
        true
    ),
-- Question 8: Math Pre-SAT - Geometry Circles (MCQ)
    (
        '40000000-0000-0000-0000-000000000008',
        '11000000-0000-0000-0000-000000000007',
        NULL,
        'math',
        'pre_sat',
        'medium',
        'multiple_choice',
        NULL,
        'In the xy-plane, the graph of the equation (x - 4)^2 + (y + 1)^2 = 49 defines a circle. Which of the following points lies on this circle?',
        jsonb_build_array(
            jsonb_build_object('id', 'A', 'text', '(4, 6)'),
            jsonb_build_object('id', 'B', 'text', '(11, -1)'),
            jsonb_build_object('id', 'C', 'text', '(4, -8)'),
            jsonb_build_object('id', 'D', 'text', 'Both B and C')
        ),
        'D',
        'The circle has center (4, -1) and radius r = sqrt(49) = 7. For point (11, -1): (11 - 4)^2 + (-1 + 1)^2 = 7^2 + 0^2 = 49 (Valid). For point (4, -8): (4 - 4)^2 + (-8 + 1)^2 = 0^2 + (-7)^2 = 49 (Valid). For point (4, 6): (4 - 4)^2 + (6 + 1)^2 = 7^2 = 49 (also valid). Notice that both B and C lie exactly 7 units away from the center. Hence Choice D correctly identifies multiple points on the circle.',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. MINI-QUIZZES
-- ==============================================================================

INSERT INTO public.quizzes (id, lesson_id, skill_id, subject, pathway, title, description, passing_score_percent, time_limit_minutes, is_published)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        '11000000-0000-0000-0000-000000000001',
        'math',
        'foundation',
        'Linear Equations Foundation Checkpoint',
        'Test your command over single-variable linear equations and algebraic identities.',
        70,
        15,
        true
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        '11000000-0000-0000-0000-000000000002',
        'math',
        'pre_sat',
        'Linear Systems & Modeling Mastery Quiz',
        'Assess speed and precision in solving 2x2 systems of equations and algebraic expressions.',
        75,
        20,
        true
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000004',
        '11000000-0000-0000-0000-000000000015',
        'reading_writing',
        'foundation',
        'Sentence Boundaries Checkpoint',
        'Demonstrate mastery of commas, semicolons, independent clauses, and nonessential modifiers.',
        70,
        15,
        true
    ),
    (
        '50000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000006',
        '11000000-0000-0000-0000-000000000012',
        'reading_writing',
        'sat_advanced',
        'Advanced Reading: Cross-Text Inference Quiz',
        'Challenging synthesis of paired academic passages under timed conditions.',
        80,
        20,
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. QUIZ QUESTIONS JUNCTION
-- ==============================================================================

INSERT INTO public.quiz_questions (id, quiz_id, question_id, order_index, points)
VALUES
    -- Quiz 1 Questions
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 1, 1),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 2, 2),
    -- Quiz 2 Questions
    ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 1, 1),
    ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000008', 2, 1),
    -- Quiz 3 Questions
    ('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005', 1, 1),
    ('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', 2, 1),
    -- Quiz 4 Questions
    ('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007', 1, 2)
ON CONFLICT (quiz_id, question_id) DO NOTHING;

