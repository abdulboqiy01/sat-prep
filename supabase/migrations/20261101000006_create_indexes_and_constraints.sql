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
