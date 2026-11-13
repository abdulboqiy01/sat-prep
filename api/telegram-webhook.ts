import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://kqxnhnjcpzlxsxnroxmx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sat-prep-beige.vercel.app';

function sha256Hex(str: string): string {
  // Using native Web Crypto or Node crypto
  const hash = require('crypto').createHash('sha256');
  hash.update(str);
  return hash.digest('hex');
}

async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: Record<string, unknown>
) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
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
    return await res.json();
  } catch (err: any) {
    console.error('Failed to send Telegram message:', err.message);
    return { ok: false, description: err.message };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'SATPrep Telegram Webhook is active' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const update = req.body;
    const message = update?.message;

    if (!message || !message.text) {
      return res.status(200).json({ status: 'ignored' });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const fromUser = message.from || {};
    const telegramUsername = fromUser.username || null;
    const firstName = fromUser.first_name || 'Student';

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const [command, ...args] = text.split(' ');
    const param = args.join(' ').trim();

    // 1. /start [token]
    if (command === '/start') {
      if (param) {
        const tokenHash = sha256Hex(param);
        const nowIso = new Date().toISOString();

        const { data: tokenRow, error: tokenError } = await supabase
          .from('telegram_link_tokens')
          .select('id, user_id, expires_at, used_at')
          .eq('token_hash', tokenHash)
          .maybeSingle();

        if (tokenError || !tokenRow) {
          await sendTelegramMessage(
            chatId,
            `⚠️ *Invalid Linking Link*\n\nThis connection link was not found. Please log in to SATPrep, go to **Settings**, and generate a fresh link.`,
            {
              inline_keyboard: [
                [{ text: '🌐 Go to SATPrep Settings', url: `${FRONTEND_URL}/settings` }],
              ],
            }
          );
          return res.status(200).json({ ok: true });
        }

        if (tokenRow.used_at) {
          await sendTelegramMessage(
            chatId,
            `⚠️ *Token Already Used*\n\nThis single-use code has already been redeemed. If you need to re-link, click "Connect Telegram" in Settings.`,
            {
              inline_keyboard: [
                [{ text: '🌐 Go to Settings', url: `${FRONTEND_URL}/settings` }],
              ],
            }
          );
          return res.status(200).json({ ok: true });
        }

        if (new Date(tokenRow.expires_at) < new Date()) {
          await sendTelegramMessage(
            chatId,
            `⏳ *Token Expired*\n\nLinking tokens expire after 10 minutes for your security. Please click "Connect Telegram" again in SATPrep.`,
            {
              inline_keyboard: [
                [{ text: '🌐 Generate New Link', url: `${FRONTEND_URL}/settings` }],
              ],
            }
          );
          return res.status(200).json({ ok: true });
        }

        // Mark token as used
        await supabase
          .from('telegram_link_tokens')
          .update({ used_at: nowIso })
          .eq('id', tokenRow.id);

        const userId = tokenRow.user_id;

        // Upsert connection
        await supabase
          .from('telegram_connections')
          .upsert(
            {
              user_id: userId,
              telegram_chat_id: chatId,
              telegram_username: telegramUsername,
              connected_at: nowIso,
              is_active: true,
            },
            { onConflict: 'user_id' }
          );

        // Ensure default reminder settings exist
        await supabase
          .from('reminder_settings')
          .insert({
            user_id: userId,
            enabled: true,
            reminder_time: '18:00:00',
            timezone: 'UTC',
            study_days: ['monday', 'wednesday', 'saturday'],
            reminder_before_minutes: 30,
          })
          .select()
          .maybeSingle();

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, target_score, starting_level')
          .eq('id', userId)
          .single();

        const studentName = profile?.full_name || firstName;
        const target = profile?.target_score || 1400;
        const pathway = (profile?.starting_level || 'pre_sat').toUpperCase().replace('_', ' ');

        await sendTelegramMessage(
          chatId,
          `🎉 *Welcome to SATPrep, ${studentName}!* 🎓\n\n` +
            `Your Telegram account is now successfully linked to your SATPrep dashboard!\n\n` +
            `📋 *Your Profile Overview:*\n` +
            `• Target Score: *${target}*\n` +
            `• Pathway: *${pathway}*\n` +
            `• Reminders: *Active* (Mon, Wed, Sat at 18:00)\n\n` +
            `You will now receive personalized daily study schedules with direct lesson links! 🚀\n\n` +
            `💡 *Commands:*\n` +
            `/status - Check your next SAT lesson & roadmap\n` +
            `/settings - View reminder schedule\n` +
            `/disconnect - Unlink this Telegram account\n` +
            `/help - View command list`,
          {
            inline_keyboard: [
              [{ text: '🚀 Open SATPrep Dashboard', url: `${FRONTEND_URL}/dashboard` }],
              [{ text: '📚 Start Learning', url: `${FRONTEND_URL}/learn` }],
            ],
          }
        );

        return res.status(200).json({ ok: true });
      }

      // /start without token
      const { data: existingConn } = await supabase
        .from('telegram_connections')
        .select('user_id, is_active, profiles(full_name, target_score)')
        .eq('telegram_chat_id', chatId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingConn) {
        const student = (existingConn as any).profiles?.full_name || firstName;
        await sendTelegramMessage(
          chatId,
          `👋 *Welcome back, ${student}!* \n\n` +
            `Your account is actively linked to SATPrep.\n\n` +
            `Use /status to see your next scheduled study module, or /settings to view your schedule.`,
          {
            inline_keyboard: [
              [{ text: '📚 Continue Studying', url: `${FRONTEND_URL}/learn` }],
            ],
          }
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `👋 *Welcome to SATPrep Reminder Bot!* 🎯\n\n` +
            `To connect your account and receive study reminders:\n\n` +
            `1. Sign in to your SATPrep account.\n` +
            `2. Go to **Settings**.\n` +
            `3. Click **Connect Telegram**.\n\n` +
            `The link will automatically verify your account here!`,
          {
            inline_keyboard: [
              [{ text: '🌐 Connect on SATPrep', url: `${FRONTEND_URL}/settings` }],
            ],
          }
        );
      }

      return res.status(200).json({ ok: true });
    }

    // 2. /status
    if (command === '/status') {
      const { data: conn } = await supabase
        .from('telegram_connections')
        .select('user_id, is_active')
        .eq('telegram_chat_id', chatId)
        .eq('is_active', true)
        .maybeSingle();

      if (!conn) {
        await sendTelegramMessage(
          chatId,
          `⚠️ You haven't linked a SATPrep account yet.\n\nPlease log in at ${FRONTEND_URL}/settings and click **Connect Telegram**.`
        );
        return res.status(200).json({ ok: true });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, target_score, starting_level')
        .eq('id', conn.user_id)
        .single();

      const { data: roadmap } = await supabase
        .from('roadmaps')
        .select('id, pathway, status')
        .eq('user_id', conn.user_id)
        .eq('is_active', true)
        .maybeSingle();

      let nextLessonText = 'No pending lessons in roadmap.';
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
          nextLessonText = `*${nextItem.title}* (~${nextItem.estimated_minutes} mins)`;
        }
      }

      await sendTelegramMessage(
        chatId,
        `📊 *Your SAT Study Status*\n\n` +
          `👤 Student: *${profile?.full_name || 'Student'}*\n` +
          `🎯 Target Score: *${profile?.target_score || 1400}*\n` +
          `🛣️ Pathway: *${(profile?.starting_level || 'pre_sat').replace('_', ' ').toUpperCase()}*\n\n` +
          `📖 *Next Up on Your Roadmap:*\n${nextLessonText}\n\n` +
          `Keep up the momentum towards your dream score! 🚀`,
        {
          inline_keyboard: [
            [{ text: '📖 Open Current Lesson', url: `${FRONTEND_URL}/learn` }],
            [{ text: '🗺️ View Roadmap', url: `${FRONTEND_URL}/roadmap` }],
          ],
        }
      );

      return res.status(200).json({ ok: true });
    }

    // 3. /settings
    if (command === '/settings') {
      const { data: conn } = await supabase
        .from('telegram_connections')
        .select('user_id')
        .eq('telegram_chat_id', chatId)
        .eq('is_active', true)
        .maybeSingle();

      if (!conn) {
        await sendTelegramMessage(
          chatId,
          `⚠️ You haven't linked a SATPrep account yet.\nPlease visit ${FRONTEND_URL}/settings to connect.`
        );
        return res.status(200).json({ ok: true });
      }

      const { data: settings } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', conn.user_id)
        .maybeSingle();

      const days = (settings?.study_days || ['monday', 'wednesday', 'saturday'])
        .map((d: string) => d.slice(0, 3).toUpperCase())
        .join(', ');

      await sendTelegramMessage(
        chatId,
        `⚙️ *Your Reminder Settings*\n\n` +
          `• Reminders: *${settings?.enabled ? '✅ Enabled' : '⏸️ Paused'}*\n` +
          `• Preferred Time: *${settings?.reminder_time || '18:00:00'}*\n` +
          `• Timezone: *${settings?.timezone || 'UTC'}*\n` +
          `• Study Days: *${days}*\n` +
          `• Advance Notice: *${settings?.reminder_before_minutes || 30} minutes*\n\n` +
          `To modify these settings, update them in your SATPrep web settings:`,
        {
          inline_keyboard: [
            [{ text: '⚙️ Edit Reminder Settings', url: `${FRONTEND_URL}/settings` }],
          ],
        }
      );

      return res.status(200).json({ ok: true });
    }

    // 4. /disconnect
    if (command === '/disconnect') {
      await supabase
        .from('telegram_connections')
        .update({ is_active: false })
        .eq('telegram_chat_id', chatId);

      await sendTelegramMessage(
        chatId,
        `👋 *Telegram Disconnected*\n\n` +
          `Your Telegram account has been unlinked from SATPrep. You will no longer receive study reminders here.\n\n` +
          `You can reconnect at any time from your SATPrep Settings page.`,
        {
          inline_keyboard: [
            [{ text: '🌐 Reconnect in Settings', url: `${FRONTEND_URL}/settings` }],
          ],
        }
      );

      return res.status(200).json({ ok: true });
    }

    // 5. /help
    await sendTelegramMessage(
      chatId,
      `🤖 *SATPrep Reminder Bot Commands*\n\n` +
        `• /status - Check your current roadmap & next study lesson\n` +
        `• /settings - View your reminder schedule & notification days\n` +
        `• /disconnect - Unlink this Telegram account\n` +
        `• /help - Display this command overview\n\n` +
        `Need help with SAT concepts? Head to the platform to chat with your Socratic AI Tutor! 🦉`,
      {
        inline_keyboard: [
          [{ text: '🤖 Open AI Tutor', url: `${FRONTEND_URL}/tutor` }],
          [{ text: '📊 Dashboard', url: `${FRONTEND_URL}/dashboard` }],
        ],
      }
    );

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
