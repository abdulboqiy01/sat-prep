import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import {
  I18N,
  parseTimezoneAndLang,
  getLanguageKeyboard,
  type BotLanguage,
} from './telegram-i18n';

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

function sha256Hex(str: string): string {
  const hash = createHash('sha256');
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

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });
  } catch (err: any) {
    console.error('Failed to answer callback query:', err.message);
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
    const callbackQuery = update?.callback_query;
    const message = update?.message || callbackQuery?.message;

    if (!callbackQuery && (!message || !message.text)) {
      return res.status(200).json({ status: 'ignored' });
    }

    const chatId = callbackQuery ? callbackQuery.message?.chat?.id : message.chat.id;
    const fromUser = callbackQuery ? callbackQuery.from : message.from || {};
    const telegramUsername = fromUser.username || null;
    const firstName = fromUser.first_name || 'Student';

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Helper to determine the user's current saved language (defaulting to 'en')
    async function getUserLanguageAndSettings(): Promise<{
      userId: string | null;
      language: BotLanguage;
      timezone: string;
      settings: any;
    }> {
      const { data: conn } = await supabase
        .from('telegram_connections')
        .select('user_id')
        .eq('telegram_chat_id', chatId)
        .eq('is_active', true)
        .maybeSingle();

      if (!conn?.user_id) {
        return { userId: null, language: 'en', timezone: 'Asia/Tashkent', settings: null };
      }

      const { data: setts } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', conn.user_id)
        .maybeSingle();

      const { timezone, language } = parseTimezoneAndLang(setts?.timezone);
      return { userId: conn.user_id, language, timezone, settings: setts };
    }

    // Helper to save language
    async function saveUserLanguage(newLang: BotLanguage, userId?: string | null) {
      if (userId) {
        const { data: currentSetts } = await supabase
          .from('reminder_settings')
          .select('timezone')
          .eq('user_id', userId)
          .maybeSingle();

        const currentTz = (currentSetts?.timezone || 'Asia/Tashkent').split('#')[0];
        await supabase
          .from('reminder_settings')
          .update({ timezone: `${currentTz}#${newLang}` })
          .eq('user_id', userId);
      }
    }

    // =========================================================================
    // 0. Handle Inline Button Callback Queries (Language Switcher)
    // =========================================================================
    if (callbackQuery) {
      const data = callbackQuery.data || '';

      if (data.startsWith('set_lang_')) {
        const selectedLang = data.replace('set_lang_', '') as BotLanguage;
        const validLang: BotLanguage = selectedLang === 'ru' || selectedLang === 'uz' ? selectedLang : 'en';

        const { userId } = await getUserLanguageAndSettings();
        await saveUserLanguage(validLang, userId);

        const t = I18N[validLang];
        await answerCallbackQuery(callbackQuery.id, `Language: ${t.langName}`);

        await sendTelegramMessage(chatId, t.languageChanged, {
          inline_keyboard: [
            [{ text: t.btnDashboard, url: `${FRONTEND_URL}/dashboard` }],
            [{ text: t.btnStartLearning, url: `${FRONTEND_URL}/learn` }],
            [{ text: t.btnChangeLang, callback_data: 'open_lang_menu' }],
          ],
        });
        return res.status(200).json({ ok: true });
      }

      if (data === 'open_lang_menu') {
        await answerCallbackQuery(callbackQuery.id);
        const { language } = await getUserLanguageAndSettings();
        const t = I18N[language];
        await sendTelegramMessage(chatId, t.chooseLanguage, getLanguageKeyboard());
        return res.status(200).json({ ok: true });
      }
    }

    // =========================================================================
    // Parse Text Commands
    // =========================================================================
    const text = (message.text || '').trim();
    const [command, ...args] = text.split(' ');
    const param = args.join(' ').trim().toLowerCase();

    const { userId, language: currentLang, settings } = await getUserLanguageAndSettings();
    const t = I18N[currentLang];

    // 1. /language or /lang
    if (command === '/language' || command === '/lang') {
      if (param === 'en' || param === 'ru' || param === 'uz') {
        const newLang = param as BotLanguage;
        await saveUserLanguage(newLang, userId);
        const newT = I18N[newLang];
        await sendTelegramMessage(chatId, newT.languageChanged, {
          inline_keyboard: [
            [{ text: newT.btnDashboard, url: `${FRONTEND_URL}/dashboard` }],
            [{ text: newT.btnStartLearning, url: `${FRONTEND_URL}/learn` }],
            [{ text: newT.btnChangeLang, callback_data: 'open_lang_menu' }],
          ],
        });
        return res.status(200).json({ ok: true });
      }

      await sendTelegramMessage(chatId, t.chooseLanguage, getLanguageKeyboard());
      return res.status(200).json({ ok: true });
    }

    // 2. /start [token]
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
          await sendTelegramMessage(chatId, t.invalidToken, {
            inline_keyboard: [
              [{ text: t.btnConnectSettings, url: `${FRONTEND_URL}/settings` }],
            ],
          });
          return res.status(200).json({ ok: true });
        }

        if (tokenRow.used_at) {
          await sendTelegramMessage(chatId, t.tokenUsed, {
            inline_keyboard: [
              [{ text: t.btnConnectSettings, url: `${FRONTEND_URL}/settings` }],
            ],
          });
          return res.status(200).json({ ok: true });
        }

        if (new Date(tokenRow.expires_at) < new Date()) {
          await sendTelegramMessage(chatId, t.tokenExpired, {
            inline_keyboard: [
              [{ text: t.btnConnectSettings, url: `${FRONTEND_URL}/settings` }],
            ],
          });
          return res.status(200).json({ ok: true });
        }

        // Mark token as used
        await supabase
          .from('telegram_link_tokens')
          .update({ used_at: nowIso })
          .eq('id', tokenRow.id);

        const newUserId = tokenRow.user_id;

        // Clean any old records
        await supabase.from('telegram_connections').delete().eq('telegram_chat_id', chatId);
        await supabase.from('telegram_connections').delete().eq('user_id', newUserId);

        // Insert new connection
        const { error: connInsertError } = await supabase
          .from('telegram_connections')
          .insert({
            user_id: newUserId,
            telegram_chat_id: chatId,
            telegram_username: telegramUsername,
            connected_at: nowIso,
            is_active: true,
          });

        if (connInsertError) {
          console.error('Error inserting telegram connection:', connInsertError);
          throw connInsertError;
        }

        // Ensure default reminder settings exist with English as primary default
        await supabase
          .from('reminder_settings')
          .upsert(
            {
              user_id: newUserId,
              enabled: true,
              reminder_time: '18:00:00',
              timezone: 'Asia/Tashkent#en',
              study_days: ['monday', 'wednesday', 'saturday'],
              reminder_before_minutes: 15,
            },
            { onConflict: 'user_id' }
          )
          .select()
          .maybeSingle();

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, target_score, starting_level')
          .eq('id', newUserId)
          .single();

        const studentName = profile?.full_name || firstName;
        const target = profile?.target_score || 1400;
        const pathway = (profile?.starting_level || 'pre_sat').toUpperCase().replace('_', ' ');

        // Welcome in default English (with quick buttons to change language)
        const defT = I18N.en;
        await sendTelegramMessage(
          chatId,
          defT.welcomeLinked(studentName, target, pathway),
          {
            inline_keyboard: [
              [{ text: defT.btnDashboard, url: `${FRONTEND_URL}/dashboard` }],
              [{ text: defT.btnStartLearning, url: `${FRONTEND_URL}/learn` }],
              [{ text: '🌐 Change Language (O\'zbekcha / Русский)', callback_data: 'open_lang_menu' }],
            ],
          }
        );

        return res.status(200).json({ ok: true });
      }

      // /start without token
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .maybeSingle();

        const student = profile?.full_name || firstName;
        await sendTelegramMessage(
          chatId,
          t.welcomeBack(student),
          {
            inline_keyboard: [
              [{ text: t.btnContinueStudying, url: `${FRONTEND_URL}/learn` }],
              [{ text: t.btnChangeLang, callback_data: 'open_lang_menu' }],
            ],
          }
        );
      } else {
        await sendTelegramMessage(
          chatId,
          t.welcomeUnlinked,
          {
            inline_keyboard: [
              [{ text: t.btnConnectSettings, url: `${FRONTEND_URL}/settings` }],
              [{ text: t.btnChangeLang, callback_data: 'open_lang_menu' }],
            ],
          }
        );
      }

      return res.status(200).json({ ok: true });
    }

    // 3. /status
    if (command === '/status') {
      if (!userId) {
        await sendTelegramMessage(chatId, t.statusNotLinked);
        return res.status(200).json({ ok: true });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, target_score, starting_level')
        .eq('id', userId)
        .single();

      const { data: roadmap } = await supabase
        .from('roadmaps')
        .select('id, pathway, status')
        .eq('user_id', userId)
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
        t.statusReport(
          profile?.full_name || 'Student',
          profile?.target_score || 1400,
          (profile?.starting_level || 'pre_sat').replace('_', ' ').toUpperCase(),
          nextLessonText
        ),
        {
          inline_keyboard: [
            [{ text: t.btnOpenLesson, url: `${FRONTEND_URL}/learn` }],
            [{ text: t.btnViewRoadmap, url: `${FRONTEND_URL}/roadmap` }],
          ],
        }
      );

      return res.status(200).json({ ok: true });
    }

    // 4. /settings
    if (command === '/settings') {
      if (!userId) {
        await sendTelegramMessage(chatId, t.settingsNotLinked);
        return res.status(200).json({ ok: true });
      }

      const days = (settings?.study_days || ['monday', 'wednesday', 'saturday'])
        .map((d: string) => d.slice(0, 3).toUpperCase())
        .join(', ');

      const { timezone, language } = parseTimezoneAndLang(settings?.timezone);
      const curT = I18N[language];

      await sendTelegramMessage(
        chatId,
        curT.settingsReport(
          settings?.enabled ?? true,
          settings?.reminder_time || '18:00:00',
          timezone,
          days,
          settings?.reminder_before_minutes || 15,
          curT.langFlag + ' ' + curT.langName
        ),
        {
          inline_keyboard: [
            [{ text: curT.btnSettings, url: `${FRONTEND_URL}/settings` }],
            [{ text: curT.btnChangeLang, callback_data: 'open_lang_menu' }],
          ],
        }
      );

      return res.status(200).json({ ok: true });
    }

    // 5. /disconnect
    if (command === '/disconnect') {
      await supabase
        .from('telegram_connections')
        .update({ is_active: false })
        .eq('telegram_chat_id', chatId);

      await sendTelegramMessage(chatId, t.disconnectSuccess, {
        inline_keyboard: [
          [{ text: t.btnConnectSettings, url: `${FRONTEND_URL}/settings` }],
        ],
      });

      return res.status(200).json({ ok: true });
    }

    // 6. /help (Default)
    await sendTelegramMessage(chatId, t.helpMessage, {
      inline_keyboard: [
        [{ text: t.btnAITutor, url: `${FRONTEND_URL}/tutor` }],
        [{ text: t.btnDashboard, url: `${FRONTEND_URL}/dashboard` }],
        [{ text: t.btnChangeLang, callback_data: 'open_lang_menu' }],
      ],
    });

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
