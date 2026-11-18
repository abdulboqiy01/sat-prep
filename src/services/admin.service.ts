import { supabase } from '../lib/supabase';

export interface AdminStats {
  totalStudents: number;
  totalLessons: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  aiMessages: number;
  telegramConnections: number;
}

export interface StudentRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  starting_level: string | null;
  created_at: string;
  telegram_connected: boolean;
  lessons_completed: number;
  last_activity: string | null;
}

export interface LessonRow {
  id: string;
  title: string;
  slug: string;
  module_id: string | null;
  module_title: string | null;
  subject: string | null;
  pathway: string | null;
  estimated_duration_minutes: number;
  difficulty: string;
  order_index: number;
}

export interface WeeklyActivity {
  date: string;
  sessions: number;
  minutes: number;
}

export class AdminService {
  static async getStats(): Promise<AdminStats> {
    const [
      studentsRes,
      lessonsRes,
      progressRes,
      quizzesRes,
      aiRes,
      telegramRes,
    ] = await Promise.allSettled([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
      supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }),
      supabase.from('tutor_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('telegram_connections').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    return {
      totalStudents: studentsRes.status === 'fulfilled' ? (studentsRes.value.count ?? 0) : 0,
      totalLessons: lessonsRes.status === 'fulfilled' ? (lessonsRes.value.count ?? 0) : 0,
      lessonsCompleted: progressRes.status === 'fulfilled' ? (progressRes.value.count ?? 0) : 0,
      quizzesTaken: quizzesRes.status === 'fulfilled' ? (quizzesRes.value.count ?? 0) : 0,
      aiMessages: aiRes.status === 'fulfilled' ? (aiRes.value.count ?? 0) : 0,
      telegramConnections: telegramRes.status === 'fulfilled' ? (telegramRes.value.count ?? 0) : 0,
    };
  }

  static async getAllStudents(page = 0, limit = 20): Promise<{ data: StudentRow[]; total: number }> {
    const from = page * limit;
    const to = from + limit - 1;

    const { data: profiles, count, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, starting_level, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    if (!profiles || profiles.length === 0) {
      return { data: [], total: count ?? 0 };
    }

    const userIds = profiles.map((p) => p.id);

    const [telegramRes, progressRes, activityRes] = await Promise.allSettled([
      supabase
        .from('telegram_connections')
        .select('user_id')
        .eq('is_active', true)
        .in('user_id', userIds),
      supabase
        .from('lesson_progress')
        .select('user_id')
        .eq('status', 'completed')
        .in('user_id', userIds),
      supabase
        .from('study_activities')
        .select('user_id, activity_date')
        .in('user_id', userIds)
        .order('activity_date', { ascending: false }),
    ]);

    const telegramSet = new Set<string>(
      telegramRes.status === 'fulfilled'
        ? (telegramRes.value.data ?? []).map((t: { user_id: string }) => t.user_id)
        : []
    );

    const progressMap: Record<string, number> = {};
    if (progressRes.status === 'fulfilled' && progressRes.value.data) {
      for (const p of progressRes.value.data as { user_id: string }[]) {
        progressMap[p.user_id] = (progressMap[p.user_id] ?? 0) + 1;
      }
    }

    const lastActivityMap: Record<string, string> = {};
    if (activityRes.status === 'fulfilled' && activityRes.value.data) {
      for (const a of activityRes.value.data as { user_id: string; activity_date: string }[]) {
        if (!lastActivityMap[a.user_id]) {
          lastActivityMap[a.user_id] = a.activity_date;
        }
      }
    }

    const data: StudentRow[] = profiles.map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      role: p.role ?? 'student',
      starting_level: p.starting_level,
      created_at: p.created_at,
      telegram_connected: telegramSet.has(p.id),
      lessons_completed: progressMap[p.id] ?? 0,
      last_activity: lastActivityMap[p.id] ?? null,
    }));

    return { data, total: count ?? 0 };
  }

  static async getAllLessons(): Promise<LessonRow[]> {
    const [lessonsRes, modulesRes] = await Promise.all([
      supabase.from('lessons').select('*').order('order_index', { ascending: true }),
      supabase.from('lesson_modules').select('id, title'),
    ]);

    if (lessonsRes.error) throw lessonsRes.error;

    const moduleMap = new Map((modulesRes.data ?? []).map((m) => [m.id, m.title]));

    return (lessonsRes.data ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      module_id: l.module_id,
      module_title: l.module_id ? moduleMap.get(l.module_id) ?? null : null,
      subject: l.subject,
      pathway: l.pathway,
      estimated_duration_minutes: l.estimated_duration_minutes,
      difficulty: l.difficulty,
      order_index: l.order_index,
    }));
  }

  static async updateLesson(
    lessonId: string,
    updates: { title?: string; estimated_duration_minutes?: number }
  ): Promise<void> {
    const { error } = await supabase.from('lessons').update(updates).eq('id', lessonId);
    if (error) throw error;
  }

  static async updateStudentRole(userId: string, role: 'student' | 'admin'): Promise<void> {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  }

  static async getWeeklyActivity(): Promise<WeeklyActivity[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('study_activities')
      .select('activity_date, duration_seconds')
      .gte('activity_date', dateStr)
      .order('activity_date', { ascending: true });

    if (error) throw error;

    const map: Record<string, { sessions: number; minutes: number }> = {};
    for (const row of data ?? []) {
      const d = row.activity_date as string;
      if (!map[d]) map[d] = { sessions: 0, minutes: 0 };
      map[d].sessions += 1;
      map[d].minutes += Math.round(((row.duration_seconds as number) ?? 0) / 60);
    }

    return Object.entries(map).map(([date, v]) => ({ date, ...v }));
  }

  static async getTelegramStats() {
    const [connectionsRes, logsRes] = await Promise.allSettled([
      supabase
        .from('telegram_connections')
        .select('id, user_id, telegram_username, connected_at, is_active'),
      supabase
        .from('notification_logs')
        .select('id, user_id, notification_type, status, sent_at')
        .order('sent_at', { ascending: false })
        .limit(50),
    ]);

    return {
      connections: connectionsRes.status === 'fulfilled' ? (connectionsRes.value.data ?? []) : [],
      logs: logsRes.status === 'fulfilled' ? (logsRes.value.data ?? []) : [],
    };
  }
}
