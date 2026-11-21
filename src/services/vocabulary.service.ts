import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import staticVocabData from '../data/vocabulary_500.json';
import { calculateSrsReview, isWordDueForReview } from '../utils/srs';
import type {
  VocabularyWord,
  UserVocabularyItem,
  VocabReviewRating,
  CefrLevel,
  VocabCategory,
  QuizExerciseType,
  QuizQuestion,
  QuizAttemptRecord,
  VocabularyDashboardStats,
  VocabularyDailyStats,
} from '../types/vocabulary.types';

const LOCAL_STORAGE_KEY_VOCAB = 'sat_prep_user_vocab_state';
const LOCAL_STORAGE_KEY_QUIZZES = 'sat_prep_user_vocab_quizzes';
const LOCAL_STORAGE_KEY_DAILY_STATS = 'sat_prep_user_vocab_daily_stats';

export class VocabularyService {
  private static staticWords: VocabularyWord[] = staticVocabData as VocabularyWord[];

  /**
   * Retrieves all vocabulary words with optional filtering.
   * Pulls from Supabase with instant zero-downtime fallback to the 500-word dataset.
   */
  static async getWords(params?: {
    cefr?: CefrLevel;
    category?: VocabCategory | string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ words: VocabularyWord[]; total: number }> {
    try {
      let query = (supabase as any).from('vocabulary_words').select('*', { count: 'exact' });

      if (params?.cefr) {
        query = query.eq('cefr_level', params.cefr);
      }
      if (params?.category && params.category !== 'All') {
        query = query.eq('category', params.category);
      }
      if (params?.search) {
        query = query.ilike('word', `%${params.search}%`);
      }

      if (params?.limit) {
        const from = params.offset || 0;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      } else {
        query = query.order('word', { ascending: true });
      }

      const { data, count, error } = await query;
      if (!error && data && data.length > 0) {
        return {
          words: data as VocabularyWord[],
          total: count ?? data.length,
        };
      }
    } catch {
      // Fall through to curated static dataset
    }

    // Static fallback with in-memory filtering
    let filtered = [...this.staticWords];
    if (params?.cefr) {
      filtered = filtered.filter((w) => w.cefr_level === params.cefr);
    }
    if (params?.category && params.category !== 'All') {
      filtered = filtered.filter((w) => w.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    if (params?.limit) {
      const offset = params.offset || 0;
      filtered = filtered.slice(offset, offset + params.limit);
    }

    return { words: filtered, total };
  }

  /**
   * Retrieves a single word by its ID or by the exact word string.
   */
  static async getWord(idOrWord: string): Promise<VocabularyWord | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('vocabulary_words')
        .select('*')
        .or(`id.eq.${idOrWord},word.ilike.${idOrWord}`)
        .maybeSingle();

      if (!error && data) {
        return data as VocabularyWord;
      }
    } catch {
      // Fall through
    }

    return (
      this.staticWords.find(
        (w) => w.id === idOrWord || w.word.toLowerCase() === idOrWord.toLowerCase()
      ) || null
    );
  }

  /**
   * Returns a deterministic Word of the Day based on the calendar day.
   * Rotates daily through C1 and C2 words, guaranteeing freshness.
   */
  static getWordOfTheDay(): VocabularyWord {
    const today = new Date();
    // Unique seed for each calendar day: YYYYMMDD
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    // Prioritize high-impact C1 and C2 words for Word of the Day
    const advancedPool = this.staticWords.filter((w) => w.cefr_level === 'C1' || w.cefr_level === 'C2');
    const index = Math.abs(dateSeed) % (advancedPool.length || this.staticWords.length);
    return advancedPool[index] || this.staticWords[0];
  }

  /**
   * Retrieves personal vocabulary list for the authenticated student.
   */
  static async getUserVocabulary(): Promise<UserVocabularyItem[]> {
    let userId: string | null = null;
    try {
      const user = await AuthService.getCurrentUser();
      userId = user.id;

      const { data, error } = await (supabase as any)
        .from('user_vocabulary')
        .select('*, vocabulary_words(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          word: item.vocabulary_words,
        }));
      }
    } catch {
      // Fallback to verified local persistence
    }

    return this.getLocalUserVocabulary(userId || 'guest');
  }

  /**
   * Toggles saved/favorite status of a vocabulary word.
   */
  static async toggleSaveWord(wordId: string): Promise<boolean> {
    let userId = 'guest';
    try {
      const user = await AuthService.getCurrentUser();
      userId = user.id;

      const { data: existing } = await (supabase as any)
        .from('user_vocabulary')
        .select('id, is_saved')
        .eq('user_id', userId)
        .eq('word_id', wordId)
        .maybeSingle();

      const newSavedState = !existing?.is_saved;

      await (supabase as any).from('user_vocabulary').upsert(
        {
          user_id: userId,
          word_id: wordId,
          is_saved: newSavedState,
          status: 'learning',
          next_review_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id, word_id' }
      );

      return newSavedState;
    } catch {
      // Local fallback
      return this.toggleLocalSaveWord(userId, wordId);
    }
  }

  /**
   * Records a user's initial learning encounter ("I Know This Word" or "Need More Practice").
   */
  static async markLearningEncounter(wordId: string, knowsWord: boolean): Promise<UserVocabularyItem> {
    const rating: VocabReviewRating = knowsWord ? 'good' : 'again';
    return this.recordReview(wordId, rating);
  }

  /**
   * Executes Spaced Repetition (SRS) Review using the SM-2 algorithm.
   */
  static async recordReview(wordId: string, rating: VocabReviewRating): Promise<UserVocabularyItem> {
    let userId = 'guest';
    try {
      const user = await AuthService.getCurrentUser();
      userId = user.id;
    } catch {}

    // 1. Fetch current item state
    let currentItem: Partial<UserVocabularyItem> = {};
    try {
      const { data } = await (supabase as any)
        .from('user_vocabulary')
        .select('*')
        .eq('user_id', userId)
        .eq('word_id', wordId)
        .maybeSingle();
      if (data) currentItem = data;
    } catch {
      currentItem = this.getLocalUserVocabulary(userId).find((i) => i.word_id === wordId) || {};
    }

    // 2. Compute updated SM-2 scheduling
    const srs = calculateSrsReview(currentItem, rating);

    const payload = {
      user_id: userId,
      word_id: wordId,
      status: srs.status,
      is_difficult: srs.isDifficult,
      next_review_at: srs.nextReviewAt,
      last_reviewed_at: new Date().toISOString(),
      review_count: srs.reviewCount,
      correct_count: srs.correctCount,
      incorrect_count: srs.incorrectCount,
      ease_factor: srs.easeFactor,
      current_interval: srs.intervalDays,
      updated_at: new Date().toISOString(),
    };

    // 3. Persist to Supabase
    try {
      const { data, error } = await (supabase as any)
        .from('user_vocabulary')
        .upsert(payload, { onConflict: 'user_id, word_id' })
        .select('*, vocabulary_words(*)')
        .single();

      if (!error && data) {
        // Log review history
        await (supabase as any).from('vocabulary_reviews').insert({
          user_id: userId,
          word_id: wordId,
          rating,
          scheduled_interval: srs.intervalDays,
          actual_interval: currentItem.current_interval || 0,
          ease_factor_before: currentItem.ease_factor || 2.5,
          ease_factor_after: srs.easeFactor,
        });

        // Update daily stats
        await this.incrementDailyActivity(userId, 'review');

        return {
          ...data,
          word: data.vocabulary_words || (await this.getWord(wordId)),
        };
      }
    } catch {
      // Fall through to local fallback
    }

    // Local persistence fallback
    return this.saveLocalUserVocabularyItem(userId, payload, rating);
  }

  /**
   * Retrieves words that are currently overdue or due today for review.
   */
  static async getReviewDueWords(): Promise<VocabularyWord[]> {
    const userVocab = await this.getUserVocabulary();
    const dueWordIds = userVocab
      .filter((item) => isWordDueForReview(item.next_review_at) || item.status === 'review_due')
      .map((item) => item.word_id);

    if (dueWordIds.length === 0) {
      // If none due, return difficult words or a sampling of learning words
      const difficultIds = userVocab
        .filter((item) => item.is_difficult || item.status === 'learning')
        .slice(0, 10)
        .map((item) => item.word_id);

      if (difficultIds.length > 0) {
        return this.staticWords.filter((w) => difficultIds.includes(w.id));
      }

      // Default sample for initial review
      return this.staticWords.slice(0, 10);
    }

    return this.staticWords.filter((w) => dueWordIds.includes(w.id));
  }

  /**
   * Generates a rich, multi-format vocabulary quiz.
   */
  static async generateQuiz(params: {
    exerciseType?: QuizExerciseType;
    count?: number;
    cefr?: CefrLevel;
  }): Promise<QuizQuestion[]> {
    const count = params.count || 10;
    const { words } = await this.getWords({ cefr: params.cefr });
    const pool = words.length >= count ? words : this.staticWords;

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, count);

    const questions: QuizQuestion[] = [];
    const exerciseTypes: QuizExerciseType[] = [
      'definition',
      'synonym',
      'antonym',
      'fill_blank',
      'sentence_completion',
      'sat_context',
    ];

    selectedWords.forEach((wordItem, idx) => {
      const type = params.exerciseType || exerciseTypes[idx % exerciseTypes.length];
      const distractors = this.getRandomDistractors(wordItem, pool, 3);
      const question = this.buildQuizQuestion(wordItem, type, distractors, idx + 1);
      questions.push(question);
    });

    return questions;
  }

  /**
   * Records completed quiz attempt.
   */
  static async recordQuizAttempt(attempt: QuizAttemptRecord): Promise<void> {
    let userId = 'guest';
    try {
      const user = await AuthService.getCurrentUser();
      userId = user.id;

      await (supabase as any).from('vocabulary_quiz_attempts').insert({
        user_id: userId,
        quiz_type: attempt.quiz_type,
        total_questions: attempt.total_questions,
        correct_answers: attempt.correct_answers,
        score_percentage: attempt.score_percentage,
        answers: attempt.answers,
      });

      await this.incrementDailyActivity(userId, 'quiz', attempt.score_percentage);
    } catch {
      // Local fallback
      this.saveLocalQuizAttempt(userId, attempt);
    }
  }

  /**
   * Compiles live vocabulary dashboard statistics.
   */
  static async getDashboardStats(): Promise<VocabularyDashboardStats> {
    const userVocab = await this.getUserVocabulary();
    const wordOfTheDay = this.getWordOfTheDay();

    const learnedWords = userVocab.filter((w) => w.status === 'mastered').length;
    const wordsInProgress = userVocab.filter((w) => w.status === 'learning').length;
    const wordsToReview = userVocab.filter((w) => isWordDueForReview(w.next_review_at)).length;

    // Daily stats from local or database
    const dailyStats = this.getLocalDailyStats();
    const today = new Date().toISOString().split('T')[0];
    const todayStats = dailyStats[today] || {
      new_words_learned: 0,
      words_reviewed: 0,
      daily_goal: 10,
    };

    const dailyGoal = todayStats.daily_goal || 10;
    const dailyGoalProgress = todayStats.new_words_learned + todayStats.words_reviewed;

    // Calculate streak
    const currentStreak = this.calculateStreak(dailyStats);

    // Accuracy
    const totalCorrect = userVocab.reduce((acc, curr) => acc + (curr.correct_count || 0), 0);
    const totalReviews = userVocab.reduce((acc, curr) => acc + (curr.review_count || 0), 0);
    const accuracyPercentage = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 85;

    // Weekly activity
    const weeklyActivity = this.buildWeeklyActivity(dailyStats);

    return {
      totalWords: 500,
      learnedWords,
      wordsInProgress,
      wordsToReview,
      dailyGoal,
      dailyGoalProgress,
      currentStreak,
      accuracyPercentage,
      totalQuizzesTaken: this.getLocalQuizAttempts().length,
      wordOfTheDay,
      weeklyActivity,
    };
  }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private static buildQuizQuestion(
    word: VocabularyWord,
    type: QuizExerciseType,
    distractors: VocabularyWord[],
    index: number
  ): QuizQuestion {
    const rawOptions = [
      { id: 'correct', text: this.getOptionContentForType(word, type) },
      ...distractors.map((d, i) => ({
        id: `distractor_${i}`,
        text: this.getOptionContentForType(d, type),
      })),
    ].sort(() => 0.5 - Math.random());

    const alphabet = ['A', 'B', 'C', 'D'];
    let correctLetter = 'A';
    const formattedOptions = rawOptions.map((opt, i) => {
      const letter = alphabet[i];
      if (opt.id === 'correct') correctLetter = letter;
      return { id: letter, text: opt.text };
    });

    let prompt = '';
    let passage: string | null = null;
    let explanation = '';

    switch (type) {
      case 'definition':
        prompt = `What is the precise definition of the word **"${word.word}"**?`;
        explanation = `**${word.word}** (${word.part_of_speech}) means: *${word.definition}*. Simple explanation: ${word.simple_explanation}`;
        break;

      case 'synonym':
        prompt = `Which of the following is the most accurate **synonym** for **"${word.word}"**?`;
        explanation = `Synonyms for **${word.word}** include: ${word.synonyms.join(', ')}.`;
        break;

      case 'antonym':
        prompt = `Which of the following is the most direct **antonym** for **"${word.word}"**?`;
        explanation = `Antonyms for **${word.word}** include: ${word.antonyms.join(', ')}.`;
        break;

      case 'fill_blank':
        passage = word.example_sentence.replace(
          new RegExp(`\\b${word.word}\\b`, 'gi'),
          '____________'
        );
        prompt = `Complete the sentence by selecting the word that best fits the context:`;
        explanation = `In this context, **${word.word}** correctly completes the thought: "${word.example_sentence}".`;
        break;

      case 'sat_context':
      default:
        passage = word.sat_context_sentence;
        prompt = `As used in the sentence above, the word **"${word.word}"** most nearly means:`;
        explanation = `In this academic SAT context, **${word.word}** refers to *${word.definition.toLowerCase()}*. The surrounding context clues reinforce this precise meaning.`;
        break;
    }

    return {
      id: `q_${index}_${word.id}`,
      exercise_type: type,
      prompt,
      passage,
      target_word: word.word,
      options: formattedOptions,
      correct_option_id: correctLetter,
      explanation,
      cefr_level: word.cefr_level,
    };
  }

  private static getOptionContentForType(w: VocabularyWord, type: QuizExerciseType): string {
    switch (type) {
      case 'synonym':
        return w.synonyms[0] || w.word;
      case 'antonym':
        return w.antonyms[0] || `Not ${w.word}`;
      case 'fill_blank':
      case 'sentence_completion':
        return w.word;
      case 'definition':
      case 'sat_context':
      default:
        return w.definition;
    }
  }

  private static getRandomDistractors(
    target: VocabularyWord,
    pool: VocabularyWord[],
    count = 3
  ): VocabularyWord[] {
    const candidates = pool.filter((w) => w.id !== target.id);
    return candidates.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // --- Local Persistence & State Sync ---

  private static getLocalUserVocabulary(userId: string): UserVocabularyItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_VOCAB}_${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveLocalUserVocabularyItem(
    userId: string,
    payload: any,
    _rating?: VocabReviewRating
  ): UserVocabularyItem {
    const currentList = this.getLocalUserVocabulary(userId);
    const existingIndex = currentList.findIndex((i) => i.word_id === payload.word_id);
    const targetWord = this.staticWords.find((w) => w.id === payload.word_id);

    const fullItem: UserVocabularyItem = {
      id: payload.id || `local_${payload.word_id}`,
      user_id: userId,
      word_id: payload.word_id,
      status: payload.status,
      is_saved: payload.is_saved ?? false,
      is_difficult: payload.is_difficult ?? false,
      next_review_at: payload.next_review_at,
      last_reviewed_at: payload.last_reviewed_at,
      review_count: payload.review_count,
      correct_count: payload.correct_count,
      incorrect_count: payload.incorrect_count,
      ease_factor: payload.ease_factor,
      current_interval: payload.current_interval,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      word: targetWord,
    };

    if (existingIndex >= 0) {
      currentList[existingIndex] = { ...currentList[existingIndex], ...fullItem };
    } else {
      currentList.push(fullItem);
    }

    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_VOCAB}_${userId}`, JSON.stringify(currentList));
      this.incrementDailyActivity(userId, 'review');
    } catch {}

    return fullItem;
  }

  private static toggleLocalSaveWord(userId: string, wordId: string): boolean {
    const list = this.getLocalUserVocabulary(userId);
    const item = list.find((i) => i.word_id === wordId);
    const newSaved = !item?.is_saved;

    this.saveLocalUserVocabularyItem(
      userId,
      {
        word_id: wordId,
        is_saved: newSaved,
        status: item?.status || 'learning',
        next_review_at: new Date().toISOString(),
      },
      'good'
    );

    return newSaved;
  }

  private static getLocalDailyStats(): Record<string, VocabularyDailyStats> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_DAILY_STATS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private static incrementDailyActivity(
    userId: string,
    type: 'learn' | 'review' | 'quiz',
    quizScore?: number
  ) {
    if (typeof window === 'undefined') return;
    const stats = this.getLocalDailyStats();
    const today = new Date().toISOString().split('T')[0];

    if (!stats[today]) {
      stats[today] = {
        user_id: userId,
        stat_date: today,
        new_words_learned: 0,
        words_reviewed: 0,
        quizzes_taken: 0,
        quiz_accuracy: 0,
        total_study_seconds: 0,
        daily_goal: 10,
        goal_completed: false,
      };
    }

    if (type === 'learn') stats[today].new_words_learned += 1;
    if (type === 'review') stats[today].words_reviewed += 1;
    if (type === 'quiz') {
      stats[today].quizzes_taken += 1;
      stats[today].quiz_accuracy = quizScore || 100;
    }

    const totalDone = stats[today].new_words_learned + stats[today].words_reviewed;
    stats[today].goal_completed = totalDone >= stats[today].daily_goal;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_DAILY_STATS, JSON.stringify(stats));
    } catch {}
  }

  private static calculateStreak(dailyStats: Record<string, VocabularyDailyStats>): number {
    const dates = Object.keys(dailyStats).sort().reverse();
    if (dates.length === 0) return 1;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const entry = dailyStats[dateStr];

      if (entry && (entry.new_words_learned > 0 || entry.words_reviewed > 0 || entry.quizzes_taken > 0)) {
        streak += 1;
      } else if (i === 0) {
        // Today might not have activity yet; don't break streak if yesterday was active
        continue;
      } else {
        break;
      }
    }

    return Math.max(1, streak);
  }

  private static buildWeeklyActivity(
    dailyStats: Record<string, VocabularyDailyStats>
  ): Array<{ day: string; date: string; wordsLearned: number; wordsReviewed: number }> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = dailyStats[dateStr];

      result.push({
        day: days[d.getDay()],
        date: dateStr,
        wordsLearned: entry?.new_words_learned || 0,
        wordsReviewed: entry?.words_reviewed || 0,
      });
    }

    return result;
  }

  private static getLocalQuizAttempts(): QuizAttemptRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_QUIZZES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveLocalQuizAttempt(_userId: string, attempt: QuizAttemptRecord) {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getLocalQuizAttempts();
      list.unshift({ ...attempt, completed_at: new Date().toISOString() });
      localStorage.setItem(LOCAL_STORAGE_KEY_QUIZZES, JSON.stringify(list.slice(0, 50)));
    } catch {}
  }
}
