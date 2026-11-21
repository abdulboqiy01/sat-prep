import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  Shuffle,
  Award,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CefrBadge } from '../../components/vocabulary/CefrBadge';
import { VocabularyService } from '../../services/vocabulary.service';
import { speakWord } from '../../utils/audio';
import type { VocabularyWord, VocabReviewRating, CefrLevel } from '../../types/vocabulary.types';
import { cn } from '../../utils/cn';

export const FlashcardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel | 'all'>('all');
  const [reviewedCount, setReviewedCount] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const loadDeck = useCallback(async (level: CefrLevel | 'all') => {
    try {
      setLoading(true);
      setIsFlipped(false);
      setSessionCompleted(false);
      setCurrentIndex(0);
      setReviewedCount(0);

      const res = await VocabularyService.getWords({
        cefr: level === 'all' ? undefined : level,
      });

      // Default session deck size of 20 cards
      const shuffled = [...res.words].sort(() => 0.5 - Math.random()).slice(0, 20);
      setWords(shuffled);
    } catch (err) {
      console.error('Failed to load flashcard deck:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeck(selectedCefr);
  }, [loadDeck, selectedCefr]);

  const currentWord = words[currentIndex];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

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

    // If "Again", re-insert at end of deck for immediate reinforcement
    if (rating === 'again') {
      setWords((prev) => [...prev, currentWord]);
    }

    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted || loading) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleRating('again');
        if (e.key === '2') handleRating('hard');
        if (e.key === '3') handleRating('good');
        if (e.key === '4') handleRating('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, sessionCompleted, loading, currentIndex, words]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">Preparing flashcard deck...</p>
      </div>
    );
  }

  // Session Completed Screen
  if (sessionCompleted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Flashcard Session Completed!
          </h2>
          <p className="text-sm text-slate-600">
            You reviewed <strong className="text-slate-900">{reviewedCount}</strong> cards. Spaced repetition intervals have been recalculated and saved to your profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => loadDeck(selectedCefr)} className="w-full sm:w-auto gap-2">
            <RotateCcw className="w-4 h-4" /> Review Another Deck
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
      {/* 1. Header & Deck Filter */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            SAT Flashcards
          </h1>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {(['all', 'B2', 'C1', 'C2'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedCefr(lvl)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all',
                selectedCefr === lvl
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {lvl === 'all' ? 'All' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Progress Tracker */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>
          Card <strong className="text-slate-900">{currentIndex + 1}</strong> of{' '}
          <strong className="text-slate-900">{words.length}</strong>
        </span>
        <button
          onClick={() => loadDeck(selectedCefr)}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition"
          title="Shuffle deck"
        >
          <Shuffle className="w-3.5 h-3.5" /> Shuffle
        </button>
      </div>

      {/* 3. 3D Flashcard Container */}
      <div
        onClick={handleFlip}
        className="w-full min-h-[380px] sm:min-h-[420px] cursor-pointer perspective-[1200px]"
      >
        <div
          className={cn(
            'w-full h-full min-h-[380px] sm:min-h-[420px] transition-transform duration-500 transform-style-3d relative',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* FRONT OF CARD */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden p-8 sm:p-10 rounded-3xl border-2 border-slate-200/90 bg-white shadow-md flex flex-col justify-between select-none',
              isFlipped && 'pointer-events-none'
            )}
          >
            <div className="flex items-center justify-between">
              <CefrBadge level={currentWord.cefr_level} size="sm" />
              <button
                onClick={handleSpeak}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-brand-600 transition"
                title="Pronounce"
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
              <p className="text-xs text-slate-400 font-semibold">{currentWord.category}</p>
            </div>

            <div className="text-center border-t border-slate-100 pt-3">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">
                Click card or press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-mono">Space</kbd> to flip
              </span>
            </div>
          </div>

          {/* BACK OF CARD */}
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
              {/* Definition */}
              <div className="space-y-1">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">Definition</span>
                <p className="text-base font-bold text-slate-900 leading-snug">{currentWord.definition}</p>
                <p className="text-xs text-slate-600">
                  <strong>Simple:</strong> {currentWord.simple_explanation}
                </p>
              </div>

              {/* SAT Context */}
              <div className="p-3 bg-white/90 border border-brand-100 rounded-xl space-y-1 text-xs">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-brand-700">SAT Context</span>
                <p className="italic text-slate-800 leading-relaxed">"{currentWord.sat_context_sentence}"</p>
              </div>

              {/* Synonyms & Antonyms */}
              <div className="grid grid-cols-2 gap-2 text-2xs">
                <div>
                  <strong className="text-emerald-700">Synonyms: </strong>
                  <span className="text-slate-600">{currentWord.synonyms.slice(0, 3).join(', ')}</span>
                </div>
                <div>
                  <strong className="text-rose-700">Antonyms: </strong>
                  <span className="text-slate-600">{currentWord.antonyms.slice(0, 2).join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="text-center border-t border-slate-100 pt-2">
              <span className="text-2xs font-bold text-slate-400">Rate your recall below to update schedule</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SM-2 Spaced Repetition Rating Buttons */}
      {isFlipped && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Again (1) */}
            <button
              onClick={() => handleRating('again')}
              className="p-3 sm:p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-900 font-bold transition flex flex-col items-center shadow-2xs group"
            >
              <span className="text-sm sm:text-base font-black">Again</span>
              <span className="text-2xs text-rose-600 font-semibold mt-0.5">&lt; 15 min</span>
              <kbd className="hidden sm:inline-block text-3xs bg-white px-1.5 py-0.5 rounded border border-rose-200 text-rose-700 mt-1 font-mono">1</kbd>
            </button>

            {/* Hard (2) */}
            <button
              onClick={() => handleRating('hard')}
              className="p-3 sm:p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-bold transition flex flex-col items-center shadow-2xs group"
            >
              <span className="text-sm sm:text-base font-black">Hard</span>
              <span className="text-2xs text-amber-600 font-semibold mt-0.5">1-2 days</span>
              <kbd className="hidden sm:inline-block text-3xs bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-700 mt-1 font-mono">2</kbd>
            </button>

            {/* Good (3) */}
            <button
              onClick={() => handleRating('good')}
              className="p-3 sm:p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-bold transition flex flex-col items-center shadow-2xs group"
            >
              <span className="text-sm sm:text-base font-black">Good</span>
              <span className="text-2xs text-blue-600 font-semibold mt-0.5">3-5 days</span>
              <kbd className="hidden sm:inline-block text-3xs bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-700 mt-1 font-mono">3</kbd>
            </button>

            {/* Easy (4) */}
            <button
              onClick={() => handleRating('easy')}
              className="p-3 sm:p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-bold transition flex flex-col items-center shadow-2xs group"
            >
              <span className="text-sm sm:text-base font-black">Easy</span>
              <span className="text-2xs text-emerald-600 font-semibold mt-0.5">7+ days</span>
              <kbd className="hidden sm:inline-block text-3xs bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700 mt-1 font-mono">4</kbd>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
