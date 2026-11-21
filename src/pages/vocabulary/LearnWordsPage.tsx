import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Volume2,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CefrBadge } from '../../components/vocabulary/CefrBadge';
import { VocabularyService } from '../../services/vocabulary.service';
import { VocabularyAIService, type AIExplanationResult } from '../../services/vocabulary-ai.service';
import { speakWord } from '../../utils/audio';
import type { VocabularyWord, CefrLevel } from '../../types/vocabulary.types';
import { cn } from '../../utils/cn';

export const LearnWordsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel | 'all'>('all');
  const [isSaved, setIsSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Gemini AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<AIExplanationResult | null>(null);

  useEffect(() => {
    async function fetchWords() {
      try {
        setLoading(true);
        const cefrParam = (searchParams.get('cefr') as CefrLevel) || undefined;
        if (cefrParam) setSelectedCefr(cefrParam);

        const targetWordParam = searchParams.get('word');
        const res = await VocabularyService.getWords({
          cefr: cefrParam,
        });

        setWords(res.words);

        // If specific word requested via URL query
        if (targetWordParam) {
          const foundIdx = res.words.findIndex(
            (w) => w.word.toLowerCase() === targetWordParam.toLowerCase()
          );
          if (foundIdx >= 0) setCurrentIndex(foundIdx);
        }
      } catch (err) {
        console.error('Error fetching vocabulary list:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWords();
  }, [searchParams]);

  const currentWord = words[currentIndex];

  useEffect(() => {
    // Reset word-specific states
    setAiData(null);
    setIsSaved(false);
  }, [currentIndex, currentWord]);

  const handleCefrChange = (level: CefrLevel | 'all') => {
    setSelectedCefr(level);
    setCurrentIndex(0);
    if (level === 'all') {
      searchParams.delete('cefr');
    } else {
      searchParams.set('cefr', level);
    }
    setSearchParams(searchParams);
  };

  const handleSpeak = async () => {
    if (!currentWord) return;
    try {
      setSpeaking(true);
      await speakWord(currentWord.word);
    } finally {
      setSpeaking(false);
    }
  };

  const handleToggleSave = async () => {
    if (!currentWord) return;
    const newState = await VocabularyService.toggleSaveWord(currentWord.id);
    setIsSaved(newState);
  };

  const handleResponse = async (knowsWord: boolean) => {
    if (!currentWord) return;
    await VocabularyService.markLearningEncounter(currentWord.id, knowsWord);

    // Advance to next word
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleAskAI = async () => {
    if (!currentWord || aiLoading || aiData) return;
    try {
      setAiLoading(true);
      const res = await VocabularyAIService.explainWord(currentWord.word);
      setAiData(res);
    } catch (err) {
      console.error('AI explanation failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">Preparing vocabulary lesson...</p>
      </div>
    );
  }

  if (!currentWord || words.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-900">No Vocabulary Found</h2>
        <p className="text-sm text-slate-600">Try adjusting your CEFR filters to view more words.</p>
        <Button onClick={() => handleCefrChange('all')}>Reset Filters</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      {/* 1. Header & Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vocabulary Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Interactive Word Study
          </h1>
        </div>

        {/* CEFR Level Segmented Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {(['all', 'B2', 'C1', 'C2'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleCefrChange(lvl)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                selectedCefr === lvl
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {lvl === 'all' ? 'All (500)' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Progress Tracker Pill */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>
          Word <strong className="text-slate-900">{currentIndex + 1}</strong> of{' '}
          <strong className="text-slate-900">{words.length}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous word"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(words.length - 1, prev + 1))}
            disabled={currentIndex === words.length - 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next word"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Word Card */}
      <Card className="p-6 sm:p-10 space-y-6 bg-white border-2 border-slate-200/90 rounded-3xl shadow-sm relative">
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {currentWord.word}
              </h2>
              <CefrBadge level={currentWord.cefr_level} size="md" />
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium pt-1">
              <span className="font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/50">
                {currentWord.pronunciation}
              </span>
              <span>•</span>
              <span className="italic font-semibold text-slate-700">{currentWord.part_of_speech}</span>
              <span>•</span>
              <span className="text-slate-600">{currentWord.category}</span>
            </div>
          </div>

          {/* Audio & Bookmark buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              disabled={speaking}
              className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 transition shadow-2xs"
              title="Listen to native pronunciation"
              aria-label="Listen to pronunciation"
            >
              <Volume2 className={cn('w-5 h-5', speaking && 'animate-pulse text-brand-600')} />
            </button>

            <button
              onClick={handleToggleSave}
              className={cn(
                'p-3 rounded-2xl border transition shadow-2xs',
                isSaved
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              )}
              title={isSaved ? 'Saved to collection' : 'Save to My Vocabulary'}
              aria-label="Save word"
            >
              <Bookmark className={cn('w-5 h-5', isSaved && 'fill-current')} />
            </button>
          </div>
        </div>

        {/* Definition & Simple Explanation */}
        <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2">
          <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">
            Definition & Core Meaning
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentWord.definition}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 pt-1">
            <strong className="text-slate-800">In Simple English: </strong>
            {currentWord.simple_explanation}
          </p>
        </div>

        {/* SAT Contextual Sentence */}
        <div className="p-5 bg-brand-50/50 border border-brand-200/70 rounded-2xl space-y-1.5">
          <span className="text-2xs font-extrabold uppercase tracking-widest text-brand-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Authentic SAT Contextual Sentence
          </span>
          <p className="text-sm sm:text-base text-slate-900 italic font-medium leading-relaxed">
            "{currentWord.sat_context_sentence}"
          </p>
        </div>

        {/* Example Sentence */}
        <div className="p-4 bg-white border border-slate-200/70 rounded-2xl space-y-1 text-xs">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Everyday Usage Example
          </span>
          <p className="text-slate-700 font-medium">"{currentWord.example_sentence}"</p>
        </div>

        {/* Synonyms & Antonyms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1">
            <span className="font-bold text-emerald-900 uppercase tracking-wider text-2xs">
              Direct Synonyms
            </span>
            <div className="text-emerald-950 font-medium">
              {currentWord.synonyms.join(', ') || 'No direct synonyms listed'}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1">
            <span className="font-bold text-rose-900 uppercase tracking-wider text-2xs">
              Antonyms & Contrasts
            </span>
            <div className="text-rose-950 font-medium">
              {currentWord.antonyms.join(', ') || 'None listed'}
            </div>
          </div>
        </div>

        {/* Gemini AI Word Breakdown Section */}
        {aiData ? (
          <div className="p-5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
              <span className="font-bold text-purple-900 flex items-center gap-1.5 uppercase tracking-wider text-2xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Gemini Socratic Tutor Insights
              </span>
              <span className="text-purple-700 font-semibold">{aiData.connotation}</span>
            </div>

            <div className="space-y-1.5">
              <p className="text-purple-950">
                <strong>Memory Hook: </strong> {aiData.memory_hook}
              </p>
              <p className="text-purple-950">
                <strong>Common SAT Trap: </strong> {aiData.sat_trap}
              </p>
            </div>
          </div>
        ) : (
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAskAI}
              isLoading={aiLoading}
              className="gap-2 text-purple-700 border-purple-200 hover:bg-purple-50 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" /> Explain with Gemini (Memory Hook & SAT Traps)
            </Button>
          </div>
        )}

        {/* 4. Action Buttons Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={() => handleResponse(false)}
              className="flex-1 sm:flex-initial gap-2 text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-bold"
            >
              <RotateCcw className="w-4 h-4" /> Need More Practice
            </Button>

            <Button
              variant="mint"
              size="md"
              onClick={() => handleResponse(true)}
              className="flex-1 sm:flex-initial gap-2 font-extrabold shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" /> I Know This Word
            </Button>
          </div>

          <Button
            variant="ghost"
            size="md"
            onClick={() => setCurrentIndex((prev) => Math.min(words.length - 1, prev + 1))}
            disabled={currentIndex === words.length - 1}
            className="w-full sm:w-auto gap-1.5 text-slate-600 hover:text-slate-900"
          >
            Next Word <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
