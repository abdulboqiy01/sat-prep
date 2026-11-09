import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import type { Database } from '../../types/database.types';

export type SkillMastery = Database['public']['Tables']['student_skill_mastery']['Row'];
export type StudyActivity = Database['public']['Tables']['study_activities']['Row'];

export interface AnalyticsSummary {
  completedLessonsCount: number;
  totalQuizzesAttempted: number;
  averageQuizAccuracy: number;
  weeklyStudyMinutes: number;
  currentStreakDays: number;
  activeRoadmapProgressPercent: number;
  skillsNeedingRevision: Array<{
    skillId: string;
    skillName: string;
    domain: string;
    masteryScore: number;
    masteryLevel: string;
  }>;
  recentActivities: StudyActivity[];
}

export class AnalyticsService {
  /**
   * Computes comprehensive student progress dashboard metrics using real persisted data.
   */
  static async getSummary(): Promise<AnalyticsSummary> {
    const user = await AuthService.getCurrentUser();

    // 1. Completed Lessons Count
    const { count: completedLessonsCount } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    // 2. Quiz Attempts & Average Accuracy
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score, max_score, score_percentage, passed')
      .eq('user_id', user.id)
      .eq('status', 'submitted');

    let totalQuizzesAttempted = 0;
    let averageQuizAccuracy = 0;
    if (attempts && attempts.length > 0) {
      totalQuizzesAttempted = attempts.length;
      const sumPct = attempts.reduce((acc, a) => acc + Number(a.score_percentage || 0), 0);
      averageQuizAccuracy = Math.round(sumPct / attempts.length);
    }

    // 3. Weekly Study Minutes (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: recentActivities } = await supabase
      .from('study_activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('activity_date', dateStr)
      .order('activity_date', { ascending: false });

    const weeklyStudySeconds = (recentActivities || []).reduce(
      (acc, act) => acc + (act.duration_seconds || 0),
      0
    );
    const weeklyStudyMinutes = Math.round(weeklyStudySeconds / 60);

    // 4. Consecutive Daily Learning Streak Calculation
    const { data: allDates } = await supabase
      .from('study_activities')
      .select('activity_date')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false });

    const currentStreakDays = this.calculateStreak(allDates?.map((d) => d.activity_date) || []);

    // 5. Active Roadmap Completion
    const { data: activeRoadmap } = await supabase
      .from('roadmaps')
      .select('total_items, completed_items')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    let activeRoadmapProgressPercent = 0;
    if (activeRoadmap && activeRoadmap.total_items > 0) {
      activeRoadmapProgressPercent = Math.round(
        (activeRoadmap.completed_items / activeRoadmap.total_items) * 100
      );
    }

    // 6. Skills Needing Revision (Mastery score < 60 or level = novice)
    const { data: masteryRecords } = await supabase
      .from('student_skill_mastery')
      .select('skill_id, mastery_score, mastery_level, skills(name, domain)')
      .eq('user_id', user.id)
      .order('mastery_score', { ascending: true });

    const skillsNeedingRevision = (masteryRecords || [])
      .filter((m) => Number(m.mastery_score) < 60 || m.mastery_level === 'novice')
      .map((m) => {
        const s = m.skills as any;
        return {
          skillId: m.skill_id,
          skillName: s?.name || 'Unknown Skill',
          domain: s?.domain || 'General',
          masteryScore: Number(m.mastery_score),
          masteryLevel: m.mastery_level,
        };
      });

    return {
      completedLessonsCount: completedLessonsCount || 0,
      totalQuizzesAttempted,
      averageQuizAccuracy,
      weeklyStudyMinutes,
      currentStreakDays,
      activeRoadmapProgressPercent,
      skillsNeedingRevision,
      recentActivities: (recentActivities || []).slice(0, 10),
    };
  }

  /**
   * Deterministic learning streak calculation from real recorded study activity dates.
   */
  static calculateStreak(dates: string[]): number {
    if (!dates || dates.length === 0) return 0;

    // Unique sorted dates descending
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If no activity today or yesterday, the active streak has lapsed
    const mostRecentDate = uniqueDates[0];
    if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let expectedDate = new Date(mostRecentDate);

    for (const d of uniqueDates) {
      const currentDateStr = expectedDate.toISOString().split('T')[0];
      if (d === currentDateStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}
