export interface TelegramConnection {
  id: string;
  user_id: string;
  telegram_chat_id: number;
  telegram_username?: string | null;
  connected_at: string;
  is_active: boolean;
}

export interface TelegramLinkToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at?: string | null;
  created_at: string;
}

export interface ReminderSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  reminder_time: string; // e.g. "18:00:00"
  timezone: string; // e.g. "UTC" or "America/New_York"
  study_days: string[]; // ['monday', 'wednesday', 'saturday']
  reminder_before_minutes: number;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'daily_reminder'
  | 'upcoming_session'
  | 'weekly_plan'
  | 'weekly_summary'
  | 'missed_session';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface NotificationLog {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  scheduled_at: string;
  sent_at?: string | null;
  status: NotificationStatus;
  error_message?: string | null;
  created_at: string;
}

export interface TelegramLinkResponse {
  token: string;
  deepLink: string;
  expiresAt: string;
}

