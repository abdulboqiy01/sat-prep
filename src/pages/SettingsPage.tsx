import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/auth.service';
import { OnboardingService } from '../services/onboarding.service';
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

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPrefsSaving(true);
      setPrefsError(null);
      setPrefsSuccess(false);

      await OnboardingService.completeOnboarding({
        subjectFocus: 'both',
        pathway: pathway as any,
        dailyStudyMinutes: dailyMinutes,
        preferredStudyDays: studyDays as any,
        targetExamDate: targetExamDate || undefined,
        targetScore: Number(targetScore),
        targetMathScore: Number(targetMathScore),
        targetRwScore: Number(targetRwScore),
        areasOfDifficulty: [],
      });

      await refreshProfile();
      setPrefsSuccess(true);
      setTimeout(() => setPrefsSuccess(false), 3000);
    } catch (err: any) {
      setPrefsError(err?.message || 'Failed to update study preferences.');
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters.');
      return;
    }

    try {
      setPwdSaving(true);
      setPwdError(null);
      setPwdSuccess(false);

      await AuthService.updatePassword({
        password: newPassword,
      });

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

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account & Learning Settings
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage your personal profile, study schedule preferences, and security credentials.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-coral-600 border-coral-200 hover:bg-coral-50 hover:text-coral-700"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
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

          {/* Non-destructive roadmap notice */}
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
