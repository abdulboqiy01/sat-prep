import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Volume2,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CefrBadge } from '../../components/vocabulary/CefrBadge';
import { VocabularyService } from '../../services/vocabulary.service';
import { speakWord } from '../../utils/audio';
import type {
  UserVocabularyItem,
  CefrLevel,
} from '../../types/vocabulary.types';
import { cn } from '../../utils/cn';

type FilterTab = 'all' | 'saved' | 'learning' | 'mastered' | 'difficult' | 'review_due';

export const MyVocabularyPage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userItems, setUserItems] = useState<UserVocabularyItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'alpha-asc' | 'alpha-desc' | 'interval'>('alpha-asc');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await VocabularyService.getUserVocabulary();
        setUserItems(data);
      } catch (err) {
        console.error('Failed to load user vocabulary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSpeak = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(word);
  };

  const handleToggleSave = async (wordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await VocabularyService.toggleSaveWord(wordId);
    const updated = await VocabularyService.getUserVocabulary();
    setUserItems(updated);
  };

  const filteredWords = useMemo(() => {
    return userItems.filter((item) => {
      const w = item.word;
      if (!w) return false;

      // Tab filter
      if (activeTab === 'saved' && !item.is_saved) return false;
      if (activeTab === 'learning' && item.status !== 'learning') return false;
      if (activeTab === 'mastered' && item.status !== 'mastered') return false;
      if (activeTab === 'difficult' && !item.is_difficult) return false;
      if (activeTab === 'review_due') {
        const isDue = new Date(item.next_review_at).getTime() <= Date.now();
        if (!isDue) return false;
      }

      // CEFR level filter
      if (selectedCefr !== 'all' && w.cefr_level !== selectedCefr) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesWord = w.word.toLowerCase().includes(q);
        const matchesDef = w.definition.toLowerCase().includes(q);
        const matchesTag = w.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesWord && !matchesDef && !matchesTag) return false;
      }

      return true;
    }).sort((a, b) => {
      const wordA = a.word?.word || '';
      const wordB = b.word?.word || '';
      if (sortBy === 'alpha-asc') return wordA.localeCompare(wordB);
      if (sortBy === 'alpha-desc') return wordB.localeCompare(wordA);
      if (sortBy === 'interval') return (b.current_interval || 0) - (a.current_interval || 0);
      return 0;
    });
  }, [userItems, activeTab, selectedCefr, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">Loading your vocabulary notebook...</p>
      </div>
    );
  }

  const counts = {
    all: userItems.length,
    saved: userItems.filter((i) => i.is_saved).length,
    learning: userItems.filter((i) => i.status === 'learning').length,
    mastered: userItems.filter((i) => i.status === 'mastered').length,
    difficult: userItems.filter((i) => i.is_difficult).length,
    review_due: userItems.filter((i) => new Date(i.next_review_at).getTime() <= Date.now()).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Vocabulary Notebook
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Personal collection of saved, in-progress, and mastered SAT academic vocabulary.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/vocabulary/learn')}
          className="gap-2 font-bold"
        >
          <BookOpen className="w-4 h-4" /> Study New Words
        </Button>
      </div>

      {/* 2. Collection Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/60 text-xs font-bold">
        {[
          { id: 'all', label: 'All Encountered', count: counts.all },
          { id: 'saved', label: 'Bookmarked', count: counts.saved },
          { id: 'learning', label: 'In Progress', count: counts.learning },
          { id: 'review_due', label: 'Review Due', count: counts.review_due },
          { id: 'difficult', label: 'Difficult', count: counts.difficult },
          { id: 'mastered', label: 'Mastered', count: counts.mastered },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={cn(
              'px-3.5 py-2 rounded-xl transition flex items-center gap-2 shrink-0',
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'text-2xs px-1.5 py-0.2 rounded-full font-extrabold',
                activeTab === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search word, definition, or tag..."
            className="w-full pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCefr}
            onChange={(e) => setSelectedCefr(e.target.value as any)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="all">All CEFR Levels</option>
            <option value="B2">Level B2 (Upper-Intermediate)</option>
            <option value="C1">Level C1 (Advanced Academic)</option>
            <option value="C2">Level C2 (Proficiency)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="alpha-asc">Alphabetical (A → Z)</option>
            <option value="alpha-desc">Alphabetical (Z → A)</option>
            <option value="interval">Longest Retention Interval</option>
          </select>
        </div>
      </div>

      {/* 4. Words Grid */}
      {filteredWords.length === 0 ? (
        <Card className="p-12 text-center space-y-4 max-w-md mx-auto border-dashed">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">No Words in this View</h3>
            <p className="text-xs text-slate-500">
              {activeTab === 'saved'
                ? 'You haven\'t bookmarked any words yet. Bookmark words during your study sessions!'
                : 'No words match your selected filters. Explore more words in the Learn module.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/vocabulary/learn')}>
            Explore Words
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item) => {
            const w = item.word!;
            return (
              <Card
                key={item.id}
                className="p-5 border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-3 hover:border-slate-300 hover:shadow-2xs transition"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{w.word}</h3>
                        <button
                          onClick={(e) => handleSpeak(w.word, e)}
                          className="p-1 text-slate-400 hover:text-brand-600 transition"
                          title="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-2xs font-mono text-slate-400">{w.pronunciation} • {w.part_of_speech}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CefrBadge level={w.cefr_level} size="sm" />
                      <button
                        onClick={(e) => handleToggleSave(w.id, e)}
                        className={cn(
                          'p-1 text-slate-400 hover:text-brand-600 transition',
                          item.is_saved && 'text-brand-600 fill-current'
                        )}
                        title="Bookmark"
                      >
                        <Bookmark className={cn('w-4 h-4', item.is_saved && 'fill-current')} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{w.definition}</p>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-2xs text-slate-600 italic">
                    "{w.sat_context_sentence}"
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{item.status}</span>
                    <span>•</span>
                    <span>Interval: {item.current_interval}d</span>
                  </div>

                  <Link
                    to={`/vocabulary/learn?word=${w.word}`}
                    className="text-brand-600 hover:text-brand-800 font-bold"
                  >
                    Study →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
