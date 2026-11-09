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
