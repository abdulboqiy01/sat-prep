import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import {
  tutorSendMessageRequestSchema,
  type TutorSendMessageRequest,
  type TutorMessageResponse,
} from '../schemas/tutor.schema';
import { ValidationError, ForbiddenError } from '../lib/errors';
import type { Database } from '../../types/database.types';

export type TutorSession = Database['public']['Tables']['tutor_sessions']['Row'];
export type TutorMessage = Database['public']['Tables']['tutor_messages']['Row'];

const GEMINI_API_KEY =
  (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_GEMINI_API_KEY : undefined) || '';

const GEMINI_MODEL = 'gemini-3.5-flash-lite';

export class TutorService {
  /**
   * Dispatches a message to the Gemini AI Tutor.
   * Attempts Edge Function first, and seamlessly falls back to direct client-side Gemini call.
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

    // 1. Try Supabase Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: validated.data,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!error && data && data.content) {
        return data;
      }
    } catch {
      // Fall through to direct Gemini integration
    }

    // 2. Client-side Gemini fallback
    return this.executeDirectGeminiTutor(validated.data);
  }

  /**
   * Direct Gemini Tutor Fallback: connects directly to Google Gemini API.
   * Guarantees seamless responses in any language (Russian/English) without depending on Edge Functions.
   */
  private static async executeDirectGeminiTutor(
    input: TutorSendMessageRequest
  ): Promise<TutorMessageResponse> {
    const user = await AuthService.getCurrentUser();
    let activeSessionId = input.session_id;

    // A. Resolve or create active session
    if (!activeSessionId) {
      const titleSummary = input.message.length > 40
        ? input.message.slice(0, 37) + '...'
        : input.message;

      const { data: newSession, error: sErr } = await supabase
        .from('tutor_sessions')
        .insert({
          user_id: user.id,
          title: titleSummary,
          subject: input.subject || 'math',
          status: 'active',
        })
        .select()
        .single();

      if (sErr || !newSession) {
        // Fallback session ID in case DB insert is restricted
        activeSessionId = crypto.randomUUID();
      } else {
        activeSessionId = newSession.id;
      }
    }

    // B. Save student message in DB
    const studentMsgId = crypto.randomUUID();
    const studentMsgPayload = {
      id: studentMsgId,
      session_id: activeSessionId,
      sender_role: 'user' as const,
      content: input.message,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('tutor_messages').insert({
        id: studentMsgId,
        session_id: activeSessionId,
        sender_role: 'user',
        content: input.message,
      });
    } catch {
      // Ignore DB write errors
    }

    // Cache locally
    this.saveLocalMessage(activeSessionId, studentMsgPayload);

    // C. Build conversation history
    const history = await this.getSessionMessages(activeSessionId).catch(() => []);
    const recentHistory = history.slice(-6);
    const historyFormatted = recentHistory
      .map((m) => `${m.sender_role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');

    // D. Build Socratic System Instruction
    const systemInstruction = `You are "Antigravity SAT Tutor", an empathetic, pedagogically sound, and knowledgeable AI tutor for the Digital SAT.
EDUCATIONAL CONDUCT RULES:
1. Language Adaptability: ALWAYS respond in the exact language used by the student. If the student asks or writes in Russian, explain everything in fluent, natural, friendly Russian. If in English, reply in English.
2. Socratic Guidance: When the student asks for an answer, give a guiding hint, conceptual breakdown, or step-by-step logic first instead of just giving a bare answer.
3. Conceptual Precision: For Math, show clear step-by-step algebraic steps with LaTeX formulas ($...$). For Reading & Writing, cite specific textual evidence, word definitions, and explain why distractors are wrong.
4. Tone: Encouraging, supportive, clear, academic.`;

    const prompt = `${historyFormatted ? `Recent Conversation History:\n${historyFormatted}\n\n` : ''}Student: ${input.message}\nTutor:`;

    // E. Invoke Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new ValidationError(
        errData?.error?.message || `Gemini API returned status ${response.status}`
      );
    }

    const resJson = await response.json();
    const aiText =
      resJson.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I am here to guide your SAT prep. Could you please clarify your question?';

    const assistantMsgId = crypto.randomUUID();
    const assistantMsgPayload = {
      id: assistantMsgId,
      session_id: activeSessionId,
      sender_role: 'assistant' as const,
      content: aiText,
      created_at: new Date().toISOString(),
    };

    // Try saving assistant message to Supabase (catch gracefully if RLS blocks assistant insert)
    try {
      await supabase.from('tutor_messages').insert({
        id: assistantMsgId,
        session_id: activeSessionId,
        sender_role: 'assistant',
        content: aiText,
      });
    } catch {
      // Ignore DB write errors
    }

    // Always cache locally so message persists in the active session
    this.saveLocalMessage(activeSessionId, assistantMsgPayload);

    return {
      message_id: assistantMsgId,
      session_id: activeSessionId,
      sender_role: 'assistant',
      content: aiText,
      model: GEMINI_MODEL,
    };
  }

  private static saveLocalMessage(sessionId: string, message: any) {
    try {
      const key = `sat_tutor_msgs_${sessionId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      if (!existing.some((m: any) => m.id === message.id)) {
        existing.push(message);
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch {
      // Ignore local storage write errors
    }
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
   * Merges database records with local storage cache to guarantee complete conversation view.
   */
  static async getSessionMessages(sessionId: string): Promise<TutorMessage[]> {
    const user = await AuthService.getCurrentUser();

    // Verify session ownership if from DB
    const { data: session } = await supabase
      .from('tutor_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .maybeSingle();

    if (session && session.user_id !== user.id) {
      throw new ForbiddenError('Unauthorized: You do not own this tutoring session.');
    }

    const { data: dbMessages } = await supabase
      .from('tutor_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    let localMsgs: any[] = [];
    try {
      localMsgs = JSON.parse(localStorage.getItem(`sat_tutor_msgs_${sessionId}`) || '[]');
    } catch {
      localMsgs = [];
    }

    // Merge DB messages and local messages uniquely
    const map = new Map<string, any>();
    (dbMessages || []).forEach((m) => map.set(m.id, m));
    localMsgs.forEach((m) => {
      if (!map.has(m.id)) {
        map.set(m.id, m);
      }
    });

    const combined = Array.from(map.values());
    combined.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return combined;
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
