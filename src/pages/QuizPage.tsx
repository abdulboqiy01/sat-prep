import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  QuizService,
  type Quiz,
  type QuizQuestionMasked,
  type QuizAttemptReview,
} from '../services/quiz.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { MathRenderer } from '../utils/math';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { cn } from '../utils/cn';

export const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionMasked[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Taking Test State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Review State (after submit)
  const [review, setReview] = useState<QuizAttemptReview | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startNewQuiz = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      setReview(null);
      setSelectedAnswers({});
      setCurrentIndex(0);

      const [takingData, attempt] = await Promise.all([
        QuizService.getQuizForTaking(id),
        QuizService.startAttempt(id),
      ]);

      setQuiz(takingData.quiz);
      setQuestions(takingData.questions);
      setAttemptId(attempt.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start quiz session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewQuiz();
  }, [id]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitAttempt = async () => {
    if (!attemptId) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Package answers payload
      const answersPayload = questions.map((q) => ({
        question_id: q.id,
        user_answer: selectedAnswers[q.id] || '',
        time_spent_seconds: 30,
      }));

      await QuizService.submitAttempt({
        attempt_id: attemptId,
        answers: answersPayload,
      });

      // Fetch authoritative review with explanations
      const reviewData = await QuizService.getAttemptReview(attemptId);
      setReview(reviewData);
      setConfirmSubmitOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit quiz attempt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500">Preparing mini-quiz questions...</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-900">Quiz Unavailable</h2>
        <p className="text-sm text-slate-600">No published questions found for this quiz.</p>
        <Button onClick={() => navigate('/learn')}>Back to Curriculum</Button>
      </div>
    );
  }

  // =========================================================================
  // REVIEW VIEW (Rendered after authoritative server submission)
  // =========================================================================
  if (review) {
    const attempt = review.attempt;
    const passed = attempt.passed;

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
        <div className="flex items-center justify-between">
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Roadmap
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={startNewQuiz}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Retry Quiz
          </Button>
        </div>

        {/* Result Summary Banner */}
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

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {passed ? 'Quiz Passed!' : 'Review Recommended'}
          </h2>

          <div className="text-3xl font-extrabold text-slate-900">
            {attempt.score_percentage}%{' '}
            <span className="text-sm font-normal text-slate-500">
              ({attempt.score} of {attempt.max_score} points)
            </span>
          </div>

          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Passing threshold: {quiz.passing_score_percent}%. Review the detailed explanations below to reinforce your understanding.
          </p>
        </Card>

        {/* Question-by-Question Explanations List */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Submitted Answers & Explanations</h3>

          {review.answers.map((ans, idx) => {
            const isCorrect = ans.is_correct;
            return (
              <Card key={ans.question_id} className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>
                  <Badge variant={isCorrect ? 'mint' : 'coral'}>
                    {isCorrect ? 'Correct (+1 pt)' : 'Incorrect (0 pts)'}
                  </Badge>
                </div>

                <div className="text-sm font-medium text-slate-900">
                  <MathRenderer text={ans.prompt} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div
                    className={cn(
                      'p-3 rounded-xl border font-semibold flex items-center justify-between',
                      isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    )}
                  >
                    <span>Your Answer:</span>
                    <span>{ans.user_answer || '(Unanswered)'}</span>
                  </div>

                  <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-900 font-semibold flex items-center justify-between">
                    <span>Correct Answer:</span>
                    <span className="text-emerald-700 font-bold">{ans.correct_answer}</span>
                  </div>
                </div>

                {/* Explanation Block */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Pedagogical Explanation:
                  </div>
                  <MathRenderer text={ans.explanation} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAKING QUIZ VIEW (Interactive Test Experience)
  // =========================================================================
  const currentQuestion = questions[currentIndex];
  const options = Array.isArray(currentQuestion.options) ? (currentQuestion.options as any[]) : [];
  const selectedAnswer = selectedAnswers[currentQuestion.id] || '';
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Formative Mini-Quiz
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {quiz.title}
          </h1>
        </div>

        {/* Progress Counter Pill */}
        <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          {errorMsg}
        </div>
      )}

      {/* 2. Question Card */}
      <Card className="p-6 sm:p-8 space-y-6 bg-white border-slate-200/80 shadow-xs">
        {/* Passage (if present) */}
        {currentQuestion.passage && (
          <div className="p-4 bg-slate-50 border-l-4 border-brand-500 rounded-r-xl text-xs sm:text-sm text-slate-700 italic leading-relaxed">
            <MathRenderer text={currentQuestion.passage} />
          </div>
        )}

        {/* Prompt */}
        <div className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
          <MathRenderer text={currentQuestion.prompt} />
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {options.length > 0 ? (
            options.map((opt: { id: string; text: string }) => {
              const isSelected = selectedAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border text-left transition-all duration-150 flex items-center gap-3.5',
                    isSelected
                      ? 'border-brand-600 bg-brand-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <span
                    className={cn(
                      'w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition',
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    )}
                  >
                    {opt.id}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    <MathRenderer text={opt.text} />
                  </span>
                </button>
              );
            })
          ) : (
            /* Student-Produced Response (Grid-in numeric input) */
            <div className="space-y-2 max-w-xs">
              <label className="text-xs font-semibold text-slate-700">Enter Your Answer:</label>
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => handleSelectOption(currentQuestion.id, e.target.value)}
                placeholder="e.g. 10 or 3/4"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}
        </div>

        {/* Question Footer Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
          <Button
            variant="outline"
            size="md"
            onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
            disabled={currentIndex === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {currentIndex < totalQuestions - 1 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentIndex((idx) => Math.min(totalQuestions - 1, idx + 1))}
              className="gap-1.5"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="mint"
              size="md"
              onClick={() => setConfirmSubmitOpen(true)}
              className="gap-2 font-bold"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Quiz
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Submit Modal */}
      <Modal
        isOpen={confirmSubmitOpen}
        onClose={() => setConfirmSubmitOpen(false)}
        title="Ready to submit your quiz?"
        description={`You have answered ${answeredCount} of ${totalQuestions} questions.`}
      >
        <div className="space-y-4 pt-2">
          {answeredCount < totalQuestions && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              You have unanswered questions. Unanswered questions will receive 0 points.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setConfirmSubmitOpen(false)}
              disabled={isSubmitting}
            >
              Continue Test
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitAttempt}
              isLoading={isSubmitting}
            >
              Submit & Score
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
