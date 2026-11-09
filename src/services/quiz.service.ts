import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import {
  submitQuizAttemptRequestSchema,
  type SubmitQuizAttemptRequest,
} from '../schemas/quiz.schema';
import { ValidationError, NotFoundError, ForbiddenError } from '../lib/errors';
import type { Database, AppSubject, LearningPathway } from '../../types/database.types';

export type Quiz = Database['public']['Tables']['quizzes']['Row'];
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];
export type QuizAnswer = Database['public']['Tables']['quiz_answers']['Row'];

export interface QuizQuestionMasked {
  id: string;
  order_index: number;
  points: number;
  prompt: string;
  passage: string | null;
  options: unknown;
  question_type: string;
}

export interface QuizAttemptReview {
  attempt: QuizAttempt;
  answers: Array<{
    question_id: string;
    prompt: string;
    user_answer: string | null;
    correct_answer: string;
    is_correct: boolean | null;
    points_awarded: number;
    explanation: string;
  }>;
}

export class QuizService {
  /**
   * Retrieves published mini-quizzes with optional filters.
   */
  static async getQuizzes(params?: {
    subject?: AppSubject;
    pathway?: LearningPathway;
    lessonId?: string;
  }): Promise<Quiz[]> {
    let query = supabase
      .from('quizzes')
      .select('*, skills(id, name, code, domain)')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (params?.subject) {
      query = query.eq('subject', params.subject);
    }
    if (params?.pathway) {
      query = query.eq('pathway', params.pathway);
    }
    if (params?.lessonId) {
      query = query.eq('lesson_id', params.lessonId);
    }

    const { data, error } = await query;
    if (error) {
      throw new ValidationError(error.message);
    }
    return data || [];
  }

  /**
   * Retrieves a quiz and its questions for taking a test.
   * Does NOT return `correct_answer` or `explanation` to the client.
   */
  static async getQuizForTaking(quizId: string) {
    const { data: quiz, error: qError } = await supabase
      .from('quizzes')
      .select('*, skills(name, domain)')
      .eq('id', quizId)
      .eq('is_published', true)
      .single();

    if (qError || !quiz) {
      throw new NotFoundError('Quiz');
    }

    // Fetch quiz questions with question prompts and options only
    const { data: quizQuestions, error: qqError } = await supabase
      .from('quiz_questions')
      .select('id, order_index, points, questions(id, prompt, passage, options, question_type)')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (qqError) {
      throw new ValidationError(`Failed to fetch quiz questions: ${qqError.message}`);
    }

    const maskedQuestions: QuizQuestionMasked[] = (quizQuestions || []).map((item) => {
      const q = item.questions as any;
      return {
        id: q.id,
        order_index: item.order_index,
        points: item.points,
        prompt: q.prompt,
        passage: q.passage,
        options: q.options,
        question_type: q.question_type,
      };
    });

    return {
      quiz,
      questions: maskedQuestions,
    };
  }

  /**
   * Starts a new quiz attempt session. Increments attempt number automatically.
   */
  static async startAttempt(quizId: string): Promise<QuizAttempt> {
    const user = await AuthService.getCurrentUser();

    // Check previous attempts count
    const { count } = await supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('quiz_id', quizId)
      .eq('user_id', user.id);

    const nextAttemptNumber = (count || 0) + 1;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        attempt_number: nextAttemptNumber,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new ValidationError(`Failed to start quiz attempt: ${error.message}`);
    }

    return data;
  }

  /**
   * Submits a quiz attempt for authoritative grading via the database stored procedure.
   */
  static async submitAttempt(input: SubmitQuizAttemptRequest) {
    const validated = submitQuizAttemptRequestSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Invalid quiz attempt submission', validated.error.flatten());
    }

    const user = await AuthService.getCurrentUser();
    const { attempt_id, answers } = validated.data;

    // Verify ownership and in_progress status
    const { data: attempt, error: checkError } = await supabase
      .from('quiz_attempts')
      .select('id, user_id, status, quiz_id')
      .eq('id', attempt_id)
      .single();

    if (checkError || !attempt) {
      throw new NotFoundError('Quiz attempt');
    }
    if (attempt.user_id !== user.id) {
      throw new ForbiddenError('Unauthorized: You do not own this quiz attempt.');
    }
    if (attempt.status === 'submitted') {
      throw new ValidationError('This attempt has already been submitted and scored.');
    }

    // Call authoritative database procedure
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      p_attempt_id: attempt_id,
      p_answers: answers,
    });

    if (error) {
      throw new ValidationError(`Scoring error: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves attempt review after submission, including correct answers,
   * user answers, and step-by-step explanations.
   */
  static async getAttemptReview(attemptId: string): Promise<QuizAttemptReview> {
    const user = await AuthService.getCurrentUser();

    const { data: attempt, error: aError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (aError || !attempt) {
      throw new NotFoundError('Quiz attempt');
    }
    if (attempt.user_id !== user.id) {
      throw new ForbiddenError('Unauthorized: You do not own this quiz attempt.');
    }
    if (attempt.status !== 'submitted') {
      throw new ValidationError('Review is available only after the quiz attempt has been submitted.');
    }

    const { data: answers, error: ansError } = await supabase
      .from('quiz_answers')
      .select('question_id, user_answer, is_correct, points_awarded, questions(prompt, correct_answer, explanation)')
      .eq('attempt_id', attemptId);

    if (ansError) {
      throw new ValidationError(ansError.message);
    }

    const formattedAnswers = (answers || []).map((ans) => {
      const q = ans.questions as any;
      return {
        question_id: ans.question_id,
        prompt: q?.prompt || '',
        user_answer: ans.user_answer,
        correct_answer: q?.correct_answer || '',
        is_correct: ans.is_correct,
        points_awarded: ans.points_awarded,
        explanation: q?.explanation || '',
      };
    });

    return {
      attempt,
      answers: formattedAnswers,
    };
  }

  /**
   * Recommends the next learning activity based on the student's active roadmap.
   */
  static async getNextRecommendedActivity() {
    const user = await AuthService.getCurrentUser();

    // Look for first pending or in_progress item in the active roadmap
    const { data: nextItem } = await supabase
      .from('roadmap_items')
      .select('*, roadmaps!inner(user_id, is_active), lessons(*), quizzes(*)')
      .eq('roadmaps.user_id', user.id)
      .eq('roadmaps.is_active', true)
      .in('status', ['pending', 'in_progress'])
      .order('order_index', { ascending: true })
      .limit(1)
      .maybeSingle();

    return nextItem || null;
  }
}
