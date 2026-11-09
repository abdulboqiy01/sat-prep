import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AnalyticsService,
  type AnalyticsSummary,
} from '../services/analytics.service';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
  BookOpen,
  Award,
  AlertTriangle,
  ArrowRight,
  Activity,
  Calendar,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { profile, preferences } = useAuth();

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load progress analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8 text-center text-slate-500">
        Failed to load analytics data.
      </div>
    );
  }

  // Format 7 days activity chart data from recent activities
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[d.getDay()];

    const acts = summary.recentActivities.filter((a) => a.activity_date === dStr);
    const totalMinutes = Math.round(
      acts.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) / 60
    );

    return {
      day: dayLabel,
      date: dStr,
      minutes: totalMinutes,
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learning Progress & Analytics
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Data-driven insights into your study habits, skill proficiencies, and exam readiness.
          </p>
        </div>

        <Link to="/diagnostic">
          <Button variant="outline" size="sm" className="text-xs">
            <Award className="w-4 h-4 mr-1.5 text-brand-600" />
            Retake Diagnostic
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Study Streak
            </span>
            <div className="w-9 h-9 rounded-xl bg-coral-50 text-coral-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-coral-500 text-coral-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {summary.currentStreakDays}
            </span>
            <span className="text-xs text-slate-500 font-medium">days in a row</span>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              7-Day Study Time
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {summary.weeklyStudyMinutes}
            </span>
            <span className="text-xs text-slate-500 font-medium">minutes</span>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quiz Accuracy
            </span>
            <div className="w-9 h-9 rounded-xl bg-mint-50 text-mint-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {summary.averageQuizAccuracy}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              across {summary.totalQuizzesAttempted} quizzes
            </span>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lessons Completed
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {summary.completedLessonsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({summary.activeRoadmapProgressPercent}% roadmap)
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Time Bar Chart */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daily Study Minutes (Past 7 Days)</h2>
              <p className="text-xs text-slate-500">Track your daily study consistency against your plan</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} min`, 'Study Time']}
                />
                <Bar dataKey="minutes" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Roadmap Progress Status */}
        <Card className="p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Personalized Roadmap Status</h2>
              <Badge variant="brand">{summary.activeRoadmapProgressPercent}% Complete</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on your target SAT date and weekly study hours budget.
            </p>

            <div className="pt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Milestone Completion</span>
                <span>{summary.activeRoadmapProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-mint-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${summary.activeRoadmapProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Weekly Target:</span>
              <span className="font-bold text-slate-900">
                {preferences?.weekly_study_hours_budget || 5} hours/week
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Target SAT Score:</span>
              <span className="font-bold text-slate-900">
                {profile?.target_score || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Exam Date:</span>
              <span className="font-bold text-slate-900">
                {profile?.target_exam_date || 'Flexible'}
              </span>
            </div>
          </div>

          <Link to="/roadmap" className="w-full">
            <Button variant="outline" className="w-full text-xs">
              View Sequential Learning Roadmap
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </Card>
      </div>

      {/* Focus & Revision Areas */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recommended Areas for Revision</h2>
            <p className="text-xs text-slate-500">
              Skills where recent quiz scores or mastery indicates extra practice is needed.
            </p>
          </div>
          <AlertTriangle className="w-5 h-5 text-coral-500" />
        </div>

        {summary.skillsNeedingRevision.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-mint-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Great job! No critical skill gaps detected.</p>
            <p className="text-xs text-slate-400 mt-1">
              Continue through your upcoming roadmap lessons to maintain mastery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.skillsNeedingRevision.map((item) => (
              <div
                key={item.skillId}
                className="p-4 rounded-xl border border-coral-200 bg-coral-50/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.skillName}
                    </span>
                    <Badge variant="coral" className="text-[10px]">
                      {item.masteryLevel}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500">{item.domain}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-coral-100">
                  <span className="text-xs text-slate-600">
                    Mastery: <strong className="text-slate-900">{item.masteryScore}%</strong>
                  </span>
                  <Link to="/learn">
                    <Button variant="ghost" size="sm" className="text-xs text-brand-600 h-7 px-2">
                      Practice
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Study Activity Timeline */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Study Activities</h2>
            <p className="text-xs text-slate-500">Log of recorded lessons, quizzes, and practice</p>
          </div>
          <Calendar className="w-4 h-4 text-slate-400" />
        </div>

        {summary.recentActivities.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No activities recorded yet. Complete a lesson or quiz to see your activity log.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {summary.recentActivities.map((act) => {
              const minutes = Math.round((act.duration_seconds || 0) / 60);
              return (
                <div key={act.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 capitalize block">
                        {act.activity_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{act.activity_date}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-medium text-slate-700">{minutes} min</span>
                    {(act.metadata as any)?.score_percentage !== undefined && (
                      <span className="text-xs text-mint-600 block font-semibold">
                        {(act.metadata as any).score_percentage}% score
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
export default ProgressPage;
