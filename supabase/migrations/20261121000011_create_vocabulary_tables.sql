-- ==============================================================================
-- 20261121000011_create_vocabulary_tables.sql
-- Complete SAT Advanced Vocabulary Learning System Database Schema
-- ==============================================================================

-- 1. Vocabulary CEFR and Status Enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vocab_cefr_level') THEN
        CREATE TYPE public.vocab_cefr_level AS ENUM ('B2', 'C1', 'C2');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vocab_learning_status') THEN
        CREATE TYPE public.vocab_learning_status AS ENUM ('new', 'learning', 'review_due', 'mastered');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vocab_review_rating') THEN
        CREATE TYPE public.vocab_review_rating AS ENUM ('again', 'hard', 'good', 'easy');
    END IF;
END $$;

-- 2. Global Curated Vocabulary Table (500 initial high-impact SAT words)
CREATE TABLE IF NOT EXISTS public.vocabulary_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL UNIQUE,
    pronunciation TEXT NOT NULL,
    part_of_speech TEXT NOT NULL,
    cefr_level public.vocab_cefr_level NOT NULL,
    definition TEXT NOT NULL,
    simple_explanation TEXT NOT NULL,
    synonyms TEXT[] NOT NULL DEFAULT '{}',
    antonyms TEXT[] NOT NULL DEFAULT '{}',
    example_sentence TEXT NOT NULL,
    sat_context_sentence TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    audio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Student Personal Vocabulary Progress & SM-2 SRS Table
CREATE TABLE IF NOT EXISTS public.user_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
    status public.vocab_learning_status NOT NULL DEFAULT 'learning',
    is_saved BOOLEAN NOT NULL DEFAULT false,
    is_difficult BOOLEAN NOT NULL DEFAULT false,
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    last_reviewed_at TIMESTAMPTZ,
    review_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,
    current_interval INTEGER NOT NULL DEFAULT 0, -- interval in days (0 = immediately/today)
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_user_vocab_word UNIQUE (user_id, word_id)
);

-- 4. Vocabulary SRS Review History Logs
CREATE TABLE IF NOT EXISTS public.vocabulary_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
    rating public.vocab_review_rating NOT NULL,
    scheduled_interval INTEGER NOT NULL DEFAULT 1,
    actual_interval INTEGER NOT NULL DEFAULT 0,
    ease_factor_before NUMERIC(4,2) NOT NULL,
    ease_factor_after NUMERIC(4,2) NOT NULL,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Vocabulary Quiz Attempts
CREATE TABLE IF NOT EXISTS public.vocabulary_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_type TEXT NOT NULL, -- 'definition', 'synonym', 'antonym', 'fill_blank', 'sentence_completion', 'matching', 'sat_context', 'mixed'
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage INTEGER NOT NULL,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 6. Student Daily Vocabulary Goals and Stats
CREATE TABLE IF NOT EXISTS public.vocabulary_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    new_words_learned INTEGER NOT NULL DEFAULT 0,
    words_reviewed INTEGER NOT NULL DEFAULT 0,
    quizzes_taken INTEGER NOT NULL DEFAULT 0,
    quiz_accuracy INTEGER NOT NULL DEFAULT 0,
    total_study_seconds INTEGER NOT NULL DEFAULT 0,
    daily_goal INTEGER NOT NULL DEFAULT 10,
    goal_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_user_vocab_daily_stat UNIQUE (user_id, stat_date)
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_vocab_words_cefr ON public.vocabulary_words(cefr_level);
CREATE INDEX IF NOT EXISTS idx_vocab_words_category ON public.vocabulary_words(category);
CREATE INDEX IF NOT EXISTS idx_vocab_words_word ON public.vocabulary_words(word);
CREATE INDEX IF NOT EXISTS idx_user_vocab_user_id ON public.user_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocab_status ON public.user_vocabulary(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_vocab_review_due ON public.user_vocabulary(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_vocab_reviews_user_word ON public.vocabulary_reviews(user_id, word_id);
CREATE INDEX IF NOT EXISTS idx_vocab_quiz_user ON public.vocabulary_quiz_attempts(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_vocab_daily_stats_user_date ON public.vocabulary_daily_stats(user_id, stat_date DESC);

-- Enable RLS
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- vocabulary_words: anyone authenticated or anonymous can read published words
DROP POLICY IF EXISTS "vocab_words_select_all" ON public.vocabulary_words;
CREATE POLICY "vocab_words_select_all" ON public.vocabulary_words FOR SELECT USING (true);

DROP POLICY IF EXISTS "vocab_words_admin_all" ON public.vocabulary_words;
CREATE POLICY "vocab_words_admin_all" ON public.vocabulary_words FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- user_vocabulary: students can only access their own records
DROP POLICY IF EXISTS "user_vocab_select_own" ON public.user_vocabulary;
CREATE POLICY "user_vocab_select_own" ON public.user_vocabulary FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_vocab_insert_own" ON public.user_vocabulary;
CREATE POLICY "user_vocab_insert_own" ON public.user_vocabulary FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_vocab_update_own" ON public.user_vocabulary;
CREATE POLICY "user_vocab_update_own" ON public.user_vocabulary FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_vocab_delete_own" ON public.user_vocabulary;
CREATE POLICY "user_vocab_delete_own" ON public.user_vocabulary FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- vocabulary_reviews: students can only access their own reviews
DROP POLICY IF EXISTS "vocab_reviews_select_own" ON public.vocabulary_reviews;
CREATE POLICY "vocab_reviews_select_own" ON public.vocabulary_reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vocab_reviews_insert_own" ON public.vocabulary_reviews;
CREATE POLICY "vocab_reviews_insert_own" ON public.vocabulary_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- vocabulary_quiz_attempts: students can only access their own quiz attempts
DROP POLICY IF EXISTS "vocab_quiz_select_own" ON public.vocabulary_quiz_attempts;
CREATE POLICY "vocab_quiz_select_own" ON public.vocabulary_quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vocab_quiz_insert_own" ON public.vocabulary_quiz_attempts;
CREATE POLICY "vocab_quiz_insert_own" ON public.vocabulary_quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- vocabulary_daily_stats: students can only access their own daily stats
DROP POLICY IF EXISTS "vocab_daily_stats_select_own" ON public.vocabulary_daily_stats;
CREATE POLICY "vocab_daily_stats_select_own" ON public.vocabulary_daily_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "vocab_daily_stats_insert_own" ON public.vocabulary_daily_stats;
CREATE POLICY "vocab_daily_stats_insert_own" ON public.vocabulary_daily_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "vocab_daily_stats_update_own" ON public.vocabulary_daily_stats;
CREATE POLICY "vocab_daily_stats_update_own" ON public.vocabulary_daily_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
