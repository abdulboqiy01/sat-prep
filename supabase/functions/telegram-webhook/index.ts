// Supabase Edge Function: telegram-webhook
// Handles Telegram Webhook events for SATPrep Bot
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseAdminClient } from '../_shared/supabaseClient.ts';
import { corsHeaders } from '../_shared/cors.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const TELEGRAM_WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET') || '';
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://sat-prep-beige.vercel.app';

/**
 * Computes SHA-256 hex string in Deno.
 */
async function sha256Hex(str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Sends a message via Telegram Bot API.
 */
async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options: {
    parse_mode?: 'Markdown' | 'HTML';
    reply_markup?: Record<string, unknown>;
  } = {}
) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not configured.');
    return { ok: false, description: 'Missing bot token' };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || 'Markdown',
        reply_markup: options.reply_markup,
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      console.error('Telegram API error:', body);
    }
    return body;
  } catch (err: any) {
    console.error('Failed to send Telegram message:', err.message);
    return { ok: false, description: err.message };
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Security Check: Verify Telegram Secret Token if configured
  if (TELEGRAM_WEBHOOK_SECRET) {
    const receivedSecret = req.headers.get('x-telegram-bot-api-secret-token');
    if (receivedSecret !== TELEGRAM_WEBHOOK_SECRET) {
      console.warn('Unauthorized webhook call - secret token mismatch');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const update = await req.json();
    const message = update.message;

    // We only process regular text messages
    if (!message || !message.text) {
      return new Response(JSON.stringify({ status: 'ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const fromUser = message.from || {};
    const telegramUsername = fromUser.username || null;
    const firstName = fromUser.first_name || 'Student';

    const supabase = getSupabaseAdminClient();

    // Command router
    const [command, ...args] = text.split(' ');
    const param = args.join(' ').trim();

    // 1. /start [token]
    if (command === '/start') {
      if (param) {
        // Token provided: Execute linking flow
        const tokenHash = await sha256Hex(param);
        const nowIso = new Date().toISOString();

        // Query token record
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
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🌐 Go to SATPrep Settings', url: `${FRONTEND_URL}/settings` }],
                ],
              },
            }
          );
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (tokenRow.used_at) {
          await sendTelegramMessage(
            chatId,
            `⚠️ *Token Already Used*\n\nThis single-use linking code has already been redeemed. If you need to re-link your account, generate a new one from your dashboard.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🌐 Go to SATPrep Settings', url: `${FRONTEND_URL}/settings` }],
                ],
              },
            }
          );
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (new Date(tokenRow.expires_at) < new Date()) {
          await sendTelegramMessage(
            chatId,
            `⏳ *Token Expired*\n\nLinking tokens are valid for 10 minutes for your security. Please click "Connect Telegram" again in SATPrep to get a fresh link.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🌐 Generate New Link', url: `${FRONTEND_URL}/settings` }],
                ],
              },
            }
          );
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Token is valid! Mark as used
        await supabase
          .from('telegram_link_tokens')
          .update({ used_at: nowIso })
          .eq('id', tokenRow.id);

        const userId = tokenRow.user_id;

        // Associate user and telegram_chat_id
        const { error: linkError } = await supabase
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

        if (linkError) {
          console.error('Failed to store connection:', linkError);
          await sendTelegramMessage(
            chatId,
            `❌ *Connection Error*\n\nCould not complete account linking: ${linkError.message}. Please try again.`
          );
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Initialize default reminder settings if missing
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

        // Fetch user profile info
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
            `Your Telegram account is now successfully linked to your SATPrep dashboard.\n\n` +
            `📋 *Your Profile Overview:*\n` +
            `• Target Score: *${target}*\n` +
            `• Pathway: *${pathway}*\n` +
            `• Reminders: *Active* (Mon, Wed, Sat at 18:00 UTC)\n\n` +
            `We'll send you daily reminders with your personalized lesson topics so you never miss a study streak! 🚀\n\n` +
            `💡 *Helpful Commands:*\n` +
            `/status - Check your next SAT lesson & roadmap\n` +
            `/settings - View reminder schedule\n` +
            `/disconnect - Unlink this Telegram account\n` +
            `/help - View command list`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🚀 Open SATPrep Dashboard', url: `${FRONTEND_URL}/dashboard` }],
                [{ text: '📚 Start Learning', url: `${FRONTEND_URL}/learn` }],
              ],
            },
          }
        );

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // No token provided with /start: Check if already connected
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
            `Use /status to see your next scheduled study module, or /settings to adjust your study days.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '📚 Continue Studying', url: `${FRONTEND_URL}/learn` }],
              ],
            },
          }
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `👋 *Welcome to SATPrep Reminder Bot!* 🎯\n\n` +
            `To connect your account and receive personalized study reminders:\n\n` +
            `1. Sign in to your SATPrep account.\n` +
            `2. Go to **Settings**.\n` +
            `3. Click **Connect Telegram**.\n\n` +
            `The link will automatically verify your account here!`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🌐 Connect on SATPrep', url: `${FRONTEND_URL}/settings` }],
              ],
            },
          }
        );
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch user profile and active roadmap
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
          .select('title, estimated_minutes, order_index')
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
          `Keep up the daily momentum to hit your score goal! 🚀`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📖 Open Current Lesson', url: `${FRONTEND_URL}/learn` }],
              [{ text: '🗺️ View Roadmap', url: `${FRONTEND_URL}/roadmap` }],
            ],
          },
        }
      );

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
          reply_markup: {
            inline_keyboard: [
              [{ text: '⚙️ Edit Reminder Settings', url: `${FRONTEND_URL}/settings` }],
            ],
          },
        }
      );

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. /disconnect
    if (command === '/disconnect') {
      const { data: conn } = await supabase
        .from('telegram_connections')
        .select('user_id')
        .eq('telegram_chat_id', chatId)
        .eq('is_active', true)
        .maybeSingle();

      if (!conn) {
        await sendTelegramMessage(chatId, `ℹ️ This Telegram chat is not currently connected to any active SATPrep account.`);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Reconnect in Settings', url: `${FRONTEND_URL}/settings` }],
            ],
          },
        }
      );

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
        reply_markup: {
          inline_keyboard: [
            [{ text: '🤖 Open AI Tutor', url: `${FRONTEND_URL}/tutor` }],
            [{ text: '📊 Dashboard', url: `${FRONTEND_URL}/dashboard` }],
          ],
        },
      }
    );

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
