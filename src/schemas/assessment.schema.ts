import { z } from 'zod';

export const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const assessmentAnswerItemSchema = z.object({
  question_id: z.string().regex(uuidRegex, 'Invalid question ID format'),
  user_answer: z.string().trim(),
  time_spent_seconds: z.number().int().min(0).default(0),
});

export const submitAssessmentRequestSchema = z.object({
  assessment_id: z.string().regex(uuidRegex, 'Invalid assessment ID format'),
  answers: z.array(assessmentAnswerItemSchema).min(1, 'Assessment must contain at least one submitted answer'),
});

export const createAssessmentSessionSchema = z.object({
  title: z.string().trim().min(3).max(150).default('SAT Diagnostic Placement Assessment'),
  assessment_type: z.enum(['diagnostic', 'practice_test', 'domain_quiz']).default('diagnostic'),
  subject: z.enum(['math', 'reading_writing']).optional().nullable(),
  target_question_count: z.number().int().min(4).max(60).default(12),
});

export type AssessmentAnswerItem = z.infer<typeof assessmentAnswerItemSchema>;
export type SubmitAssessmentRequest = z.infer<typeof submitAssessmentRequestSchema>;
export type CreateAssessmentSessionInput = z.infer<typeof createAssessmentSessionSchema>;
