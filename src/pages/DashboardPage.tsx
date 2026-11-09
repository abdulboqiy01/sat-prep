import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  Target,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  PlayCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { AnalyticsService, type AnalyticsSummary } from '../services/analytics.service';
import { RoadmapService, type ActiveRoadmapWithItems } from '../services/roadmap.service';
import { QuizService } from '../services/quiz.service';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, PathwayBadge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, preferences } = useAuth();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [activeRoadmapData, setActiveRoadmapData] = useState<ActiveRoadmapWithItems | null>(null);
  const [nextActivity, setNextActivity] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [summary, roadmapData, nextAct] = await Promise.all([
          AnalyticsService.getSummary().catch(() => null),
          RoadmapService.getActiveRoadmap().catch(() => null),
          QuizService.getNextRecommendedActivity().catch(() => null),
        ]);
        setAnalytics(summary);
        setActiveRoadmapData(roadmapData);
        setNextActivity(nextAct);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const pathway = activeRoadmapData?.roadmap?.pathway || preferences?.preferred_pathway || profile?.starting_level || 'foundation';
  const displayName = profile?.full_name || 'Student';
  const weeklyGoalMinutes = Math.round((preferences?.weekly_study_hours_budget || 5) * 60);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Loading your learning dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Greeting & Top Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>Enrolled in</span>
            <PathwayBadge pathway={pathway} />
            {profile?.target_score && (
              <span className="text-slate-400">• Goal: {profile.target_score}</span>
            )}
          </p>
        </div>

        {/* Streak & Weekly Progress Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 shadow-xs">
            <Flame className="w-5 h-5 text-amber-500 shrink-0 fill-amber-500" />
            <div>
              <div className="text-xs font-bold leading-none">{analytics?.currentStreakDays || 0} Day Streak</div>
              <div className="text-[11px] text-amber-700/80 mt-0.5">Keep learning today</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Weekly Study</span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {analytics?.weeklyStudyMinutes || 0} <span className="text-xs font-normal text-slate-500">/ {weeklyGoalMinutes}m</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round(((analytics?.weeklyStudyMinutes || 0) / Math.max(weeklyGoalMinutes, 1)) * 100))}%`,
              }}
            />
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Roadmap Progress</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {activeRoadmapData?.progressPercentage || 0}%
          </div>
          <p className="text-xs text-slate-500">
            {activeRoadmapData?.roadmap.completed_items || 0} of {activeRoadmapData?.roadmap.total_items || 0} items complete
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Lessons Completed</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {analytics?.completedLessonsCount || 0}
          </div>
          <p className="text-xs text-slate-500">Across active roadmap</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Quiz Accuracy</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {analytics?.averageQuizAccuracy || 0}%
          </div>
          <p className="text-xs text-slate-500">
            {analytics?.totalQuizzesAttempted || 0} quizzes submitted
          </p>
        </Card>
      </div>

      {/* 3. Hero "Continue Learning" & Quick Action Banner */}
      {nextActivity ? (
        <Card className="p-6 sm:p-7 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-3xl border-0 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                <PlayCircle className="w-3.5 h-3.5" /> Next Scheduled Activity
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                {nextActivity.title}
              </h3>
              <p className="text-sm text-brand-100 max-w-xl">
                {nextActivity.description || 'Continue your sequential study plan to stay on pace.'}
              </p>
            </div>

            <Button
              variant="mint"
              size="lg"
              onClick={() => {
                if (nextActivity.lesson_id && nextActivity.lessons?.slug) {
                  navigate(`/learn/${nextActivity.lessons.slug}`);
                } else if (nextActivity.quiz_id) {
                  navigate(`/quiz/${nextActivity.quiz_id}`);
                } else {
                  navigate('/roadmap');
                }
              }}
              className="shrink-0 shadow-md text-sm font-bold gap-2 text-white bg-mint-500 hover:bg-mint-600"
            >
              Resume Activity <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-brand-50/60 border border-brand-200/70 rounded-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Ready to generate your personalized roadmap?
              </h3>
              <p className="text-sm text-slate-600">
                Generate an AI-tailored study plan based on your diagnostic results and available hours.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/roadmap')}
              className="gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" /> Open Roadmap Planner
            </Button>
          </div>
        </Card>
      )}

      {/* 4. Split Section: Skill Strengths vs Gaps & Study Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Skill Status & Revision Recommender */}
        <Card className="p-6 space-y-4">
          <CardHeader className="mb-2">
            <CardTitle>Skill Mastery & Revision Needs</CardTitle>
            <CardDescription>
              Real performance breakdown by official SAT reporting category.
            </CardDescription>
          </CardHeader>

          {analytics?.skillsNeedingRevision && analytics.skillsNeedingRevision.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> High Priority Focus Areas
              </div>
              <div className="space-y-2">
                {analytics.skillsNeedingRevision.slice(0, 4).map((skill) => (
                  <div
                    key={skill.skillId}
                    className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{skill.skillName}</span>
                      <span className="text-slate-500 block text-[11px]">{skill.domain}</span>
                    </div>
                    <Badge variant="coral">Mastery {skill.masteryScore}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No critical skill gaps detected. Complete lessons and mini-quizzes to populate your mastery matrix.
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/tutor"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Ask AI Tutor to generate practice for weak areas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Right: Study Activity Chart */}
        <Card className="p-6 space-y-4">
          <CardHeader className="mb-2">
            <CardTitle>Recent Study Volume</CardTitle>
            <CardDescription>
              Time logged on lessons, quizzes, and practice diagnostics.
            </CardDescription>
          </CardHeader>

          <div className="h-56 w-full pt-2">
            {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.recentActivities.slice(0, 7).map((a) => ({
                    date: a.activity_date.slice(5),
                    minutes: Math.round(a.duration_seconds / 60),
                    type: a.activity_type,
                  }))}
                >
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="minutes" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p>No study sessions recorded this week yet.</p>
                <Link to="/learn" className="text-brand-600 font-semibold mt-1">
                  Start your first lesson
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 5. AI Tutor Shortcut Callout */}
      <Card className="p-6 bg-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5" /> 24/7 Socratic Assistant
          </div>
          <h4 className="text-lg font-bold">Stuck on an SAT Math or Reading Question?</h4>
          <p className="text-xs text-slate-400 max-w-lg">
            Ask the AI Tutor for conceptual breakdowns, step-by-step hints, or extra practice problems without giving away the answer.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/tutor')}
          className="bg-brand-500 hover:bg-brand-600 text-white shadow-none shrink-0"
        >
          Open AI Tutor Workspace
        </Button>
      </Card>
    </div>
  );
};
