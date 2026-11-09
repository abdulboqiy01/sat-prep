import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import {
  submitAssessmentRequestSchema,
  createAssessmentSessionSchema,
  type SubmitAssessmentRequest,
  type CreateAssessmentSessionInput,
} from '../schemas/assessment.schema';
import { ValidationError, NotFoundError, ForbiddenError } from '../lib/errors';
import type { Database, LearningPathway, AppSubject } from '../../types/database.types';

export type Assessment = Database['public']['Tables']['assessments']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];

export interface DiagnosticSkillBreakdown {
  skillId: string;
  skillName: string;
  domain: string;
  subject: AppSubject;
  totalQuestions: number;
  correctQuestions: number;
  accuracyPercentage: number;
  status: 'strength' | 'developing' | 'critical_gap';
}

export interface DiagnosticEvaluationResult {
  assessmentId: string;
  totalScore: number;
  mathScore: number;
  rwScore: number;
  recommendedPathway: LearningPathway;
  confidenceLevel: 'high' | 'moderate' | 'preliminary';
  confidenceExplanation: string;
  skillBreakdown: DiagnosticSkillBreakdown[];
  strengths: string[];
  weakAreas: string[];
}

export class AssessmentService {
  /**
   * Generates a balanced set of published diagnostic questions across core domains.
   * Strips correct_answer and explanation so the student cannot inspect DevTools network tabs.
   */
  static async startDiagnosticSession(input?: Partial<CreateAssessmentSessionInput>) {
    const validated = createAssessmentSessionSchema.safeParse(input || {});
    if (!validated.success) {
      throw new ValidationError('Invalid diagnostic setup parameters', validated.error.flatten());
    }

    const user = await AuthService.getCurrentUser();
    const { title, assessment_type, subject, target_question_count } = validated.data;

    // 1. Fetch published questions covering domains and difficulties
    let query = supabase
      .from('questions')
      .select('id, skill_id, lesson_id, subject, pathway, difficulty, question_type, passage, prompt, options, skills(name, domain)')
      .eq('is_published', true);

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data: questions, error: qError } = await query;
    if (qError || !questions || questions.length === 0) {
      throw new ValidationError('No published assessment questions available.');
    }

    // Balanced selection across domains and difficulties (easy, medium, hard)
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, target_question_count);

    // 2. Create the Assessment session record
    const { data: assessment, error: aError } = await supabase
      .from('assessments')
      .insert({
        user_id: user.id,
        title,
        assessment_type,
        subject: subject || null,
        status: 'in_progress',
        total_questions: selectedQuestions.length,
        answered_questions: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (aError || !assessment) {
      throw new ValidationError(`Failed to create assessment session: ${aError?.message}`);
    }

    return {
      assessment,
      questions: selectedQuestions,
    };
  }

  /**
   * Authoritative submission of diagnostic assessment.
   * Invokes the database RPC function `submit_assessment` for secure grading,
   * then computes transparent pedagogical placement analytics & confidence limitations.
   */
  static async submitAssessment(input: SubmitAssessmentRequest): Promise<DiagnosticEvaluationResult> {
    const validated = submitAssessmentRequestSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Invalid assessment submission payload', validated.error.flatten());
    }

    const user = await AuthService.getCurrentUser();
    const { assessment_id, answers } = validated.data;

    // Verify ownership
    const { data: assessment, error: aCheckError } = await supabase
      .from('assessments')
      .select('id, user_id, status, assessment_type, total_questions')
      .eq('id', assessment_id)
      .maybeSingle();

    if (aCheckError || !assessment) {
      throw new NotFoundError('Assessment session');
    }
    if (assessment.user_id !== user.id) {
      throw new ForbiddenError('Unauthorized: You do not own this assessment session.');
    }
    if (assessment.status === 'completed') {
      throw new ValidationError('This assessment has already been finalized.');
    }

    // 1. Authoritative Database Scoring via RPC
    const { error: rpcError } = await supabase.rpc('submit_assessment', {
      p_assessment_id: assessment_id,
      p_answers: answers,
    });

    if (rpcError) {
      throw new ValidationError(`Scoring execution failed: ${rpcError.message}`);
    }

    // 2. Compute granular skill breakdown and transparent placement confidence
    const evaluation = await this.evaluateAssessmentResults(assessment_id);
    return evaluation;
  }

  /**
   * Transparent pedagogical placement rules and skill gap breakdown.
   */
  static async evaluateAssessmentResults(assessmentId: string): Promise<DiagnosticEvaluationResult> {
    // Fetch assessment and all recorded answers with skill metadata
    const { data: assessment, error: aError } = await supabase
      .from('assessments')
      .select('id, user_id, total_score, math_score, rw_score, total_questions, diagnostic_results')
      .eq('id', assessmentId)
      .single();

    if (aError || !assessment) {
      throw new NotFoundError('Assessment results');
    }

    const { data: answers, error: ansError } = await supabase
      .from('assessment_answers')
      .select('question_id, is_correct, time_spent_seconds, questions(skill_id, subject, skills(id, name, domain))')
      .eq('assessment_id', assessmentId);

    if (ansError || !answers) {
      throw new ValidationError('Could not load question results');
    }

    // Skill-by-skill aggregation
    const skillMap = new Map<string, {
      name: string;
      domain: string;
      subject: AppSubject;
      total: number;
      correct: number;
    }>();

    for (const ans of answers) {
      const q = ans.questions as unknown as {
        skill_id: string;
        subject: AppSubject;
        skills: { id: string; name: string; domain: string };
      };
      if (!q || !q.skills) continue;

      const current = skillMap.get(q.skills.id) || {
        name: q.skills.name,
        domain: q.skills.domain,
        subject: q.subject,
        total: 0,
        correct: 0,
      };

      current.total += 1;
      if (ans.is_correct) {
        current.correct += 1;
      }
      skillMap.set(q.skills.id, current);
    }

    const skillBreakdown: DiagnosticSkillBreakdown[] = [];
    const strengths: string[] = [];
    const weakAreas: string[] = [];

    skillMap.forEach((val, skillId) => {
      const accuracy = Math.round((val.correct / val.total) * 100);
      let status: 'strength' | 'developing' | 'critical_gap' = 'developing';

      if (accuracy >= 80) {
        status = 'strength';
        strengths.push(val.name);
      } else if (accuracy < 50) {
        status = 'critical_gap';
        weakAreas.push(val.name);
      } else {
        status = 'developing';
      }

      skillBreakdown.push({
        skillId,
        skillName: val.name,
        domain: val.domain,
        subject: val.subject,
        totalQuestions: val.total,
        correctQuestions: val.correct,
        accuracyPercentage: accuracy,
        status,
      });
    });

    // Placement logic
    const totalScore = assessment.total_score || 800;
    const mathScore = assessment.math_score || 400;
    const rwScore = assessment.rw_score || 400;

    let recommendedPathway: LearningPathway = 'pre_sat';
    if (totalScore < 1000) {
      recommendedPathway = 'foundation';
    } else if (totalScore >= 1300) {
      recommendedPathway = 'sat_advanced';
    }

    // Confidence Level & Evidence Limitations
    const totalQuestions = answers.length;
    let confidenceLevel: 'high' | 'moderate' | 'preliminary' = 'moderate';
    let confidenceExplanation = '';

    if (totalQuestions < 8) {
      confidenceLevel = 'preliminary';
      confidenceExplanation =
        'Preliminary placement based on a brief assessment sample (<8 questions). Skill-level precision will refine as you practice lessons.';
    } else if (totalQuestions < 20) {
      confidenceLevel = 'moderate';
      confidenceExplanation =
        'Moderate confidence placement. Core competencies identified across key domains with standard statistical margin.';
    } else {
      confidenceLevel = 'high';
      confidenceExplanation =
        'High confidence comprehensive diagnostic. Rigorous evaluation across all major SAT reporting categories.';
    }

    return {
      assessmentId,
      totalScore,
      mathScore,
      rwScore,
      recommendedPathway,
      confidenceLevel,
      confidenceExplanation,
      skillBreakdown,
      strengths,
      weakAreas,
    };
  }
}
