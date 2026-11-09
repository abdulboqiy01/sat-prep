import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Calculator,
  PenTool,
  Award,
} from 'lucide-react';
import { CurriculumService, type Lesson } from '../services/curriculum.service';
import { QuizService, type Quiz } from '../services/quiz.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DifficultyBadge, PathwayBadge } from '../components/ui/Badge';
import { MathRenderer } from '../utils/math';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const LessonPlayerPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [associatedQuiz, setAssociatedQuiz] = useState<Quiz | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      if (!slug) return;
      try {
        setLoading(true);
        const l = await CurriculumService.getLessonBySlug(slug);
        setLesson(l);

        const [prog, quizzes] = await Promise.all([
          CurriculumService.getLessonProgress(l.id).catch(() => null),
          QuizService.getQuizzes({ lessonId: l.id }).catch(() => []),
        ]);

        if (quizzes && quizzes.length > 0) {
          setAssociatedQuiz(quizzes[0]);
        }
        if (prog?.status === 'completed') {
          setCompleted(true);
        }
        if (prog?.last_step_index) {
          setCurrentStep(prog.last_step_index);
        }
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Loading lesson content...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Lesson not found</h2>
        <Button onClick={() => navigate('/learn')}>Back to Lessons</Button>
      </div>
    );
  }

  // Parse structured JSONB content blocks
  const content = (lesson.content as any) || {};
  const sections = Array.isArray(content.sections) ? content.sections : [];
  const keyTakeaways = Array.isArray(content.key_takeaways) ? content.key_takeaways : [];

  const totalSteps = sections.length + (keyTakeaways.length > 0 ? 1 : 0);

  const handleStepChange = async (nextStep: number) => {
    setCurrentStep(nextStep);
    if (!lesson) return;

    const isCompleting = nextStep >= totalSteps - 1;
    const progressPercent = Math.min(100, Math.round(((nextStep + 1) / Math.max(totalSteps, 1)) * 100));

    try {
      setIsSaving(true);
      await CurriculumService.saveLessonProgress({
        lesson_id: lesson.id,
        status: isCompleting ? 'completed' : 'in_progress',
        progress_percent: progressPercent,
        last_step_index: nextStep,
        time_spent_delta_seconds: 60, // approximate 1 min study delta
      });
      if (isCompleting) {
        setCompleted(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const currentSection = sections[currentStep];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      {/* 1. Navigation & Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lessons
        </Link>

        {/* Ask AI Tutor CTA */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/tutor?context_type=lesson&context_id=${lesson.id}`)}
          className="gap-2 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Ask AI Tutor about this lesson
        </Button>
      </div>

      {/* 2. Lesson Title Header Card */}
      <Card className="p-8 space-y-4 bg-white border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-brand-50 text-brand-700">
              {lesson.subject === 'math' ? <Calculator className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {lesson.subject === 'math' ? 'Math' : 'Reading & Writing'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={lesson.difficulty} />
            <PathwayBadge pathway={lesson.pathway} />
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lesson.title}
          </h1>
          {lesson.summary && (
            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl">
              {lesson.summary}
            </p>
          )}
        </div>

        {/* Progress bar across lesson steps */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>
              Section {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
            </span>
            <span>
              {completed ? 'Completed' : `${Math.round(((currentStep + 1) / Math.max(totalSteps, 1)) * 100)}%`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${completed ? 100 : Math.round(((currentStep + 1) / Math.max(totalSteps, 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* 3. Active Step Content Area */}
      <Card className="p-8 sm:p-10 space-y-6 min-h-[340px] flex flex-col justify-between">
        {currentStep < sections.length && currentSection ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentSection.title}
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed">
              <MathRenderer text={currentSection.content} />
            </div>
          </div>
        ) : (
          /* Final Step: Key Takeaways & Completion Checkpoint */
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> Key Concepts & Takeaways
            </div>

            <div className="space-y-3">
              {keyTakeaways.map((takeaway: string, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-sm text-emerald-950 leading-relaxed"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>

            {/* Quiz Recommendation CTA */}
            {associatedQuiz && (
              <div className="p-6 bg-brand-50/60 border border-brand-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">
                    Test your understanding with the Mini-Quiz
                  </h4>
                  <p className="text-xs text-slate-600">
                    {associatedQuiz.title} ({associatedQuiz.passing_score_percent}% to pass)
                  </p>
                </div>
                <Button
                  variant="mint"
                  size="md"
                  onClick={() => navigate(`/quiz/${associatedQuiz.id}`)}
                  className="shrink-0 gap-2 font-bold"
                >
                  <Award className="w-4 h-4" /> Start Mini-Quiz
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Lesson Step Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleStepChange(currentStep - 1)}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleStepChange(currentStep + 1)}
              isLoading={isSaving}
              className="gap-1.5"
            >
              Next Section <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="mint"
              size="md"
              onClick={() => handleStepChange(currentStep)}
              isLoading={isSaving}
              className="gap-2 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Lesson Complete
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
