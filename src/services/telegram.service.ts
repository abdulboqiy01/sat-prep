import { supabase } from '../lib/supabase';
import type {
  TelegramConnection,
  ReminderSettings,
  NotificationLog,
  TelegramLinkResponse,
} from '../types/telegram.types';

export const DEFAULT_BOT_USERNAME =
  import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'SatPrepReminderBot';

/**
 * Computes SHA-256 hash of a string in hex representation.
 * Compatible with browser Web Crypto and Node.js Web Crypto.
 */
export async function sha256Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically secure random alphanumeric string.
 */
export function generateSecureRandomToken(length = 32): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

export class TelegramService {
  /**
   * Generates a single-use linking token valid for 10 minutes,
   * stores its SHA-256 hash in Supabase, and returns the Telegram deep link.
   */
  static async createLinkToken(): Promise<TelegramLinkResponse> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('You must be signed in to connect Telegram.');
    }

    const rawToken = generateSecureRandomToken(32);
    const tokenHash = await sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    const { error: insertError } = await supabase
      .from('telegram_link_tokens')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      throw new Error(`Failed to generate linking token: ${insertError.message}`);
    }

    const botUsername = DEFAULT_BOT_USERNAME.replace(/^@/, '');
    const deepLink = `https://t.me/${botUsername}?start=${rawToken}`;

    return {
      token: rawToken,
      deepLink,
      expiresAt,
    };
  }

  /**
   * Fetches the current active Telegram connection for the authenticated user.
   */
  static async getConnection(): Promise<TelegramConnection | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('telegram_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Telegram connection:', error);
      return null;
    }

    return (data as TelegramConnection) || null;
  }

  /**
   * Disconnects the linked Telegram account for the authenticated user.
   */
  static async disconnect(): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('telegram_connections')
      .update({ is_active: false })
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to disconnect Telegram: ${error.message}`);
    }
  }

  /**
   * Fetches the user's reminder settings. Initializes defaults if missing.
   */
  static async getReminderSettings(): Promise<ReminderSettings> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching reminder settings:', error);
    }

    if (data) {
      return data as ReminderSettings;
    }

    // Default settings
    const detectedTz =
      Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'UTC';

    const defaultSettings = {
      user_id: user.id,
      enabled: true,
      reminder_time: '18:00:00',
      timezone: detectedTz,
      study_days: ['monday', 'wednesday', 'saturday'],
      reminder_before_minutes: 30,
    };

    const { data: created, error: insertError } = await supabase
      .from('reminder_settings')
      .insert(defaultSettings)
      .select('*')
      .single();

    if (insertError) {
      throw new Error(`Failed to create reminder settings: ${insertError.message}`);
    }

    return created as ReminderSettings;
  }

  /**
   * Updates the user's reminder preferences.
   */
  static async updateReminderSettings(
    updates: Partial<Omit<ReminderSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<ReminderSettings> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('reminder_settings')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update reminder settings: ${error.message}`);
    }

    return data as ReminderSettings;
  }

  /**
   * Fetches recent notification logs for the user.
   */
  static async getNotificationLogs(limit = 10): Promise<NotificationLog[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notification logs:', error);
      return [];
    }

    return (data as NotificationLog[]) || [];
  }

  /**
   * Triggers an immediate test reminder message to the student's connected Telegram.
   */
  static async sendTestReminder(): Promise<{ success: boolean; message: string }> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reminders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'test_notification' }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send test reminder');
    }

    return result;
  }
}
