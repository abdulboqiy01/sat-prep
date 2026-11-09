import { z } from 'zod';

export const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const tutorSendMessageRequestSchema = z.object({
  session_id: z.string().regex(uuidRegex, 'Invalid session ID').optional().nullable(),
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2,000 characters'),
  subject: z.enum(['math', 'reading_writing']).optional().nullable(),
  context_type: z
    .enum(['general', 'lesson', 'question', 'quiz', 'roadmap', 'assessment'])
    .default('general'),
  context_id: z.string().regex(uuidRegex, 'Invalid context ID').optional().nullable(),
});

export const tutorMessageResponseSchema = z.object({
  message_id: z.string().regex(uuidRegex, 'Invalid message ID'),
  session_id: z.string().regex(uuidRegex, 'Invalid session ID'),
  sender_role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  tokens_used: z.number().int().nonnegative().optional(),
  model: z.string().optional(),
});

export type TutorSendMessageRequest = z.infer<typeof tutorSendMessageRequestSchema>;
export type TutorMessageResponse = z.infer<typeof tutorMessageResponseSchema>;
