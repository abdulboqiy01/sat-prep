import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import {
  saveLessonProgressRequestSchema,
  type SaveLessonProgressRequest,
} from '../schemas/quiz.schema';
import { ValidationError, NotFoundError } from '../lib/errors';
import type { Database, AppSubject, LearningPathway } from '../../types/database.types';

export type Skill = Database['public']['Tables']['skills']['Row'];
export type LessonModule = Database['public']['Tables']['lesson_modules']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row'];

export class CurriculumService {
  /**
   * Retrieves published hierarchical skills taxonomy.
   */
  static async getSkills(subject?: AppSubject): Promise<Skill[]> {
    let query = supabase
      .from('skills')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;
    if (error) {
      throw new ValidationError(error.message);
    }
    return data || [];
  }

  /**
   * Retrieves published lesson modules grouped by subject and pathway.
   */
  static async getModules(subject?: AppSubject, pathway?: LearningPathway): Promise<LessonModule[]> {
    let query = supabase
      .from('lesson_modules')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (subject) {
      query = query.eq('subject', subject);
    }
    if (pathway) {
      query = query.eq('pathway', pathway);
    }

    const { data, error } = await query;
    if (error) {
      throw new ValidationError(error.message);
    }
    return data || [];
  }

  /**
   * Retrieves published lessons with optional filtering by subject, pathway, and module.
   */
  static async getLessons(params?: {
    subject?: AppSubject;
    pathway?: LearningPathway;
    moduleId?: string;
  }): Promise<Lesson[]> {
    let query = supabase
      .from('lessons')
      .select('*, skills(id, name, code, domain)')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (params?.subject) {
      query = query.eq('subject', params.subject);
    }
    if (params?.pathway) {
      query = query.eq('pathway', params.pathway);
    }
    if (params?.moduleId) {
      query = query.eq('module_id', params.moduleId);
    }

    const { data, error } = await query;
    if (error) {
      throw new ValidationError(error.message);
    }
    return data || [];
  }

  /**
   * Retrieves a single lesson by its URL slug.
   */
  static async getLessonBySlug(slug: string): Promise<Lesson> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, skills(id, name, code, domain), lesson_modules(id, title, slug)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      throw new NotFoundError(`Lesson with slug "${slug}"`);
    }

    return data;
  }

  /**
   * Retrieves student's current resumable progress for a specific lesson.
   */
  static async getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
    const user = await AuthService.getCurrentUser();

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error) {
      throw new ValidationError(error.message);
    }

    return data;
  }

  /**
   * Authoritatively updates or completes lesson progress.
   * Leverages the database procedure `save_lesson_progress` to also mark roadmap items completed
   * and record study time.
   */
  static async saveLessonProgress(input: SaveLessonProgressRequest): Promise<LessonProgress> {
    const validated = saveLessonProgressRequestSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Invalid lesson progress submission', validated.error.flatten());
    }

    const { lesson_id, status, progress_percent, last_step_index, time_spent_delta_seconds, notes } =
      validated.data;

    const { data, error } = await supabase.rpc('save_lesson_progress', {
      p_lesson_id: lesson_id,
      p_status: status,
      p_progress_percent: progress_percent,
      p_last_step_index: last_step_index,
      p_time_spent_delta_seconds: time_spent_delta_seconds,
      p_notes: notes || undefined,
    });

    if (error) {
      throw new ValidationError(`Failed to save lesson progress: ${error.message}`);
    }

    return data;
  }
}
