import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import {
  generateRoadmapRequestSchema,
  type GenerateRoadmapRequest,
} from '../schemas/roadmap.schema';
import { ValidationError, NotFoundError, ForbiddenError } from '../lib/errors';
import type { Database } from '../../types/database.types';

export type Roadmap = Database['public']['Tables']['roadmaps']['Row'];
export type RoadmapItem = Database['public']['Tables']['roadmap_items']['Row'];

export interface ActiveRoadmapWithItems {
  roadmap: Roadmap;
  items: RoadmapItem[];
  progressPercentage: number;
}

export class RoadmapService {
  /**
   * Triggers the protected `generate-roadmap` Supabase Edge Function to produce a personalized,
   * Gemini-powered, database-verified study roadmap.
   * Seamlessly falls back to deterministic curriculum generation if Edge Functions are offline.
   */
  static async generateRoadmap(input: GenerateRoadmapRequest = { force_regenerate: false }) {
    const validated = generateRoadmapRequestSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Invalid roadmap generation request parameters', validated.error.flatten());
    }

    const session = await AuthService.getSession();
    if (!session) {
      throw new ValidationError('Authentication required to generate a study roadmap.');
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: validated.data,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!error && data) {
        return data;
      }
    } catch {
      // Continue to deterministic database fallback
    }

    return this.generateDeterministicRoadmapFallback(validated.data.force_regenerate);
  }

  /**
   * Deterministic database-level roadmap synthesis fallback.
   * Generates sequential milestone items directly from published database curriculum.
   */
  static async generateDeterministicRoadmapFallback(forceRegenerate = false) {
    const user = await AuthService.getCurrentUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: pref } = await supabase
      .from('student_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const pathway = pref?.preferred_pathway || profile?.starting_level || 'pre_sat';
    const weeklyHours = pref?.weekly_study_hours_budget || 5.0;

    // 1. Deactivate existing active roadmap if forceRegenerate
    if (forceRegenerate) {
      await supabase
        .from('roadmaps')
        .update({ is_active: false, status: 'archived' })
        .eq('user_id', user.id)
        .eq('is_active', true);
    }

    // 2. Fetch published lessons
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, summary, skill_id, pathway, subject, estimated_duration_minutes, order_index')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    // 3. Create active roadmap record
    const { data: roadmap, error: rErr } = await supabase
      .from('roadmaps')
      .insert({
        user_id: user.id,
        title: `Personalized ${pathway.replace('_', ' ').toUpperCase()} Roadmap`,
        pathway: pathway as any,
        weekly_study_budget_hours: weeklyHours,
        target_exam_date: profile?.target_exam_date || null,
        is_active: true,
        status: 'active',
        total_items: (lessons || []).length,
        completed_items: 0,
      })
      .select()
      .single();

    if (rErr || !roadmap) {
      throw new ValidationError(rErr?.message || 'Failed to create active roadmap');
    }

    // 4. Create sequential roadmap items
    if (lessons && lessons.length > 0) {
      const itemsToInsert = lessons.map((l, idx) => ({
        roadmap_id: roadmap.id,
        item_type: 'lesson' as const,
        lesson_id: l.id,
        skill_id: l.skill_id,
        title: l.title,
        description: l.summary,
        order_index: idx + 1,
        estimated_duration_minutes: l.estimated_duration_minutes || 30,
        status: idx === 0 ? ('in_progress' as const) : ('pending' as const),
      }));

      await supabase.from('roadmap_items').insert(itemsToInsert);
    }

    return this.getActiveRoadmap();
  }

  /**
   * Retrieves the student's currently active roadmap along with all ordered items.
   */
  static async getActiveRoadmap(): Promise<ActiveRoadmapWithItems | null> {
    const user = await AuthService.getCurrentUser();

    // 1. Fetch active roadmap
    const { data: roadmap, error: rError } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (rError || !roadmap) {
      return null;
    }

    // 2. Fetch all roadmap items ordered sequentially
    const { data: items, error: iError } = await supabase
      .from('roadmap_items')
      .select('*, lessons(title, slug, difficulty, estimated_duration_minutes), quizzes(title, passing_score_percent)')
      .eq('roadmap_id', roadmap.id)
      .order('order_index', { ascending: true });

    if (iError || !items) {
      throw new ValidationError(`Failed to fetch roadmap items: ${iError?.message}`);
    }

    const total = items.length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      roadmap,
      items,
      progressPercentage,
    };
  }

  /**
   * Retrieves historical roadmap versions (e.g., prior to regeneration).
   */
  static async getRoadmapHistory(): Promise<Roadmap[]> {
    const user = await AuthService.getCurrentUser();

    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', user.id)
      .order('version', { ascending: false });

    if (error) {
      throw new ValidationError(error.message);
    }

    return data || [];
  }

  /**
   * Updates progress status of a specific roadmap item.
   */
  static async updateItemStatus(
    itemId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  ) {
    const user = await AuthService.getCurrentUser();

    // Verify ownership through roadmap
    const { data: item, error: checkError } = await supabase
      .from('roadmap_items')
      .select('id, roadmap_id, roadmaps(user_id)')
      .eq('id', itemId)
      .single();

    if (checkError || !item) {
      throw new NotFoundError('Roadmap item');
    }

    const ownerId = (item.roadmaps as any)?.user_id;
    if (ownerId !== user.id) {
      throw new ForbiddenError('Unauthorized: You do not own this roadmap item.');
    }

    const { data, error } = await supabase
      .from('roadmap_items')
      .update({
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }

    return data;
  }
}
