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
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CurriculumService, type Lesson } from '../services/curriculum.service';
import { QuizService, type Quiz } from '../services/quiz.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DifficultyBadge, PathwayBadge } from '../components/ui/Badge';
import { MathRenderer } from '../utils/math';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getEnrichedLessonContent } from '../data/lessonCurriculum';

export const LessonPlayerPage: React.FC = () => {
  const params = useParams<{ slug?: string; lessonId?: string }>();
  const lessonKey = params.slug || params.lessonId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [associatedQuiz, setAssociatedQuiz] = useState<Quiz | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});

  const toggleSolution = (taskId: number) => {
    setRevealedSolutions((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  useEffect(() => {
    async function loadLesson() {
      if (!lessonKey) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setLoadError(null);
        const l = await CurriculumService.getLessonBySlugOrId(lessonKey);
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
      } catch (err: any) {
        console.error('Error loading lesson:', err);
        setLoadError(err?.message || 'Failed to load lesson content.');
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [lessonKey]);

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
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-900">Lesson not found</h2>
        {loadError && (
          <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
            {loadError}
          </p>
        )}
        <Button onClick={() => navigate('/learn')}>Back to Lessons</Button>
      </div>
    );
  }

  // Parse structured JSONB content blocks with 6-slide curriculum enrichment
  const enriched = getEnrichedLessonContent(
    lesson.slug || '',
    lesson.content,
    lesson.title,
    lesson.subject
  );
  const sections = enriched.sections;
  const keyTakeaways = enriched.key_takeaways;

  const totalSteps = sections.length;

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

  const currentSection = sections[currentStep] || sections[0];
  const isFinalStep = currentStep === totalSteps - 1;
  const isHomeworkStep = !!currentSection?.isHomework;

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
          <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Ask AI Tutor
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
              {lesson.subject === 'math' ? 'SAT Math' : 'SAT Reading & Writing'}
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
            <span className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                Slide {currentStep + 1} of {totalSteps}
              </span>
              {currentSection.badge && (
                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                  {currentSection.badge}
                </span>
              )}
            </span>
            <span>
              {completed ? 'Completed' : `${Math.round(((currentStep + 1) / Math.max(totalSteps, 1)) * 100)}%`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${completed ? 100 : Math.round(((currentStep + 1) / Math.max(totalSteps, 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* 3. Active Step Content Area */}
      <Card className="p-8 sm:p-10 space-y-6 min-h-[420px] flex flex-col justify-between border-slate-200/90 shadow-sm bg-white">
        {/* SLIDE CONTENT */}
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Slide {currentStep + 1} of {totalSteps}
              </span>
              {currentSection.badge && (
                <span className="text-xs font-semibold text-slate-400">
                  • {currentSection.badge}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentSection.title}
            </h2>
            {currentSection.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {currentSection.subtitle}
              </p>
            )}
          </div>

          {/* Regular slide or Homework slide */}
          {isHomeworkStep ? (
            /* SLIDE 5: HOMEWORK PRACTICE */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-amber-900 leading-relaxed flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Homework Practice: </strong>
                  <span>{currentSection.content}</span>
                </div>
              </div>

              {/* Homework Tasks List */}
              <div className="space-y-4">
                {currentSection.homeworkTasks?.map((task) => {
                  const isRevealed = !!revealedSolutions[task.id];
                  return (
                    <div
                      key={task.id}
                      className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-3.5 transition"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                            {task.id}
                          </span>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Practice Problem {task.id}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSolution(task.id)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1.5 transition bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs"
                        >
                          {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{isRevealed ? 'Hide Solution' : 'Show Solution'}</span>
                        </button>
                      </div>

                      <div className="text-sm font-medium text-slate-900 leading-relaxed">
                        <MathRenderer text={task.question} />
                      </div>

                      {task.hint && !isRevealed && (
                        <div className="p-3 bg-white/90 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800">Hint: </strong>
                            <span>{task.hint}</span>
                          </div>
                        </div>
                      )}

                      {isRevealed && (
                        <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-950 space-y-2 animate-in fade-in duration-200">
                          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Step-by-Step Solution:</span>
                          </div>
                          <div className="leading-relaxed text-slate-800">
                            <MathRenderer text={task.solution} />
                          </div>
                          {task.correctAnswer && (
                            <div className="pt-2 border-t border-emerald-200/60 text-xs font-bold text-emerald-900 flex items-center gap-2">
                              <span>Correct Answer:</span>
                              <span className="bg-emerald-200/90 text-emerald-900 px-2.5 py-0.5 rounded-md font-mono text-xs">
                                {task.correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isFinalStep ? (
            /* SLIDE 6: SUMMARY & MINI-QUIZ CHECKPOINT */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 shadow-xs">
                <div className="text-slate-800 text-base leading-relaxed tracking-normal font-normal">
                  <MathRenderer text={currentSection.content} />
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Rules & Formulas:</span>
                </div>
                <div className="space-y-2.5">
                  {keyTakeaways.map((takeaway: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-emerald-50/50 border border-emerald-200/70 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-emerald-950 leading-relaxed shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini-Quiz Launch Card */}
              {associatedQuiz ? (
                <div className="p-6 bg-gradient-to-r from-brand-50 to-indigo-50 border-2 border-brand-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mt-6 shadow-sm">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      <Award className="w-3.5 h-3.5" /> Mastery Quiz Ready
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-lg">
                      {associatedQuiz.title}
                    </h4>
                    <p className="text-xs text-slate-600">
                      Score at least{' '}
                      <strong>{associatedQuiz.passing_score_percent}%</strong> to demonstrate skill mastery on your Roadmap.
                    </p>
                  </div>
                  <Button
                    variant="mint"
                    size="lg"
                    onClick={() => navigate(`/quiz/${associatedQuiz.id}`)}
                    className="shrink-0 gap-2 font-extrabold text-sm shadow-md hover:scale-105 transition"
                  >
                    <Award className="w-5 h-5" /> Start Mini-Quiz
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
                  All slides completed! You can complete this lesson or review the practice exercises.
                </div>
              )}
            </div>
          ) : (
            /* SLIDES 1 - 4: THEORY, EXAMPLES & TRAPS */
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-50/70 border border-slate-200/60 shadow-xs">
              <div className="text-slate-800 text-base leading-relaxed tracking-normal font-normal">
                <MathRenderer text={currentSection.content} />
              </div>
            </div>
          )}
        </div>

        {/* Lesson Step Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
          <Button
            variant="outline"
            size="md"
            onClick={() => handleStepChange(currentStep - 1)}
            disabled={currentStep === 0}
            className="gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleStepChange(currentStep + 1)}
              isLoading={isSaving}
              className="gap-2 font-bold text-xs"
            >
              {currentStep === totalSteps - 2 ? (
                <>Summary & Quiz <ArrowRight className="w-4 h-4" /></>
              ) : currentStep === totalSteps - 3 ? (
                <>To Homework Practice <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Next Slide <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              {associatedQuiz && (
                <Button
                  variant="mint"
                  size="md"
                  onClick={() => navigate(`/quiz/${associatedQuiz.id}`)}
                  className="gap-2 font-bold text-xs"
                >
                  <Award className="w-4 h-4" /> Start Mini-Quiz
                </Button>
              )}
              <Button
                variant="outline"
                size="md"
                onClick={() => handleStepChange(currentStep)}
                isLoading={isSaving}
                className="gap-2 font-semibold text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mark as Completed
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
