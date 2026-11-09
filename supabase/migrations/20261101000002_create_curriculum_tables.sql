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
