import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CefrBadge } from '../../components/vocabulary/CefrBadge';
import { VocabularyService } from '../../services/vocabulary.service';
import type {
  QuizQuestion,
  QuizExerciseType,
  CefrLevel,
} from '../../types/vocabulary.types';
import { cn } from '../../utils/cn';

export const PracticePage: React.FC = () => {

  // Setup state
  const [selectedType, setSelectedType] = useState<QuizExerciseType | 'mixed'>('mixed');
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel | 'all'>('all');
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      question_id: string;
      target_word: string;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
      explanation: string;
      prompt: string;
    }>
  >([]);

  // Result state
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = async () => {
    try {
      setLoading(true);
      setQuizFinished(false);
      setCurrentIndex(0);
      setSelectedOption(null);
      setHasAnswered(false);
      setUserAnswers([]);

      const generated = await VocabularyService.generateQuiz({
        exerciseType: selectedType === 'mixed' ? undefined : selectedType,
        cefr: selectedCefr === 'all' ? undefined : selectedCefr,
        count: 10,
      });

      setQuestions(generated);
      setQuizStarted(true);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (hasAnswered) return;
    setSelectedOption(optionId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || hasAnswered || !currentQ) return;
    setHasAnswered(true);

    const isCorrect = selectedOption === currentQ.correct_option_id;
    const answerRecord = {
      question_id: currentQ.id,
      target_word: currentQ.target_word,
      user_answer: selectedOption,
      correct_answer: currentQ.correct_option_id,
      is_correct: isCorrect,
      explanation: currentQ.explanation,
      prompt: currentQ.prompt,
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      // Quiz complete
      setQuizFinished(true);

      const totalCorrect = userAnswers.filter((a) => a.is_correct).length;
      const scorePercent = Math.round((totalCorrect / questions.length) * 100);

      await VocabularyService.recordQuizAttempt({
        user_id: 'guest',
        quiz_type: selectedType,
        total_questions: questions.length,
        correct_answers: totalCorrect,
        score_percentage: scorePercent,
        answers: userAnswers,
      });
    }
  };

  const currentQ = questions[currentIndex];

  // 1. SETUP / QUIZ CONFIGURATION SCREEN
  if (!quizStarted) {
    const exerciseTypeOptions: Array<{ id: QuizExerciseType | 'mixed'; label: string; desc: string }> = [
      { id: 'mixed', label: 'Mixed Comprehensive', desc: 'Randomized blend of all 7 exercise formats' },
      { id: 'sat_context', label: 'SAT Contextual Words', desc: 'Authentic "As used in sentence, word most nearly means"' },
      { id: 'definition', label: 'Precise Definition', desc: 'Match academic word with formal analytical definition' },
      { id: 'synonym', label: 'Academic Synonyms', desc: 'Identify high-level scholastic synonym substitutions' },
      { id: 'antonym', label: 'Contrasts & Antonyms', desc: 'Pinpoint precise semantic opposites' },
      { id: 'fill_blank', label: 'Fill in the Blank', desc: 'Infer missing vocabulary from sentence context clues' },
      { id: 'sentence_completion', label: 'Sentence Completion', desc: 'Complete complex multi-clause academic sentences' },
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
        <div>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Vocabulary Practice Quizzes
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Test contextual understanding and retention across authentic SAT Reading & Writing exercise models.
          </p>
        </div>

        {/* Level Selection */}
        <Card className="p-6 border-slate-200/80 rounded-2xl space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            1. Select CEFR Target Level
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(['all', 'B2', 'C1', 'C2'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedCefr(lvl)}
                className={cn(
                  'p-3 rounded-xl border text-center transition font-bold text-xs sm:text-sm',
                  selectedCefr === lvl
                    ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                )}
              >
                {lvl === 'all' ? 'All Levels (500)' : `Level ${lvl}`}
              </button>
            ))}
          </div>
        </Card>

        {/* Exercise Format Selection */}
        <Card className="p-6 border-slate-200/80 rounded-2xl space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            2. Choose Question Format
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exerciseTypeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedType(opt.id)}
                className={cn(
                  'p-4 rounded-xl border text-left transition flex flex-col justify-between gap-1',
                  selectedType === opt.id
                    ? 'border-brand-600 bg-brand-50/70 text-brand-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                )}
              >
                <div className="font-bold text-sm text-slate-900">{opt.label}</div>
                <div className="text-2xs text-slate-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        </Card>

        <Button
          variant="primary"
          size="lg"
          onClick={startQuiz}
          isLoading={loading}
          className="w-full py-4 font-extrabold text-base shadow-sm gap-2"
        >
          <Award className="w-5 h-5" /> Start Practice Quiz (10 Questions)
        </Button>
      </div>
    );
  }

  // 2. QUIZ RESULTS / SUMMARY SCREEN
  if (quizFinished) {
    const totalCorrect = userAnswers.filter((a) => a.is_correct).length;
    const scorePercent = Math.round((totalCorrect / questions.length) * 100);
    const passed = scorePercent >= 70;

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
        <div className="flex items-center justify-between">
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <Button variant="outline" size="sm" onClick={startQuiz} className="gap-2 font-bold">
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </Button>
        </div>

        {/* Score Banner */}
        <Card
          className={cn(
            'p-8 text-center space-y-3 rounded-3xl border-2',
            passed ? 'border-emerald-200 bg-emerald-50/40' : 'border-rose-200 bg-rose-50/40'
          )}
        >
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-bold',
              passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            )}
          >
            {passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {passed ? 'Quiz Passed! Excellent Recall' : 'Review Recommended'}
          </h2>

          <div className="text-3xl font-black text-slate-900">
            {scorePercent}%{' '}
            <span className="text-sm font-normal text-slate-500">
              ({totalCorrect} of {questions.length} correct)
            </span>
          </div>

          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Results have been recorded. Review individual question explanations below to reinforce nuance.
          </p>
        </Card>

        {/* Question Breakdown List */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Detailed Explanations</h3>
          {userAnswers.map((ans, idx) => (
            <Card key={idx} className="p-5 border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-500">
                  Question {idx + 1} • <strong className="text-slate-900">{ans.target_word}</strong>
                </span>
                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-0.5 rounded-full',
                    ans.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  )}
                >
                  {ans.is_correct ? 'Correct (+1 pt)' : 'Incorrect (0 pts)'}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-900">{ans.prompt}</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div
                  className={cn(
                    'p-2.5 rounded-xl border font-semibold flex items-center justify-between',
                    ans.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  )}
                >
                  <span>Your Answer:</span>
                  <span>Option {ans.user_answer}</span>
                </div>

                <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-900 font-semibold flex items-center justify-between">
                  <span>Correct Answer:</span>
                  <span className="text-emerald-700 font-extrabold">Option {ans.correct_answer}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
                <strong className="text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-600" /> Pedagogical Explanation:
                </strong>
                <p>{ans.explanation}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 3. ACTIVE QUIZ TAKING VIEW
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <button
          onClick={() => setQuizStarted(false)}
          className="text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          Exit Quiz
        </button>
        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <Card className="p-6 sm:p-8 space-y-6 bg-white border-2 border-slate-200/90 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between">
          <CefrBadge level={currentQ.cefr_level} size="sm" />
          <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">
            {currentQ.exercise_type.replace('_', ' ')}
          </span>
        </div>

        {/* Passage / Sentence if present */}
        {currentQ.passage && (
          <div className="p-4 bg-slate-50 border-l-4 border-brand-500 rounded-r-2xl text-xs sm:text-sm text-slate-800 italic leading-relaxed">
            "{currentQ.passage}"
          </div>
        )}

        {/* Prompt */}
        <div className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {currentQ.prompt}
        </div>

        {/* 4 Multiple-choice options */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            let optionStyles = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-900';

            if (hasAnswered) {
              if (opt.id === currentQ.correct_option_id) {
                optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
              } else if (isSelected) {
                optionStyles = 'border-rose-500 bg-rose-50 text-rose-950';
              } else {
                optionStyles = 'opacity-40 border-slate-200';
              }
            } else if (isSelected) {
              optionStyles = 'border-brand-600 bg-brand-50/70 text-brand-900 font-bold shadow-2xs';
            }

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id)}
                disabled={hasAnswered}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all duration-150 flex items-center gap-3.5',
                  optionStyles
                )}
              >
                <span
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition',
                    isSelected
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-white border-slate-300 text-slate-700'
                  )}
                >
                  {opt.id}
                </span>
                <span className="text-sm font-medium leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback Explanation (Revealed after confirming) */}
        {hasAnswered && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Explanation & Context Clues:
            </div>
            <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          {!hasAnswered ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmAnswer}
              disabled={!selectedOption}
              className="gap-2 font-bold px-8 shadow-xs"
            >
              Confirm Answer
            </Button>
          ) : (
            <Button
              variant="mint"
              size="md"
              onClick={handleNextQuestion}
              className="gap-2 font-bold px-8 shadow-xs"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'} <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
