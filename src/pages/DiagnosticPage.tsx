import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  AssessmentService,
  type DiagnosticEvaluationResult,
} from '../services/assessment.service';
import { RoadmapService } from '../services/roadmap.service';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, PathwayBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MathRenderer } from '../utils/math';
import {
  BrainCircuit,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  BarChart3,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';

interface QuestionWithSkill {
  id: string;
  skill_id: string;
  lesson_id: string | null;
  subject: string;
  pathway: string;
  difficulty: string;
  question_type: string;
  passage: string | null;
  prompt: string;
  options: any;
  skills: { name: string; domain: string } | null;
}

export const DiagnosticPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  // Lifecycle states: 'intro' | 'active' | 'evaluating' | 'results'
  const [stage, setStage] = useState<'intro' | 'active' | 'evaluating' | 'results'>('intro');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionWithSkill[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(1800); // 30 min in seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [evaluation, setEvaluation] = useState<DiagnosticEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer countdown when active
  useEffect(() => {
    if (stage !== 'active') return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await AssessmentService.startDiagnosticSession({
        title: 'Initial SAT Diagnostic Assessment',
        assessment_type: 'diagnostic',
        target_question_count: 10,
      });

      setAssessmentId(session.assessment.id);
      setQuestions(session.questions as unknown as QuestionWithSkill[]);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTimeRemaining(1800);
      setStage('active');
    } catch (err: any) {
      setError(err?.message || 'Failed to start diagnostic assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (optionKey: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionKey,
    }));
  };

  const handleAutoSubmit = () => {
    setIsSubmitModalOpen(false);
    performSubmit();
  };

  const performSubmit = async () => {
    if (!assessmentId) return;
    try {
      setIsSubmitModalOpen(false);
      setStage('evaluating');
      setError(null);

      // Build answer payload
      const answerPayload = questions.map((q) => ({
        question_id: q.id,
        user_answer: selectedAnswers[q.id] || '',
        time_spent_seconds: 45, // default estimated
      }));

      const evalResult = await AssessmentService.submitAssessment({
        assessment_id: assessmentId,
        answers: answerPayload,
      });

      setEvaluation(evalResult);
      // Automatically update the student's pathway in profile and preferences to match the diagnostic placement
      await supabase
        .from('profiles')
        .update({ starting_level: evalResult.recommendedPathway })
        .eq('id', (await supabase.auth.getUser()).data.user?.id || '');
      await supabase
        .from('student_preferences')
        .update({ preferred_pathway: evalResult.recommendedPathway })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '');
      await refreshProfile();
      setStage('results');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit assessment.');
      setStage('active');
    }
  };

  const handleGenerateRoadmapFromResults = async () => {
    try {
      setIsGeneratingRoadmap(true);
      setError(null);
      await RoadmapService.generateRoadmap();
      navigate('/roadmap');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate personalized roadmap.');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // 1. Intro Screen
  if (stage === 'intro') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            Adaptive Diagnostic
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Official SAT Readiness Diagnostic
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Discover your exact starting level, uncover critical domain strengths and weaknesses,
            and establish your personalized learning pathway.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">25-30 Minutes</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Timed simulation mirroring real Digital SAT pace with realistic modular sections.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-mint-50 text-mint-700 rounded-xl flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">Cross-Domain Coverage</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Balanced questions spanning Algebra, Advanced Math, Craft & Structure, and Information & Ideas.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">Path Placement</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Receive your definitive pathway placement: Foundation, Pre-SAT, or SAT Advanced.
            </p>
          </Card>
        </div>

        <Card className="p-8 bg-slate-50 border-slate-200">
          <h3 className="font-bold text-slate-900 text-base mb-3">Guidelines & Best Practices:</h3>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0 mt-0.5" />
              <span>Use scratch paper and an official graphing calculator for Math questions.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0 mt-0.5" />
              <span>Do not look up answers. Accurate diagnostic results guarantee a roadmap tailored to your actual needs.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0 mt-0.5" />
              <span>You can move back and forth between questions before submitting.</span>
            </li>
          </ul>

          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              onClick={handleStart}
              loading={loading}
              className="px-10 py-3.5 text-base shadow-md hover:shadow-lg"
            >
              Start Diagnostic Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Evaluating Screen
  if (stage === 'evaluating') {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center text-center p-8 space-y-5">
        <LoadingSpinner size="lg" />
        <h2 className="text-2xl font-bold text-slate-900">Grading & Analyzing Diagnostic...</h2>
        <p className="text-slate-600 max-w-md text-sm">
          Calculating domain accuracies, mapping skill proficiencies, and determining your optimal
          SAT learning pathway via authoritative rules.
        </p>
      </div>
    );
  }

  // 3. Results Screen
  if (stage === 'results' && evaluation) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Results Header Card */}
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint-300" />
                Assessment Completed
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Diagnostic Results & Placement
              </h1>
              <p className="text-brand-100 text-sm mt-1 max-w-lg">
                Your performance profile and baseline placement have been recorded.
              </p>
            </div>

            <div className="text-left sm:text-right bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15">
              <span className="text-xs uppercase tracking-wider text-brand-200 font-semibold block mb-1">
                Recommended Pathway
              </span>
              <PathwayBadge pathway={evaluation.recommendedPathway} className="text-sm px-3.5 py-1" />
            </div>
          </div>

          {/* Scores Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/15 relative z-10">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <span className="text-xs text-brand-200 uppercase font-semibold">Total Scaled Score</span>
              <div className="text-3xl font-extrabold text-white mt-1">{evaluation.totalScore}</div>
              <span className="text-xs text-brand-200 mt-1 block">out of 1600</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <span className="text-xs text-brand-200 uppercase font-semibold">Math Section</span>
              <div className="text-3xl font-extrabold text-white mt-1">{evaluation.mathScore}</div>
              <span className="text-xs text-brand-200 mt-1 block">out of 800</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <span className="text-xs text-brand-200 uppercase font-semibold">Reading & Writing</span>
              <div className="text-3xl font-extrabold text-white mt-1">{evaluation.rwScore}</div>
              <span className="text-xs text-brand-200 mt-1 block">out of 800</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Confidence Limitation Card */}
        <Card className="p-6 border-brand-100 bg-brand-50/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-900 text-sm">
                  Placement Confidence: <span className="capitalize">{evaluation.confidenceLevel}</span>
                </h3>
                <Badge
                  variant={
                    evaluation.confidenceLevel === 'high'
                      ? 'mint'
                      : evaluation.confidenceLevel === 'moderate'
                      ? 'brand'
                      : 'coral'
                  }
                >
                  {evaluation.confidenceLevel}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {evaluation.confidenceExplanation}
              </p>
            </div>
          </div>
        </Card>

        {/* Detailed Skill Breakdown */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Skill Proficiency Breakdown</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Performance by domain based on questions answered in this session.
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100">
            {evaluation.skillBreakdown.map((item) => (
              <div key={item.skillId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{item.skillName}</span>
                    <Badge variant="outline" className="text-[11px] capitalize">
                      {item.subject.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">{item.domain}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {item.correctQuestions}/{item.totalQuestions}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      ({item.accuracyPercentage}%)
                    </span>
                  </div>

                  <Badge
                    variant={
                      item.status === 'strength'
                        ? 'mint'
                        : item.status === 'developing'
                        ? 'brand'
                        : 'coral'
                    }
                    className="capitalize min-w-[90px] justify-center"
                  >
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths & Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-mint-200 bg-mint-50/20">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-mint-600" />
              Verified Strengths
            </h3>
            {evaluation.strengths.length > 0 ? (
              <ul className="space-y-2">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint-500" />
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                Keep practicing core fundamentals to unlock verified domain mastery.
              </p>
            )}
          </Card>

          <Card className="p-6 border-coral-200 bg-coral-50/20">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-coral-600" />
              Immediate Focus Areas
            </h3>
            {evaluation.weakAreas.length > 0 ? (
              <ul className="space-y-2">
                {evaluation.weakAreas.map((w, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500" />
                    {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                No critical gaps identified in this diagnostic sample!
              </p>
            )}
          </Card>
        </div>

        {/* Next Step Call to Action */}
        <Card className="p-8 text-center bg-white border-2 border-brand-200 shadow-md space-y-4">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Ready to begin your tailored preparation?</h2>
          <p className="text-slate-600 max-w-lg mx-auto text-sm">
            Generate your personalized curriculum roadmap powered by your diagnostic analytics,
            study time budget, and target test date.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleGenerateRoadmapFromResults}
              loading={isGeneratingRoadmap}
              className="px-8 shadow-sm"
            >
              Generate My Roadmap
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Active Assessment Testing Screen
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  const answeredQuestionsCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Normalize options whether stored as Array [{ id: "A", text: "..." }] or Object { A: "..." }
  const normalizedOptions: Array<{ id: string; text: string }> = Array.isArray(currentQuestion.options)
    ? currentQuestion.options.map((opt: any) =>
        typeof opt === 'string'
          ? { id: opt, text: opt }
          : { id: opt.id || opt.key || '', text: opt.text || opt.value || JSON.stringify(opt) }
      )
    : currentQuestion.options && typeof currentQuestion.options === 'object'
    ? Object.entries(currentQuestion.options).map(([key, val]) => ({
        id: key,
        text: typeof val === 'string' ? val : (val as any)?.text || JSON.stringify(val),
      }))
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Test Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Badge variant="outline" className="capitalize text-xs">
              {currentQuestion.subject.replace('_', ' ')}
            </Badge>
            <Badge variant="brand" className="capitalize text-xs">
              {currentQuestion.difficulty}
            </Badge>
          </div>
          {currentQuestion.skills && (
            <p className="text-xs text-slate-500 mt-0.5">
              Domain: {currentQuestion.skills.domain} • Skill: {currentQuestion.skills.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700 font-mono text-sm font-semibold">
            <Clock className="w-4 h-4 text-slate-500" />
            {formatTimer(timeRemaining)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSubmitModalOpen(true)}
            className="text-xs border-brand-300 text-brand-700 hover:bg-brand-50"
          >
            Finish & Submit
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-brand-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        {/* Optional Passage */}
        {currentQuestion.passage && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed max-h-64 overflow-y-auto font-serif">
            <p className="whitespace-pre-line">{currentQuestion.passage}</p>
          </div>
        )}

        {/* Question Prompt with KaTeX math rendering */}
        <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
          <MathRenderer content={currentQuestion.prompt} />
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {normalizedOptions.map((opt) => {
            const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectAnswer(opt.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}
                >
                  {opt.id}
                </div>
                <div className="text-sm sm:text-base text-slate-800 flex-1 pt-0.5">
                  <MathRenderer content={opt.text} />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          size="md"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <span className="text-xs text-slate-500 font-medium">
          {answeredQuestionsCount} of {questions.length} answered
        </span>

        {currentIndex === questions.length - 1 ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsSubmitModalOpen(true)}
          >
            Review & Submit
            <FileCheck2 className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Diagnostic Assessment?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            You have answered <span className="font-bold text-slate-900">{answeredQuestionsCount}</span> out of{' '}
            <span className="font-bold text-slate-900">{questions.length}</span> questions.
          </p>

          {answeredQuestionsCount < questions.length && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                You have {questions.length - answeredQuestionsCount} unanswered question(s). Unanswered
                questions will be graded as incorrect.
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Once submitted, your answers will be authoritatively graded on the server and your baseline
            learning pathway will be generated.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Continue Test
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={performSubmit}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default DiagnosticPage;
