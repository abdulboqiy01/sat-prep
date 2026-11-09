import { z } from 'zod';

export const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const quizAnswerSubmissionSchema = z.object({
  question_id: z.string().regex(uuidRegex, 'Invalid question ID format'),
  user_answer: z.string().trim(),
  time_spent_seconds: z.number().int().min(0).default(0),
});

export const submitQuizAttemptRequestSchema = z.object({
  attempt_id: z.string().regex(uuidRegex, 'Invalid attempt ID format'),
  answers: z.array(quizAnswerSubmissionSchema).min(1, 'Quiz attempt must have at least one answer submitted'),
});

export const saveLessonProgressRequestSchema = z.object({
  lesson_id: z.string().regex(uuidRegex, 'Invalid lesson ID format'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  progress_percent: z.number().int().min(0).max(100),
  last_step_index: z.number().int().min(0).default(0),
  time_spent_delta_seconds: z.number().int().min(0).default(0),
  notes: z.string().max(2000).optional().nullable(),
});

export type QuizAnswerSubmission = z.infer<typeof quizAnswerSubmissionSchema>;
export type SubmitQuizAttemptRequest = z.infer<typeof submitQuizAttemptRequestSchema>;
export type SaveLessonProgressRequest = z.infer<typeof saveLessonProgressRequestSchema>;
