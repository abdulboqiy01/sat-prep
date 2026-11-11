import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import {
  onboardingPreferencesSchema,
  type OnboardingPreferencesInput,
} from '../schemas/onboarding.schema';
import { ValidationError, NotFoundError } from '../lib/errors';
import type { Database } from '../../types/database.types';

export type StudentPreferences = Database['public']['Tables']['student_preferences']['Row'];

export class OnboardingService {
  /**
   * Saves student onboarding preferences and updates target scores & pathway.
   */
  static async completeOnboarding(input: OnboardingPreferencesInput) {
    const validated = onboardingPreferencesSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Invalid onboarding preferences submission', validated.error.flatten());
    }

    const user = await AuthService.getCurrentUser();
    const data = validated.data;

    // Calculate weekly study hours budget: (days count * daily minutes) / 60
    const daysCount = data.preferredStudyDays.length;
    const weeklyHoursBudget = Math.round(((daysCount * data.dailyStudyMinutes) / 60) * 10) / 10;

    // Resolve starting level pathway: if unknown, default to 'pre_sat' until diagnostic is taken
    const resolvedPathway = data.pathway === 'unknown' ? 'pre_sat' : data.pathway;

    // 1. Update Profile (target scores, exam date, starting pathway)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        target_score: data.targetScore,
        target_math_score: data.targetMathScore,
        target_rw_score: data.targetRwScore,
        target_exam_date: data.targetExamDate || null,
        starting_level: resolvedPathway,
      })
      .eq('id', user.id);

    if (profileError) {
      throw new ValidationError(`Failed to update profile: ${profileError.message}`);
    }

    // 2. Upsert Student Preferences
    const { data: preferences, error: prefError } = await supabase
      .from('student_preferences')
      .upsert(
        {
          user_id: user.id,
          weekly_study_hours_budget: weeklyHoursBudget,
          preferred_study_days: data.preferredStudyDays,
          preferred_pathway: resolvedPathway,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (prefError) {
      throw new ValidationError(`Failed to save student preferences: ${prefError.message}`);
    }

    return {
      success: true,
      preferences,
      pathwayKnown: data.pathway !== 'unknown',
      weeklyHoursBudget,
      startingPathway: resolvedPathway,
    };
  }

  /**
   * Retrieves current onboarding & study preferences for authenticated student.
   */
  static async getPreferences(): Promise<StudentPreferences> {
    const user = await AuthService.getCurrentUser();

    const { data, error } = await supabase
      .from('student_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw new ValidationError(error.message);
    }
    if (!data) {
      throw new NotFoundError('Student preferences');
    }

    return data;
  }

  /**
   * Updates student study preferences.
   */
  static async savePreferences(prefs: {
    weekly_study_hours_budget: number;
    preferred_study_days: string[];
    preferred_pathway?: any;
  }) {
    const user = await AuthService.getCurrentUser();

    const { data, error } = await supabase
      .from('student_preferences')
      .upsert(
        {
          user_id: user.id,
          weekly_study_hours_budget: prefs.weekly_study_hours_budget,
          preferred_study_days: prefs.preferred_study_days,
          ...(prefs.preferred_pathway ? { preferred_pathway: prefs.preferred_pathway } : {}),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      throw new ValidationError(error.message);
    }
    return data;
  }
}
