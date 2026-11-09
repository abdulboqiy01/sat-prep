import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import {
  tutorSendMessageRequestSchema,
  type TutorSendMessageRequest,
  type TutorMessageResponse,
} from '../schemas/tutor.schema';
import { ValidationError, NotFoundError, ForbiddenError } from '../lib/errors';
import type { Database } from '../../types/database.types';

export type TutorSession = Database['public']['Tables']['tutor_sessions']['Row'];
export type TutorMessage = Database['public']['Tables']['tutor_messages']['Row'];

export class TutorService {
  /**
   * Dispatches a message to the Gemini AI Tutor via the protected `ai-tutor` Edge Function.
   */
  static async sendMessage(input: TutorSendMessageRequest): Promise<TutorMessageResponse> {
    const validated = tutorSendMessageRequestSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Invalid AI tutor message payload', validated.error.flatten());
    }

    const session = await AuthService.getSession();
    if (!session) {
      throw new ValidationError('Authentication required to message the AI Tutor.');
    }

    const { data, error } = await supabase.functions.invoke('ai-tutor', {
      body: validated.data,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw new ValidationError(`AI Tutor service error: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves active and archived tutoring sessions for the authenticated student.
   */
  static async getSessions(): Promise<TutorSession[]> {
    const user = await AuthService.getCurrentUser();

    const { data, error } = await supabase
      .from('tutor_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return data || [];
  }

  /**
   * Retrieves full chronological message history for a specific tutoring session.
   */
  static async getSessionMessages(sessionId: string): Promise<TutorMessage[]> {
    const user = await AuthService.getCurrentUser();

    // Verify session ownership
    const { data: session, error: sError } = await supabase
      .from('tutor_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .single();

    if (sError || !session) {
      throw new NotFoundError('Tutor session');
    }
    if (session.user_id !== user.id) {
      throw new ForbiddenError('Unauthorized: You do not own this tutoring session.');
    }

    const { data: messages, error: mError } = await supabase
      .from('tutor_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (mError) {
      throw new ValidationError(mError.message);
    }

    return messages || [];
  }

  /**
   * Closes an active tutoring session.
   */
  static async closeSession(sessionId: string) {
    const user = await AuthService.getCurrentUser();

    const { data, error } = await supabase
      .from('tutor_sessions')
      .update({ status: 'closed' })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return data;
  }
}
