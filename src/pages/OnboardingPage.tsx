import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calculator,
  PenTool,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { OnboardingService } from '../services/onboarding.service';
import { RoadmapService } from '../services/roadmap.service';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import type { OnboardingPreferencesInput } from '../schemas/onboarding.schema';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
] as const;

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile, refreshPreferences } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [subjectFocus, setSubjectFocus] = useState<'math' | 'reading_writing' | 'both'>('both');
  const [pathway, setPathway] = useState<'foundation' | 'pre_sat' | 'sat_advanced' | 'unknown'>('pre_sat');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(45);
  const [preferredStudyDays, setPreferredStudyDays] = useState<Array<typeof DAYS_OF_WEEK[number]['id']>>([
    'monday',
    'wednesday',
    'saturday',
  ]);
  const [targetExamDate, setTargetExamDate] = useState('');
  const [targetScore, setTargetScore] = useState<number | undefined>(1400);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleDay = (day: typeof DAYS_OF_WEEK[number]['id']) => {
    if (preferredStudyDays.includes(day)) {
      if (preferredStudyDays.length > 1) {
        setPreferredStudyDays(preferredStudyDays.filter((d) => d !== day));
      }
    } else {
      setPreferredStudyDays([...preferredStudyDays, day]);
    }
  };

  const handleComplete = async (andGenerateRoadmap: boolean) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload: OnboardingPreferencesInput = {
        subjectFocus,
        pathway,
        dailyStudyMinutes,
        preferredStudyDays: preferredStudyDays as any,
        targetExamDate: targetExamDate || null,
        targetScore: targetScore || null,
        targetMathScore: targetScore ? Math.round(targetScore / 2) : null,
        targetRwScore: targetScore ? Math.round(targetScore / 2) : null,
        areasOfDifficulty: [],
      };

      await OnboardingService.completeOnboarding(payload);
      await Promise.all([refreshProfile(), refreshPreferences()]);

      if (pathway === 'unknown') {
        // Direct to diagnostic placement
        navigate('/diagnostic');
        return;
      }

      if (andGenerateRoadmap) {
        // Generate roadmap via Edge Function or deterministic fallback
        await RoadmapService.generateRoadmap({ force_regenerate: true }).catch(() => {});
        navigate('/roadmap');
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save onboarding preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Personalize Your SAT Prep</span>
        </div>

        {/* Step Progress Pill */}
        <div className="text-xs font-semibold px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
          Step {step} of {totalSteps}
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
        <Card className="p-8 shadow-sm border-slate-200/80">
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: SUBJECT FOCUS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Which sections do you want to focus on?
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  You can change this anytime from your dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSubjectFocus('both')}
                  className={cn(
                    'p-5 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between space-y-4',
                    subjectFocus === 'both'
                      ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Both Sections</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Math + Reading and Writing</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSubjectFocus('math')}
                  className={cn(
                    'p-5 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between space-y-4',
                    subjectFocus === 'math'
                      ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Math Only</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Algebra to Trig</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSubjectFocus('reading_writing')}
                  className={cn(
                    'p-5 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between space-y-4',
                    subjectFocus === 'reading_writing'
                      ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Reading & Writing</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Craft, Ideas & Grammar</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PATHWAY & LEVEL */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  What is your current preparation level?
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Choose a pathway, or take the diagnostic test to measure your baseline.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    id: 'foundation',
                    title: 'Foundation Pathway',
                    desc: 'Focus on mastering core algebraic fundamentals and essential sentence boundaries.',
                  },
                  {
                    id: 'pre_sat',
                    title: 'Pre-SAT Pathway (Recommended)',
                    desc: 'Balanced preparation for students aiming for 1100–1300 scores with multi-step problem solving.',
                  },
                  {
                    id: 'sat_advanced',
                    title: 'SAT Advanced Pathway',
                    desc: 'Rigorous optimization for target scores of 1350–1600 covering hardest questions and paired passages.',
                  },
                  {
                    id: 'unknown',
                    title: "I'm not sure — Let's test my level",
                    desc: 'Take an adaptive diagnostic assessment after onboarding to discover your recommended pathway.',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setPathway(item.id as any)}
                    className={cn(
                      'p-4 rounded-xl border-2 flex items-start gap-4 cursor-pointer transition',
                      pathway === item.id
                        ? 'border-brand-600 bg-brand-50/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    <input
                      type="radio"
                      name="pathway"
                      checked={pathway === item.id}
                      onChange={() => setPathway(item.id as any)}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: STUDY TIME & SCHEDULE */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  How much time can you dedicate?
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  We will design your weekly roadmap to fit your actual availability.
                </p>
              </div>

              {/* Daily minutes slider / selector */}
              <div className="space-y-3 pt-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Target Daily Study Time: <span className="text-brand-600 font-bold">{dailyStudyMinutes} minutes/day</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyStudyMinutes(mins)}
                      className={cn(
                        'py-2.5 rounded-xl border text-sm font-semibold transition',
                        dailyStudyMinutes === mins
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Days checkboxes */}
              <div className="space-y-3 pt-4">
                <label className="block text-sm font-semibold text-slate-800">
                  Which days do you prefer to study? ({preferredStudyDays.length} days selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = preferredStudyDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={cn(
                          'w-12 h-12 rounded-xl text-xs font-bold transition flex items-center justify-center border',
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  Estimated study time: ~{Math.round(((preferredStudyDays.length * dailyStudyMinutes) / 60) * 10) / 10} hours per week.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: GOALS & CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  What is your target SAT goal score?
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Select your target score benchmark or enter a custom score goal.
                </p>
              </div>

              {/* Goal Score Quick Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                  Target Score Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { score: 1300, label: '1300', tier: 'Solid Competitive' },
                    { score: 1400, label: '1400', tier: 'Top 10% Selective' },
                    { score: 1500, label: '1500', tier: 'Top 1% Elite' },
                  ].map((item) => (
                    <button
                      key={item.score}
                      type="button"
                      onClick={() => setTargetScore(item.score)}
                      className={cn(
                        'p-4 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center',
                        targetScore === item.score
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      )}
                    >
                      <span className="text-2xl font-extrabold">{item.label}</span>
                      <span className="text-[11px] text-slate-500 font-medium mt-1">{item.tier}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <Input
                  label="Custom Target SAT Score (400 - 1600)"
                  type="number"
                  min={400}
                  max={1600}
                  step={10}
                  value={targetScore || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setTargetScore(isNaN(val) ? undefined : val);
                  }}
                  placeholder="e.g. 1400"
                />

                <Input
                  label="Target Exam Date (Optional)"
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  helperText="Used to space roadmap lessons across weeks."
                />
              </div>

              {/* Ready summary */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 mt-4 text-xs">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Ready to synthesize your roadmap
                </div>
                <div className="text-slate-600 leading-relaxed">
                  Pathway: <span className="font-bold text-slate-900 capitalize">{pathway.replace('_', ' ')}</span> • Goal Score:{' '}
                  <span className="font-bold text-slate-900">{targetScore || 'Custom'}</span> • Commitment:{' '}
                  <span className="font-bold text-slate-900">
                    {preferredStudyDays.length} days/week (~{Math.round(((preferredStudyDays.length * dailyStudyMinutes) / 60) * 10) / 10}h)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Controls Footer */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
            {step > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={() => setStep(step - 1)}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(step + 1)}
                className="gap-1.5"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => handleComplete(true)}
                isLoading={isSubmitting}
                className="gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4" /> Generate My Learning Roadmap
              </Button>
            )}
          </div>
        </Card>
      </div>

      <div className="text-center text-xs text-slate-400 py-4">
        Antigravity SAT • Adaptive Educational Platform
      </div>
    </div>
  );
};
