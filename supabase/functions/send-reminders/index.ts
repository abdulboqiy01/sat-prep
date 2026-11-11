// Supabase Edge Function: send-reminders
// Scheduled runner to send personalized SAT study reminders via Telegram
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseAdminClient } from '../_shared/supabaseClient.ts';
import { corsHeaders } from '../_shared/cors.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://sat-prep-beige.vercel.app';

/**
 * Sends message through Telegram Bot API
 */
async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: Record<string, unknown>
) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured in Supabase secrets.');
  }

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

/**
 * Checks whether the current time in the specified timezone matches the user's reminder window.
 */
function isTimeForReminder(
  userTimezone: string,
  reminderTime: string, // "HH:MM:SS" or "HH:MM"
  windowMinutes = 35
): { isDue: boolean; localHour: number; localMinute: number } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

    const [targetHour, targetMinute] = reminderTime.split(':').map((s) => parseInt(s, 10));

    const currentTotalMinutes = hour * 60 + minute;
    const targetTotalMinutes = targetHour * 60 + (targetMinute || 0);

    // Difference in minutes (handling edge of midnight)
    const diff = Math.abs(currentTotalMinutes - targetTotalMinutes);
    const isDue = diff <= windowMinutes || Math.abs(diff - 1440) <= windowMinutes;

    return { isDue, localHour: hour, localMinute: minute };
  } catch (e) {
    // If invalid timezone, fallback to UTC
    return { isDue: true, localHour: 0, localMinute: 0 };
  }
}

/**
 * Gets day of week for a given timezone in lowercase ("monday", "tuesday", etc.)
 */
function getDayOfWeekInTimezone(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
    });
    return formatter.format(new Date()).toLowerCase();
  } catch {
    return 'monday';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = getSupabaseAdminClient();

  try {
    // Check if invoked as a single-user test reminder
    let payload: any = {};
    if (req.method === 'POST') {
      try {
        payload = await req.json();
      } catch {
        // payload remains empty for GET/cron calls
      }
    }

    // --- CASE 1: Individual Test Reminder Request ---
    if (payload.action === 'test_notification') {
      // Find user from authorization header or payload
      const authHeader = req.headers.get('Authorization');
      let userId = payload.user_id;

      if (!userId && authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const {
          data: { user },
        } = await supabase.auth.getUser(token);
        userId = user?.id;
      }

      if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID required for test notification' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check telegram connection
      const { data: conn } = await supabase
        .from('telegram_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (!conn) {
        return new Response(
          JSON.stringify({ error: 'Telegram account is not connected yet.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch user profile and active roadmap
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
          .select('title, estimated_minutes, item_type')
          .eq('roadmap_id', roadmap.id)
          .eq('status', 'pending')
          .order('order_index', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextItem) {
          lessonTitle = nextItem.title;
          estMinutes = nextItem.estimated_minutes || 30;
          subject = lessonTitle.toLowerCase().includes('reading') || lessonTitle.toLowerCase().includes('r&w')
            ? 'Reading & Writing'
            : 'Math';
        }
      }

      const testMsg =
        `🔔 *Test Reminder from SATPrep!* 👋\n\n` +
        `Hello ${profile?.full_name || 'Student'}! This is a test confirmation of your Telegram study notifications.\n\n` +
        `📚 *Today's Planned Focus:*\n` +
        `• ${subject}: *${lessonTitle}*\n` +
        `• Estimated duration: *${estMinutes} minutes*\n` +
        `• Pathway: *${(profile?.starting_level || 'pre_sat').toUpperCase().replace('_', ' ')}*\n\n` +
        `Keep working towards your SAT goal score of *${profile?.target_score || 1400}*! 🚀`;

      await sendTelegramMessage(conn.telegram_chat_id, testMsg, {
        inline_keyboard: [
          [{ text: '📚 Start Lesson Now', url: `${FRONTEND_URL}/learn` }],
          [{ text: '📊 Go to Dashboard', url: `${FRONTEND_URL}/dashboard` }],
        ],
      });

      // Log the notification
      await supabase.from('notification_logs').insert({
        user_id: userId,
        notification_type: 'daily_reminder',
        scheduled_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: 'sent',
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test notification delivered successfully to your Telegram.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- CASE 2: Scheduled Batch Reminder Runner ---
    // 1. Fetch all enabled reminder settings
    const { data: settingsList, error: settingsError } = await supabase
      .from('reminder_settings')
      .select('user_id, reminder_time, timezone, study_days, reminder_before_minutes')
      .eq('enabled', true);

    if (settingsError || !settingsList) {
      throw new Error(`Failed to query reminder settings: ${settingsError?.message}`);
    }

    const results = {
      total_checked: settingsList.length,
      sent: 0,
      skipped_not_day: 0,
      skipped_not_time: 0,
      skipped_already_sent: 0,
      skipped_no_connection: 0,
      errors: 0,
    };

    const now = new Date();
    const eighteenHoursAgo = new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString();

    for (const settings of settingsList) {
      try {
        const userId = settings.user_id;
        const userTz = settings.timezone || 'UTC';
        const studyDays = settings.study_days || ['monday', 'wednesday', 'saturday'];
        const reminderTime = settings.reminder_time || '18:00:00';

        // 2. Check study day
        const currentDay = getDayOfWeekInTimezone(userTz);
        if (!studyDays.map((d: string) => d.toLowerCase()).includes(currentDay)) {
          results.skipped_not_day++;
          continue;
        }

        // 3. Check time window (unless forced)
        if (!payload.force) {
          const { isDue } = isTimeForReminder(userTz, reminderTime, 35);
          if (!isDue) {
            results.skipped_not_time++;
            continue;
          }
        }

        // 4. Prevent duplicate notifications (check if sent in last 18 hours)
        const { data: recentLog } = await supabase
          .from('notification_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('notification_type', 'daily_reminder')
          .gte('created_at', eighteenHoursAgo)
          .maybeSingle();

        if (recentLog && !payload.force) {
          results.skipped_already_sent++;
          continue;
        }

        // 5. Check active telegram connection
        const { data: conn } = await supabase
          .from('telegram_connections')
          .select('telegram_chat_id, is_active')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (!conn) {
          results.skipped_no_connection++;
          continue;
        }

        // 6. Fetch user profile & roadmap data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, target_score, starting_level')
          .eq('id', userId)
          .single();

        const { data: roadmap } = await supabase
          .from('roadmaps')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        let lessonTitle = 'Core SAT Strategy & Practice';
        let estMinutes = 45;
        let domain = 'Math & Reading';

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
            estMinutes = nextItem.estimated_minutes || 45;
            domain = lessonTitle.toLowerCase().includes('reading') || lessonTitle.toLowerCase().includes('craft')
              ? 'Reading & Writing'
              : 'Math';
          }
        }

        const studentName = profile?.full_name ? `${profile.full_name}` : 'Student';
        const targetScore = profile?.target_score || 1400;

        const reminderMessage =
          `Hello ${studentName}! 👋\n\n` +
          `Today you have a SAT study session!\n\n` +
          `📚 *Today's plan:*\n` +
          `• ${domain}: *${lessonTitle}*\n` +
          `• Estimated duration: *${estMinutes} minutes*\n` +
          `• Mini-test: *10 questions*\n\n` +
          `Keep working towards your SAT goal of *${targetScore}*! 🚀`;

        // Send Telegram message
        await sendTelegramMessage(conn.telegram_chat_id, reminderMessage, {
          inline_keyboard: [
            [{ text: '🚀 Continue Today\'s Lesson', url: `${FRONTEND_URL}/learn` }],
            [{ text: '📈 View My Roadmap', url: `${FRONTEND_URL}/roadmap` }],
          ],
        });

        // 7. Log success
        await supabase.from('notification_logs').insert({
          user_id: userId,
          notification_type: 'daily_reminder',
          scheduled_at: now.toISOString(),
          sent_at: new Date().toISOString(),
          status: 'sent',
        });

        results.sent++;

        // Small pause to respect Telegram rate limits
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (userErr: any) {
        console.error(`Error sending reminder to user ${settings.user_id}:`, userErr.message);
        results.errors++;

        await supabase.from('notification_logs').insert({
          user_id: settings.user_id,
          notification_type: 'daily_reminder',
          scheduled_at: now.toISOString(),
          status: 'failed',
          error_message: userErr.message,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('send-reminders error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
