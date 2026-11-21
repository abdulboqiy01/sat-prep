import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://kqxnhnjcpzlxsxnroxmx.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeG5obmpjcHpseHN4bnJveG14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzU0MDAyOSwiZXhwIjoyMTA5MTE2MDI5fQ.Caj7z9454M-3bjDsyXV_6uTSk9Rv_l3te5BbRm-BSFI';

const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  '9092984914:AAEMrpw-0rn58lFn2eRVFzwZAtDfEOmqTGE';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sat-prep-beige.vercel.app';

async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: Record<string, unknown>
) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: replyMarkup,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.description || 'Failed to send Telegram message');
  }
  return data;
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    let payload = req.body || {};
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = {};
      }
    }

    // 1. Identify user if bearer token or payload present
    const authHeader = req.headers.authorization;
    let userId = payload.user_id;

    if (!userId && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // 2. Action: Test notification for a single user (from Settings page)
    if (payload.action === 'test_notification') {
      if (!userId) {
        return res.status(401).json({ error: 'Please sign in to send a test reminder.' });
      }

      // Check telegram connection
      const { data: conn } = await supabase
        .from('telegram_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (!conn) {
        return res.status(400).json({
          error: 'Your Telegram is not connected yet. Click "Connect Telegram" first!',
        });
      }

      // Fetch profile & roadmap
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, target_score, starting_level')
        .eq('id', userId)
        .single();

      const { data: roadmap } = await supabase
        .from('roadmaps')
        .select('id, pathway')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      let lessonTitle = 'Quadratic Equations & Parabolas';
      let estMinutes = 35;
      let subject = 'Math';

      if (roadmap) {
        const { data: nextItem } = await supabase
          .from('roadmap_items')
          .select('title, estimated_minutes')
          .eq('roadmap_id', roadmap.id)
          .eq('status', 'pending')
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextItem) {
          lessonTitle = nextItem.title;
          estMinutes = nextItem.estimated_minutes || 30;
          subject =
            lessonTitle.toLowerCase().includes('reading') || lessonTitle.toLowerCase().includes('r&w')
              ? 'Reading & Writing'
              : 'Math';
        }
      }

      const studentName = profile?.full_name || 'Student';
      const targetScore = profile?.target_score || 1400;

      const testMsg =
        `🔔 *Тестовое напоминание от SATPrep!* 👋\n\n` +
        `Привет, ${studentName}! Твои Telegram-напоминания успешно настроены и активны.\n\n` +
        `📚 *Следующий запланированный урок:*\n` +
        `• Предмет: *${subject}*\n` +
        `• Тема: *${lessonTitle}*\n` +
        `• Длительность: *${estMinutes} минут*\n` +
        `• Целевой балл: *${targetScore}*\n\n` +
        `Бот будет присылать напоминание точно до начала каждого урока! 🚀`;

      await sendTelegramMessage(conn.telegram_chat_id, testMsg, {
        inline_keyboard: [
          [{ text: '📚 Открыть урок', url: `${FRONTEND_URL}/learn` }],
          [{ text: '📊 Личный кабинет', url: `${FRONTEND_URL}/dashboard` }],
        ],
      });

      // Log notification
      await supabase.from('notification_logs').insert({
        user_id: userId,
        notification_type: 'daily_reminder',
        scheduled_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: 'sent',
      });

      return res.status(200).json({
        success: true,
        message: 'Test reminder delivered! Check your Telegram messages.',
      });
    }

    // 3. Batch Cron Reminder Runner (Runs periodically via GitHub Actions or Vercel Cron)
    const { data: connections, error: connError } = await supabase
      .from('telegram_connections')
      .select('id, user_id, telegram_chat_id, telegram_username')
      .eq('is_active', true);

    if (connError) throw connError;

    if (!connections || connections.length === 0) {
      return res.status(200).json({ status: 'No active telegram connections', sent: 0 });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const conn of connections) {
      try {
        // Fetch reminder settings for this student
        const { data: settings } = await supabase
          .from('reminder_settings')
          .select('*')
          .eq('user_id', conn.user_id)
          .maybeSingle();

        // If settings exist and disabled, skip
        if (settings && !settings.enabled) {
          continue;
        }

        // Determine current local time in student's timezone
        const tz = settings?.timezone || 'Asia/Tashkent';
        let localDay = '';
        let localHour = 0;
        let localMinute = 0;
        let localDateStr = '';

        try {
          const now = new Date();
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const parts = formatter.formatToParts(now);
          localDay = (parts.find((p) => p.type === 'weekday')?.value || '').toLowerCase();
          localHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
          localMinute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
          
          const y = parts.find((p) => p.type === 'year')?.value;
          const m = parts.find((p) => p.type === 'month')?.value;
          const d = parts.find((p) => p.type === 'day')?.value;
          localDateStr = `${y}-${m}-${d}`;
        } catch {
          // Fallback to UTC if timezone string is unknown
          const now = new Date();
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          localDay = dayNames[now.getUTCDay()];
          localHour = now.getUTCHours();
          localMinute = now.getUTCMinutes();
          localDateStr = now.toISOString().split('T')[0];
        }

        // Check study days
        if (settings?.study_days && settings.study_days.length > 0) {
          const isStudyDay = settings.study_days.some(
            (d: string) => d.toLowerCase() === localDay
          );
          if (!isStudyDay) continue; // Today is not a study day for this student
        }

        // Calculate lesson time and notification target time
        const rawReminderTime = settings?.reminder_time || '18:00:00';
        const [rHour, rMinute] = rawReminderTime.split(':').map((v: string) => parseInt(v, 10) || 0);
        const lessonMinutesFromMidnight = rHour * 60 + rMinute;

        // How many minutes before the lesson to send notification (e.g. 15 or 30 mins)
        const reminderBefore = settings?.reminder_before_minutes ?? 15;
        const targetNotifyMinutes = lessonMinutesFromMidnight - reminderBefore;
        const currentMinutesFromMidnight = localHour * 60 + localMinute;

        // Window check: if current time is within [-5, +14] minutes of the scheduled reminder time
        const diff = currentMinutesFromMidnight - targetNotifyMinutes;
        const isInNotificationWindow = diff >= -5 && diff <= 15;

        // Only send if we are in the time window (or if manually triggered with bypass)
        if (!isInNotificationWindow && payload.force !== true) {
          continue;
        }

        // Check if reminder was already sent today to avoid double notifying
        const { data: alreadySent } = await supabase
          .from('notification_logs')
          .select('id')
          .eq('user_id', conn.user_id)
          .eq('status', 'sent')
          .gte('sent_at', `${localDateStr}T00:00:00Z`)
          .limit(1)
          .maybeSingle();

        if (alreadySent && payload.force !== true) {
          continue;
        }

        // Get user profile & next roadmap lesson
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, target_score')
          .eq('id', conn.user_id)
          .single();

        const { data: roadmap } = await supabase
          .from('roadmaps')
          .select('id')
          .eq('user_id', conn.user_id)
          .eq('is_active', true)
          .maybeSingle();

        let lessonTitle = 'Key SAT Skills Practice';
        let estMinutes = 30;

        if (roadmap) {
          const { data: nextItem } = await supabase
            .from('roadmap_items')
            .select('title, estimated_minutes')
            .eq('roadmap_id', roadmap.id)
            .eq('status', 'pending')
            .order('order_index', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (nextItem) {
            lessonTitle = nextItem.title;
            estMinutes = nextItem.estimated_minutes || 30;
          }
        }

        const studentName = profile?.full_name || 'Студент';
        const formattedLessonTime = `${String(rHour).padStart(2, '0')}:${String(rMinute).padStart(2, '0')}`;

        // Calculate actual real-time remaining minutes to avoid confusion if cron triggers with a delay
        const minutesUntilLesson = lessonMinutesFromMidnight - currentMinutesFromMidnight;
        let timeRemainingText = `через *${reminderBefore} минут* (в *${formattedLessonTime}*)`;

        if (minutesUntilLesson <= 1 && minutesUntilLesson >= -5) {
          timeRemainingText = `*прямо сейчас* (в *${formattedLessonTime}*)`;
        } else if (minutesUntilLesson > 1 && minutesUntilLesson < reminderBefore) {
          timeRemainingText = `через *${minutesUntilLesson} мин.* (в *${formattedLessonTime}*)`;
        }

        const msg =
          `⏰ *Напоминание о занятии SAT!* 📖\n\n` +
          `Привет, ${studentName}! Твой урок начнется ${timeRemainingText}.\n\n` +
          `🎯 *Тема сегодняшнего урока:* ${lessonTitle}\n` +
          `⏱ *Ориентировочное время:* ${estMinutes} минут\n\n` +
          `Удели время сегодня, чтобы стабильно набрать свой целевой балл! 💪`;

        await sendTelegramMessage(conn.telegram_chat_id, msg, {
          inline_keyboard: [
            [{ text: '🚀 Начать урок сейчас', url: `${FRONTEND_URL}/learn` }],
            [{ text: '📊 Мой прогресс', url: `${FRONTEND_URL}/progress` }],
          ],
        });

        await supabase.from('notification_logs').insert({
          user_id: conn.user_id,
          notification_type: 'daily_reminder',
          scheduled_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

        sentCount++;
      } catch (userErr: any) {
        errors.push(`User ${conn.user_id}: ${userErr.message}`);
        await supabase.from('notification_logs').insert({
          user_id: conn.user_id,
          notification_type: 'daily_reminder',
          scheduled_at: new Date().toISOString(),
          status: 'failed',
          error_message: userErr.message,
        });
      }
    }

    return res.status(200).json({
      status: 'Batch completed',
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('send-reminders error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
