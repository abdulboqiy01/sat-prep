import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CefrBadge } from '../../components/vocabulary/CefrBadge';
import { VocabularyService } from '../../services/vocabulary.service';
import { speakWord } from '../../utils/audio';
import type { VocabularyWord, VocabReviewRating } from '../../types/vocabulary.types';
import { cn } from '../../utils/cn';

export const ReviewWordsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dueWords, setDueWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    async function fetchDueWords() {
      try {
        setLoading(true);
        const words = await VocabularyService.getReviewDueWords();
        setDueWords(words);
      } catch (err) {
        console.error('Error fetching review queue:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDueWords();
  }, []);

  const currentWord = dueWords[currentIndex];

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;
    try {
      setSpeaking(true);
      await speakWord(currentWord.word);
    } finally {
      setSpeaking(false);
    }
  };

  const handleRating = async (rating: VocabReviewRating) => {
    if (!currentWord) return;
    await VocabularyService.recordReview(currentWord.id, rating);
    setReviewedCount((prev) => prev + 1);

    if (currentIndex < dueWords.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">Checking review schedule...</p>
      </div>
    );
  }

  if (dueWords.length === 0 || sessionCompleted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Review Queue Clean!
          </h2>
          <p className="text-sm text-slate-600">
            {reviewedCount > 0
              ? `Great job! You successfully reviewed ${reviewedCount} words. Spaced repetition memory intervals have been refreshed.`
              : 'You have no words overdue for review right now. All words are on track!'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate('/vocabulary/learn')} className="w-full sm:w-auto">
            Learn New Words
          </Button>
          <Button variant="primary" onClick={() => navigate('/vocabulary')} className="w-full sm:w-auto">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-600" /> Overdue Words Review
          </h1>
        </div>

        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
          {currentIndex + 1} of {dueWords.length} in queue
        </span>
      </div>

      {/* 3D Review Card */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full min-h-[380px] sm:min-h-[420px] cursor-pointer perspective-[1200px]"
      >
        <div
          className={cn(
            'w-full h-full min-h-[380px] sm:min-h-[420px] transition-transform duration-500 transform-style-3d relative',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* FRONT */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden p-8 sm:p-10 rounded-3xl border-2 border-amber-200/90 bg-white shadow-md flex flex-col justify-between select-none',
              isFlipped && 'pointer-events-none'
            )}
          >
            <div className="flex items-center justify-between">
              <CefrBadge level={currentWord.cefr_level} size="sm" />
              <button
                onClick={handleSpeak}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-brand-600 transition"
              >
                <Volume2 className={cn('w-4 h-4', speaking && 'animate-pulse text-brand-600')} />
              </button>
            </div>

            <div className="text-center space-y-3 my-auto py-6">
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {currentWord.word}
              </h2>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                <span className="font-mono text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200/50">
                  {currentWord.pronunciation}
                </span>
                <span>•</span>
                <span className="italic">{currentWord.part_of_speech}</span>
              </div>
            </div>

            <div className="text-center border-t border-slate-100 pt-3">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">
                Click card or press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">Space</kbd> to reveal meaning
              </span>
            </div>
          </div>

          {/* BACK */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rotate-y-180 p-6 sm:p-8 rounded-3xl border-2 border-brand-200 bg-gradient-to-b from-white to-brand-50/20 shadow-md flex flex-col justify-between select-none overflow-y-auto'
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-extrabold text-base text-slate-900">{currentWord.word}</span>
              <CefrBadge level={currentWord.cefr_level} size="sm" />
            </div>

            <div className="space-y-3.5 my-auto py-3 text-left">
              <div className="space-y-1">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">Definition</span>
                <p className="text-base font-bold text-slate-900 leading-snug">{currentWord.definition}</p>
                <p className="text-xs text-slate-600">
                  <strong>Simple:</strong> {currentWord.simple_explanation}
                </p>
              </div>

              <div className="p-3 bg-white/90 border border-brand-100 rounded-xl space-y-1 text-xs">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-brand-700">SAT Context</span>
                <p className="italic text-slate-800 leading-relaxed">"{currentWord.sat_context_sentence}"</p>
              </div>
            </div>

            <div className="text-center border-t border-slate-100 pt-2">
              <span className="text-2xs font-bold text-slate-400">Rate your recall to schedule next interval</span>
            </div>
          </div>
        </div>
      </div>

      {/* SM-2 Buttons */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => handleRating('again')}
            className="p-3 sm:p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-900 font-bold transition flex flex-col items-center shadow-2xs"
          >
            <span className="text-sm sm:text-base font-black">Again</span>
            <span className="text-2xs text-rose-600 font-semibold mt-0.5">&lt; 15 min</span>
          </button>
          <button
            onClick={() => handleRating('hard')}
            className="p-3 sm:p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-bold transition flex flex-col items-center shadow-2xs"
          >
            <span className="text-sm sm:text-base font-black">Hard</span>
            <span className="text-2xs text-amber-600 font-semibold mt-0.5">1-2 days</span>
          </button>
          <button
            onClick={() => handleRating('good')}
            className="p-3 sm:p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-bold transition flex flex-col items-center shadow-2xs"
          >
            <span className="text-sm sm:text-base font-black">Good</span>
            <span className="text-2xs text-blue-600 font-semibold mt-0.5">3-5 days</span>
          </button>
          <button
            onClick={() => handleRating('easy')}
            className="p-3 sm:p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-bold transition flex flex-col items-center shadow-2xs"
          >
            <span className="text-sm sm:text-base font-black">Easy</span>
            <span className="text-2xs text-emerald-600 font-semibold mt-0.5">7+ days</span>
          </button>
        </div>
      )}
    </div>
  );
};
