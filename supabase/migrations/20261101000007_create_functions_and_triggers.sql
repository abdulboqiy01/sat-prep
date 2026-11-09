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
