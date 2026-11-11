import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';
import { TelegramService } from '../services/telegram.service';
import type {
  TelegramConnection,
  NotificationLog,
} from '../types/telegram.types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  User,
  Lock,
  Target,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  Shield,
  Send,
  Bell,
  Clock,
  Globe,
  Calendar,
  RefreshCw,
  Unlink,
  Check,
} from 'lucide-react';

const WEEKDAYS = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'America/New_York (US Eastern, UTC-5)' },
  { value: 'America/Chicago', label: 'America/Chicago (US Central, UTC-6)' },
  { value: 'America/Denver', label: 'America/Denver (US Mountain, UTC-7)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (US Pacific, UTC-8)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET, UTC+1)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK, UTC+3)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Tashkent', label: 'Asia/Tashkent (Uzbekistan, UTC+5)' },
  { value: 'Asia/Almaty', label: 'Asia/Almaty (Kazakhstan, UTC+5)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9)' },
];

export const SettingsPage: React.FC = () => {
  const { user, profile, preferences, refreshProfile, logout } = useAuth();

  // Profile Form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Preferences Form state
  const [targetScore, setTargetScore] = useState<number>(profile?.target_score || 1400);
  const [targetMathScore, setTargetMathScore] = useState<number>(profile?.target_math_score || 700);
  const [targetRwScore, setTargetRwScore] = useState<number>(profile?.target_rw_score || 700);
  const [targetExamDate, setTargetExamDate] = useState<string>(profile?.target_exam_date || '');
  const [dailyMinutes, setDailyMinutes] = useState<number>(45);
  const [studyDays, setStudyDays] = useState<string[]>(
    preferences?.preferred_study_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'saturday']
  );
  const [pathway, setPathway] = useState<string>(
    preferences?.preferred_pathway || profile?.starting_level || 'pre_sat'
  );
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  // Telegram Reminder State
  const [tgConnection, setTgConnection] = useState<TelegramConnection | null>(null);
  const [linkingInProgress, setLinkingInProgress] = useState(false);
  const [linkCountdown, setLinkCountdown] = useState<number | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [reminderTz, setReminderTz] = useState('UTC');
  const [reminderDays, setReminderDays] = useState<string[]>([
    'monday',
    'wednesday',
    'saturday',
  ]);
  const [reminderLeadMinutes, setReminderLeadMinutes] = useState(30);
  const [tgSaving, setTgSaving] = useState(false);
  const [tgSuccess, setTgSuccess] = useState<string | null>(null);
  const [tgError, setTgError] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [recentLogs, setRecentLogs] = useState<NotificationLog[]>([]);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Password Update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setTargetScore(profile.target_score || 1400);
      setTargetMathScore(profile.target_math_score || 700);
      setTargetRwScore(profile.target_rw_score || 700);
      setTargetExamDate(profile.target_exam_date || '');
      setPathway(preferences?.preferred_pathway || profile.starting_level || 'pre_sat');
    }
    if (preferences?.preferred_study_days) {
      setStudyDays(preferences.preferred_study_days);
    }
  }, [profile, preferences]);

  // Load Telegram Data
  useEffect(() => {
    async function loadTelegramState() {
      try {
        const [conn, settings, logs] = await Promise.all([
          TelegramService.getConnection().catch(() => null),
          TelegramService.getReminderSettings().catch(() => null),
          TelegramService.getNotificationLogs(5).catch(() => []),
        ]);

        if (conn) setTgConnection(conn);
        if (settings) {
          setRemindersEnabled(settings.enabled);
          setReminderTime(settings.reminder_time ? settings.reminder_time.slice(0, 5) : '18:00');
          setReminderTz(settings.timezone || 'UTC');
          setReminderDays(settings.study_days || ['monday', 'wednesday', 'saturday']);
          setReminderLeadMinutes(settings.reminder_before_minutes || 30);
        } else {
          // Detect user's timezone if no settings exist
          const localTz = Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'UTC';
          setReminderTz(localTz);
        }
        if (logs) setRecentLogs(logs);
      } catch (err: any) {
        console.error('Error loading Telegram settings:', err);
      }
    }

    loadTelegramState();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileError(null);
      setProfileSuccess(false);

      await AuthService.updateProfile({
        full_name: fullName,
      });

      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleToggleDay = (dayId: string) => {
    if (studyDays.includes(dayId)) {
      if (studyDays.length > 1) {
        setStudyDays(studyDays.filter((d) => d !== dayId));
      }
    } else {
      setStudyDays([...studyDays, dayId]);
    }
  };

  const handleToggleReminderDay = (dayId: string) => {
    if (reminderDays.includes(dayId)) {
      if (reminderDays.length > 1) {
        setReminderDays(reminderDays.filter((d) => d !== dayId));
      }
    } else {
      setReminderDays([...reminderDays, dayId]);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPrefsSaving(true);
      setPrefsError(null);
      setPrefsSuccess(false);

      await AuthService.updateProfile({
        target_score: targetScore,
        target_math_score: targetMathScore,
        target_rw_score: targetRwScore,
        target_exam_date: targetExamDate || null,
      });

      await OnboardingService.savePreferences({
        weekly_study_hours_budget: Math.round((dailyMinutes * studyDays.length) / 60) || 5,
        preferred_study_days: studyDays,
        preferred_pathway: pathway as any,
      });

      await refreshProfile();
      setPrefsSuccess(true);
      setTimeout(() => setPrefsSuccess(false), 3000);
    } catch (err: any) {
      setPrefsError(err?.message || 'Failed to update preferences.');
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPwdSaving(true);
      setPwdError(null);
      setPwdSuccess(false);

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await AuthService.updatePassword({ password: newPassword });
      setPwdSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: any) {
      setPwdError(err?.message || 'Failed to update password.');
    } finally {
      setPwdSaving(false);
    }
  };

  // --- Telegram Account Linking Handlers ---
  const handleConnectTelegram = async () => {
    try {
      setTgError(null);
      setTgSuccess(null);
      setLinkingInProgress(true);
      setLinkCountdown(600); // 10 minutes in seconds

      // 1. Generate single-use secure link token
      const linkData = await TelegramService.createLinkToken();

      // 2. Open Telegram Bot deep link in new tab
      window.open(linkData.deepLink, '_blank', 'noopener,noreferrer');

      // 3. Start polling for connection update every 2.5s
      let checks = 0;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        checks++;
        setLinkCountdown((prev) => (prev && prev > 1 ? prev - 2.5 : 0));

        const conn = await TelegramService.getConnection().catch(() => null);
        if (conn && conn.is_active) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setTgConnection(conn);
          setLinkingInProgress(false);
          setLinkCountdown(null);
          setTgSuccess('🎉 Telegram account connected successfully! Welcome aboard.');
          setTimeout(() => setTgSuccess(null), 5000);
        }

        // Timeout polling after 4 minutes (96 checks)
        if (checks > 96) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setLinkingInProgress(false);
          setLinkCountdown(null);
        }
      }, 2500);
    } catch (err: any) {
      setLinkingInProgress(false);
      setLinkCountdown(null);
      setTgError(err?.message || 'Failed to generate Telegram linking link.');
    }
  };

  const handleDisconnectTelegram = async () => {
    if (!window.confirm('Are you sure you want to unlink your Telegram account? You will stop receiving study reminders.')) {
      return;
    }

    try {
      setTgSaving(true);
      setTgError(null);
      await TelegramService.disconnect();
      setTgConnection(null);
      setTgSuccess('Telegram account disconnected.');
      setTimeout(() => setTgSuccess(null), 3000);
    } catch (err: any) {
      setTgError(err?.message || 'Failed to disconnect Telegram.');
    } finally {
      setTgSaving(false);
    }
  };

  const handleSaveTelegramSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTgSaving(true);
      setTgError(null);
      setTgSuccess(null);

      const timeWithSeconds = reminderTime.length === 5 ? `${reminderTime}:00` : reminderTime;

      await TelegramService.updateReminderSettings({
        enabled: remindersEnabled,
        reminder_time: timeWithSeconds,
        timezone: reminderTz,
        study_days: reminderDays,
        reminder_before_minutes: reminderLeadMinutes,
      });

      setTgSuccess('Reminder preferences updated successfully!');
      setTimeout(() => setTgSuccess(null), 3500);
    } catch (err: any) {
      setTgError(err?.message || 'Failed to save reminder preferences.');
    } finally {
      setTgSaving(false);
    }
  };

  const handleSendTestReminder = async () => {
    try {
      setTestSending(true);
      setTgError(null);
      setTgSuccess(null);

      const result = await TelegramService.sendTestReminder();
      setTgSuccess(result.message || 'Test reminder sent! Check your Telegram.');
      // Refresh logs
      const logs = await TelegramService.getNotificationLogs(5).catch(() => []);
      setRecentLogs(logs);
      setTimeout(() => setTgSuccess(null), 5000);
    } catch (err: any) {
      setTgError(err?.message || 'Failed to send test reminder.');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your profile, SAT goals, Telegram study reminders, and credentials.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={logout} className="self-start sm:self-auto">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500">Your student display name and email address</p>
            </div>
          </div>
          <Badge variant="brand" className="capitalize">
            {profile?.role || 'Student'}
          </Badge>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-mint-50 border border-mint-200 text-mint-800 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
            <span>Profile information updated successfully.</span>
          </div>
        )}

        {profileError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Name"
              required
            />
            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Email is managed via your Supabase Auth account"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" loading={profileSaving}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Study Preferences Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Study Plan & Goals</h2>
              <p className="text-xs text-slate-500">
                Configure your target score, exam date, and weekly study cadence.
              </p>
            </div>
          </div>
        </div>

        {prefsSuccess && (
          <div className="p-3 bg-mint-50 border border-mint-200 text-mint-800 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
            <span>Study preferences updated. Roadmap pacing adjusted.</span>
          </div>
        )}

        {prefsError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{prefsError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePreferences} className="space-y-6">
          {/* Target Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Overall Target (400-1600)"
              type="number"
              min={400}
              max={1600}
              step={10}
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
            />
            <Input
              label="Math Target (200-800)"
              type="number"
              min={200}
              max={800}
              step={10}
              value={targetMathScore}
              onChange={(e) => setTargetMathScore(Number(e.target.value))}
            />
            <Input
              label="Reading & Writing (200-800)"
              type="number"
              min={200}
              max={800}
              step={10}
              value={targetRwScore}
              onChange={(e) => setTargetRwScore(Number(e.target.value))}
            />
          </div>

          {/* Exam Date & Pathway */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target SAT Exam Date (Optional)"
              type="date"
              value={targetExamDate}
              onChange={(e) => setTargetExamDate(e.target.value)}
              helperText="Used to calculate study milestones & lesson deadlines"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Pathway
              </label>
              <select
                value={pathway}
                onChange={(e) => setPathway(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all"
              >
                <option value="foundation">Foundation (Focus on core concepts)</option>
                <option value="pre_sat">Pre-SAT (Intermediate high-yield mastery)</option>
                <option value="sat_advanced">SAT Advanced (Targeting 1450-1600)</option>
              </select>
            </div>
          </div>

          {/* Weekly Study Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Preferred Study Days
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = studyDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(day.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Study Minutes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Daily Study Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[20, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyMinutes(mins)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    dailyMinutes === mins
                      ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-sm block">{mins} mins</span>
                  <span className="text-[10px] text-slate-400">per session</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
            Saving preferences updates your study schedule. Your completed lessons and quiz scores
            are safely preserved. You can refresh your roadmap anytime from the Roadmap page.
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" loading={prefsSaving}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* --- TELEGRAM STUDY REMINDERS CARD --- */}
      <Card className="p-6 sm:p-8 space-y-6 border-brand-200 bg-gradient-to-b from-white via-white to-sky-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm shadow-sky-500/20">
              <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Telegram Study Reminders</h2>
                {tgConnection?.is_active ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Receive personalized daily SAT study schedules and direct lesson links right on Telegram.
              </p>
            </div>
          </div>

          {/* Action button */}
          <div>
            {tgConnection?.is_active ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDisconnectTelegram}
                loading={tgSaving}
                className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
              >
                <Unlink className="w-3.5 h-3.5 mr-1.5" />
                Disconnect
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConnectTelegram}
                loading={linkingInProgress}
                className="bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Connect Telegram
              </Button>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {tgSuccess && (
          <div className="p-3 bg-mint-50 border border-mint-200 text-mint-800 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-mint-600 shrink-0" />
            <span>{tgSuccess}</span>
          </div>
        )}

        {tgError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{tgError}</span>
          </div>
        )}

        {/* Polling / Linking In Progress Callout */}
        {linkingInProgress && (
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-sky-600 animate-spin shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-sky-900">Waiting for Telegram Confirmation...</div>
              <p className="text-sky-700">
                A Telegram window was opened. Press <strong>Start</strong> in Telegram to link your
                account. This screen will automatically update as soon as you connect!
              </p>
              {linkCountdown !== null && (
                <div className="text-[11px] text-sky-600 font-medium pt-1">
                  Single-use link expires in {Math.floor(linkCountdown / 60)}m {Math.floor(linkCountdown % 60)}s
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connected Details Badge */}
        {tgConnection?.is_active && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                ✓
              </div>
              <div>
                <div className="font-semibold text-emerald-950">
                  Linked Account:{' '}
                  <span className="font-mono text-emerald-800">
                    {tgConnection.telegram_username
                      ? `@${tgConnection.telegram_username}`
                      : `Chat ID: ${tgConnection.telegram_chat_id}`}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Connected on {new Date(tgConnection.connected_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendTestReminder}
              loading={testSending}
              className="bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-800 text-xs self-start sm:self-auto"
            >
              <Bell className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Send Test Reminder
            </Button>
          </div>
        )}

        {/* Reminder Settings Form */}
        <form onSubmit={handleSaveTelegramSettings} className="space-y-6">
          {/* Reminders Enabled Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
            <div className="space-y-0.5">
              <label htmlFor="reminder-toggle" className="text-sm font-bold text-slate-900 cursor-pointer">
                Enable Daily Study Reminders
              </label>
              <p className="text-xs text-slate-500">
                Sends a personalized notification on your study days with today's focus lesson.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="reminder-toggle"
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Time & Timezone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Preferred Reminder Time
              </label>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                helperText="When you would like to receive your daily message"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Timezone
              </label>
              <select
                value={reminderTz}
                onChange={(e) => setReminderTz(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Reminders are delivered based on this local time.
              </p>
            </div>
          </div>

          {/* Reminder Study Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Active Reminder Days
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = reminderDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleReminderDay(day.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              We will only message you on these designated study days.
            </p>
          </div>

          {/* Lead time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Advance Notice
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setReminderLeadMinutes(mins)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    reminderLeadMinutes === mins
                      ? 'border-sky-500 bg-sky-50/60 text-sky-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-sm block">{mins} mins</span>
                  <span className="text-[10px] text-slate-400">before session</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="sm"
              loading={tgSaving}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Reminder Settings
            </Button>
          </div>
        </form>

        {/* Recent Delivery History Accordion */}
        {recentLogs.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Recent Notification Delivery History
            </div>
            <div className="space-y-1.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="px-3 py-2 bg-slate-50 rounded-xl flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.status === 'sent'
                          ? 'bg-emerald-500'
                          : log.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-medium text-slate-700 capitalize">
                      {log.notification_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-slate-400">
                    {new Date(log.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Security & Password Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Security & Credentials</h2>
              <p className="text-xs text-slate-500">Update your account password</p>
            </div>
          </div>
        </div>

        {pwdSuccess && (
          <div className="p-3 bg-mint-50 border border-mint-200 text-mint-800 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0" />
            <span>Password updated successfully.</span>
          </div>
        )}

        {pwdError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              helperText="At least 8 characters"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" variant="secondary" loading={pwdSaving}>
              <Shield className="w-4 h-4 mr-1.5" />
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsPage;
