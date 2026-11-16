import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://kqxnhnjcpzlxsxnroxmx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
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

    // 1. Identify user
    const authHeader = req.headers.authorization;
    let userId = payload.user_id;

    if (!userId && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // If still no user and it's a test notification
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
        `🔔 *Test Reminder from SATPrep!* 👋\n\n` +
        `Hello ${studentName}! Your Telegram study notifications are actively working.\n\n` +
        `📚 *Today's Planned Focus:*\n` +
        `• ${subject}: *${lessonTitle}*\n` +
        `• Estimated duration: *${estMinutes} minutes*\n` +
        `• Target SAT Goal: *${targetScore}*\n\n` +
        `Keep working towards your score! 🚀`;

      await sendTelegramMessage(conn.telegram_chat_id, testMsg, {
        inline_keyboard: [
          [{ text: '📚 Start Lesson Now', url: `${FRONTEND_URL}/learn` }],
          [{ text: '📊 Go to Dashboard', url: `${FRONTEND_URL}/dashboard` }],
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

    // Default batch runner (Cron)
    return res.status(200).json({ status: 'Runner ready' });
  } catch (err: any) {
    console.error('send-reminders error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
