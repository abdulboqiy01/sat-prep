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
