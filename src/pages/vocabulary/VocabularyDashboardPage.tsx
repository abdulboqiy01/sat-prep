import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Layers,
  ArrowRight,
  Bookmark,
  Volume2,
  CheckCircle2,
  TrendingUp,
  Target,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CefrBadge } from '../../components/vocabulary/CefrBadge';
import { VocabularyService } from '../../services/vocabulary.service';
import { speakWord } from '../../utils/audio';
import type { VocabularyDashboardStats } from '../../types/vocabulary.types';
import { cn } from '../../utils/cn';

export const VocabularyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VocabularyDashboardStats | null>(null);
  const [savedWotd, setSavedWotd] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await VocabularyService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load vocabulary dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleSpeak = async (word: string) => {
    try {
      setSpeaking(true);
      await speakWord(word);
    } finally {
      setSpeaking(false);
    }
  };

  const handleToggleSaveWotd = async () => {
    if (!stats?.wordOfTheDay) return;
    const newState = await VocabularyService.toggleSaveWord(stats.wordOfTheDay.id);
    setSavedWotd(newState);
  };

  if (loading || !stats) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">Loading SAT Vocabulary Module...</p>
      </div>
    );
  }

  const wotd = stats.wordOfTheDay;
  const goalPercent = Math.min(100, Math.round((stats.dailyGoalProgress / stats.dailyGoal) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Advanced SAT Verbal Mastery
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Vocabulary
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Master 500 rigorously curated B2, C1, and C2 academic words tested on SAT Reading & Writing through active spaced repetition.
          </p>
        </div>

        {/* Quick Study Navigation */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/vocabulary/flashcards')}
            className="gap-2 font-semibold"
          >
            <Layers className="w-4 h-4 text-purple-600" /> Flashcards
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/vocabulary/practice')}
            className="gap-2 font-semibold"
          >
            <Award className="w-4 h-4 text-emerald-600" /> Practice Quizzes
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/vocabulary/learn')}
            className="gap-2 font-bold shadow-xs"
          >
            <BookOpen className="w-4 h-4" /> Continue Learning
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Words</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalWords}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">B2 (175) • C1 (225) • C2 (100)</p>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mastered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats.learnedWords}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">14+ day memory retention</p>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Words to Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{stats.wordsToReview}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {stats.wordsToReview > 0 ? (
              <Link to="/vocabulary/review" className="text-amber-700 font-bold hover:underline">
                Review due today →
              </Link>
            ) : (
              'All caught up for today!'
            )}
          </p>
        </Card>

        <Card className="p-5 border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Learning Streak</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 flex items-center gap-1.5">
            {stats.currentStreak} <span className="text-sm font-semibold text-slate-500">days</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Daily study streak</p>
        </Card>
      </div>

      {/* 3. Word of the Day & Daily Goal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Word of the Day (7 cols) */}
        <Card className="lg:col-span-7 p-6 sm:p-8 bg-gradient-to-br from-white via-brand-50/20 to-purple-50/30 border-2 border-brand-100/90 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-100/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/70 text-brand-800 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Word of the Day
            </div>
            <CefrBadge level={wotd.cefr_level} size="sm" />
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {wotd.word}
                </h2>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  <span className="font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {wotd.pronunciation}
                  </span>
                  <span>•</span>
                  <span className="italic">{wotd.part_of_speech}</span>
                  <span>•</span>
                  <span>{wotd.category}</span>
                </div>
              </div>

              {/* Word Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak(wotd.word)}
                  disabled={speaking}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-brand-600 transition shadow-2xs"
                  title="Listen to American pronunciation"
                  aria-label="Listen to pronunciation"
                >
                  <Volume2 className={cn('w-4 h-4', speaking && 'animate-pulse text-brand-600')} />
                </button>
                <button
                  onClick={handleToggleSaveWotd}
                  className={cn(
                    'p-2.5 rounded-xl border transition shadow-2xs',
                    savedWotd
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                  )}
                  title={savedWotd ? 'Saved to My Vocabulary' : 'Save to My Vocabulary'}
                  aria-label="Save word"
                >
                  <Bookmark className={cn('w-4 h-4', savedWotd && 'fill-current')} />
                </button>
              </div>
            </div>

            {/* Definition */}
            <div className="p-4 bg-white/90 border border-slate-200/80 rounded-2xl space-y-1 shadow-2xs">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">Formal Definition</span>
              <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                {wotd.definition}
              </p>
              <p className="text-xs text-slate-600 pt-1">
                <span className="font-bold text-slate-700">Plain English:</span> {wotd.simple_explanation}
              </p>
            </div>

            {/* SAT Context */}
            <div className="p-4 bg-brand-50/50 border border-brand-200/60 rounded-2xl space-y-1 text-xs">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-brand-700">
                Authentic SAT Context
              </span>
              <p className="text-slate-800 italic leading-relaxed">
                "{wotd.sat_context_sentence}"
              </p>
            </div>

            {/* Synonyms & Antonyms */}
            <div className="flex flex-wrap gap-4 text-xs pt-1">
              {wotd.synonyms.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700">Synonyms: </span>
                  <span className="text-slate-600">{wotd.synonyms.slice(0, 4).join(', ')}</span>
                </div>
              )}
              {wotd.antonyms.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700">Antonyms: </span>
                  <span className="text-slate-600">{wotd.antonyms.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Link
                to={`/vocabulary/learn?word=${wotd.word}`}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 transition inline-flex items-center gap-1.5"
              >
                Study full word profile & context breakdown <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Daily Goal & Study Modes (5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Daily Goal Progress Card */}
          <Card className="p-6 border-slate-200/80 shadow-2xs rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900">Today's Vocabulary Goal</h3>
              </div>
              <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60">
                {stats.dailyGoalProgress} of {stats.dailyGoal} words
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="bg-gradient-to-r from-brand-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-2xs text-slate-500 font-medium">
                <span>{goalPercent}% completed</span>
                <span>{stats.dailyGoalProgress >= stats.dailyGoal ? 'Goal Achieved! 🎉' : `${stats.dailyGoal - stats.dailyGoalProgress} words remaining`}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Accuracy rate:</span>
              <span className="font-extrabold text-emerald-600">{stats.accuracyPercentage}%</span>
            </div>
          </Card>

          {/* Quick Study Modes Menu */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/vocabulary/flashcards"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/30 transition-all group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-900">Flashcards</h4>
              <p className="text-2xs text-slate-500 mt-1">SM-2 Spaced repetition active recall</p>
            </Link>

            <Link
              to="/vocabulary/practice"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-900">Practice Quiz</h4>
              <p className="text-2xs text-slate-500 mt-1">7 SAT-style question formats</p>
            </Link>

            <Link
              to="/vocabulary/review"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 transition-all group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-900">Review Due</h4>
              <p className="text-2xs text-slate-500 mt-1">Retain words before memory decay</p>
            </Link>

            <Link
              to="/vocabulary/my-vocabulary"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/30 transition-all group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <Bookmark className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-900">My Vocabulary</h4>
              <p className="text-2xs text-slate-500 mt-1">Personal notebook & saved terms</p>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Weekly Learning Activity Bar Chart */}
      <Card className="p-6 sm:p-8 border-slate-200/80 rounded-3xl shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" /> Weekly Learning Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily volume of new words learned and active reviews completed.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> New Words
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Reviews
            </span>
          </div>
        </div>

        {/* Bar chart representation */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-4 border-b border-slate-100">
          {stats.weeklyActivity.map((dayItem, idx) => {
            const total = dayItem.wordsLearned + dayItem.wordsReviewed;
            const maxVal = Math.max(15, ...stats.weeklyActivity.map((d) => d.wordsLearned + d.wordsReviewed));
            const barHeightPercent = Math.max(8, Math.round((total / maxVal) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-2xs font-bold text-slate-400 group-hover:text-brand-600 transition">
                  {total > 0 ? total : ''}
                </div>
                <div
                  className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:scale-105"
                  style={{ height: `${barHeightPercent}%` }}
                >
                  <div
                    className="w-full bg-purple-400 transition-all"
                    style={{ height: `${dayItem.wordsReviewed > 0 ? (dayItem.wordsReviewed / total) * 100 : 0}%` }}
                    title={`${dayItem.wordsReviewed} reviews`}
                  />
                  <div
                    className="w-full bg-brand-500 transition-all"
                    style={{ height: `${dayItem.wordsLearned > 0 ? (dayItem.wordsLearned / total) * 100 : 0}%` }}
                    title={`${dayItem.wordsLearned} new words`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{dayItem.day}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
