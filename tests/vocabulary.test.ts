import { describe, it, expect } from 'vitest';
import wordsData from '../src/data/vocabulary_500.json';
import {
  calculateSrsReview,
  isWordDueForReview,
  getIntervalDescription,
} from '../src/utils/srs';
import { VocabularyService } from '../src/services/vocabulary.service';
import type {
  VocabularyWord,
  UserVocabularyItem,
  QuizExerciseType,
} from '../src/types/vocabulary.types';

const ALLOWED_CATEGORIES = [
  'Academic Vocabulary',
  'Argumentation and Rhetoric',
  'Science and Research',
  'Literature and Literary Analysis',
  'History and Social Sciences',
  'Politics and Society',
  'Economics',
  'Philosophy',
  'Evidence and Reasoning',
  "Tone and Author's Attitude",
];

describe('SAT Vocabulary Database Verification', () => {
  const words = wordsData as VocabularyWord[];

  it('contains exactly 500 words', () => {
    expect(words).toHaveLength(500);
  });

  it('strictly adheres to the CEFR distribution (175 B2, 225 C1, 100 C2)', () => {
    const b2Words = words.filter((w) => w.cefr_level === 'B2');
    const c1Words = words.filter((w) => w.cefr_level === 'C1');
    const c2Words = words.filter((w) => w.cefr_level === 'C2');

    expect(b2Words).toHaveLength(175);
    expect(c1Words).toHaveLength(225);
    expect(c2Words).toHaveLength(100);

    // Percentage checks
    expect(b2Words.length / words.length).toBeCloseTo(0.35, 2);
    expect(c1Words.length / words.length).toBeCloseTo(0.45, 2);
    expect(c2Words.length / words.length).toBeCloseTo(0.20, 2);
  });

  it('contains zero duplicates (case-insensitive)', () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const w of words) {
      const lower = w.word.trim().toLowerCase();
      if (seen.has(lower)) {
        duplicates.push(lower);
      }
      seen.add(lower);
    }

    expect(duplicates).toEqual([]);
    expect(seen.size).toBe(500);
  });

  it('all words belong to the 10 approved SAT categories', () => {
    for (const w of words) {
      expect(ALLOWED_CATEGORIES).toContain(w.category);
    }
  });

  it('all words have complete, non-empty metadata', () => {
    for (const w of words) {
      expect(w.id).toBeDefined();
      expect(w.word.trim().length).toBeGreaterThan(0);
      expect(w.pronunciation.trim().length).toBeGreaterThan(0);
      expect(['noun', 'verb', 'adjective', 'adverb']).toContain(w.part_of_speech);
      expect(w.definition.trim().length).toBeGreaterThan(5);
      expect(w.simple_explanation.trim().length).toBeGreaterThan(5);
      expect(Array.isArray(w.synonyms)).toBe(true);
      expect(w.synonyms.length).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(w.antonyms)).toBe(true);
      expect(w.example_sentence.trim().length).toBeGreaterThan(10);
      expect(w.sat_context_sentence.trim().length).toBeGreaterThan(10);
      expect(Array.isArray(w.tags)).toBe(true);
      expect(w.tags.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Spaced Repetition System (SM-2) Calculations', () => {
  const initialItem: Partial<UserVocabularyItem> = {
    current_interval: 0,
    ease_factor: 2.5,
    review_count: 0,
    correct_count: 0,
    incorrect_count: 0,
    status: 'learning',
  };

  it('correctly handles initial review ratings', () => {
    // Again: immediate retry (interval = 0) and lowers ease factor
    const againResult = calculateSrsReview(initialItem, 'again');
    expect(againResult.intervalDays).toBe(0);
    expect(againResult.easeFactor).toBeLessThan(2.5);
    expect(againResult.status).toBe('learning');
    expect(againResult.isDifficult).toBe(true);
    expect(againResult.incorrectCount).toBe(1);

    // Hard: interval 1 day, slight ease penalty
    const hardResult = calculateSrsReview(initialItem, 'hard');
    expect(hardResult.intervalDays).toBe(1);
    expect(hardResult.easeFactor).toBe(2.35);
    expect(hardResult.status).toBe('learning');

    // Good: interval 1 day, unchanged ease
    const goodResult = calculateSrsReview(initialItem, 'good');
    expect(goodResult.intervalDays).toBe(1);
    expect(goodResult.easeFactor).toBe(2.5);
    expect(goodResult.status).toBe('learning');

    // Easy: interval 3 days, bonus ease factor
    const easyResult = calculateSrsReview(initialItem, 'easy');
    expect(easyResult.intervalDays).toBe(3);
    expect(easyResult.easeFactor).toBe(2.65);
    expect(easyResult.status).toBe('learning');
  });

  it('correctly expands intervals on subsequent good reviews', () => {
    // Step 1: Repetition 1
    const step1 = calculateSrsReview(initialItem, 'good');
    expect(step1.intervalDays).toBe(1);

    // Step 2: Repetition 2 (from interval 1 -> interval 3)
    const step2 = calculateSrsReview(
      {
        current_interval: step1.intervalDays,
        ease_factor: step1.easeFactor,
        review_count: step1.reviewCount,
        correct_count: step1.correctCount,
      },
      'good'
    );
    expect(step2.intervalDays).toBe(3);

    // Step 3: Repetition 3 (interval 3 * 2.5 = 7.5 -> 8)
    const step3 = calculateSrsReview(
      {
        current_interval: step2.intervalDays,
        ease_factor: step2.easeFactor,
        review_count: step2.reviewCount,
        correct_count: step2.correctCount,
      },
      'good'
    );
    expect(step3.intervalDays).toBe(8);
  });

  it('promotes word to mastered when mastered threshold is reached', () => {
    const advancedState: Partial<UserVocabularyItem> = {
      current_interval: 10,
      ease_factor: 2.5,
      review_count: 5,
      correct_count: 4,
      status: 'learning',
    };
    // 10 * 2.5 = 25 days (>= 14 days and >= 3 correct) -> mastered
    const result = calculateSrsReview(advancedState, 'good');
    expect(result.intervalDays).toBe(25);
    expect(result.status).toBe('mastered');
  });

  it('enforces ease factor floor of 1.3', () => {
    let state: Partial<UserVocabularyItem> = {
      current_interval: 1,
      ease_factor: 1.35,
      review_count: 5,
      incorrect_count: 4,
    };
    // "Again" drops by 0.2, should clamp to 1.3 minimum
    const result = calculateSrsReview(state, 'again');
    expect(result.easeFactor).toBe(1.3);
  });

  it('accurately identifies overdue reviews', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    expect(isWordDueForReview(yesterday)).toBe(true);
    expect(isWordDueForReview(tomorrow)).toBe(false);
    expect(isWordDueForReview(null)).toBe(false);
  });

  it('formats human-friendly interval descriptions', () => {
    expect(getIntervalDescription(1)).toBe('1 day');
    expect(getIntervalDescription(5)).toBe('5 days');
    expect(getIntervalDescription(14)).toBe('2 weeks');
    expect(getIntervalDescription(60)).toBe('2 months');
  });
});

describe('Vocabulary Quiz Generation', () => {
  it('generates 10 questions with valid question structures', async () => {
    const quiz = await VocabularyService.generateQuiz({ count: 10 });
    expect(quiz).toHaveLength(10);

    for (const q of quiz) {
      expect(q.id).toBeDefined();
      expect(q.prompt.trim().length).toBeGreaterThan(0);
      expect(q.options).toHaveLength(4);
      expect(['A', 'B', 'C', 'D']).toContain(q.correct_option_id);
      expect(q.explanation.trim().length).toBeGreaterThan(0);
      expect(q.target_word.trim().length).toBeGreaterThan(0);
    }
  });

  it('respects CEFR level filters when generating quizzes', async () => {
    const b2Quiz = await VocabularyService.generateQuiz({ count: 5, cefr: 'B2' });
    expect(b2Quiz).toHaveLength(5);
    for (const q of b2Quiz) {
      expect(q.cefr_level).toBe('B2');
    }

    const c2Quiz = await VocabularyService.generateQuiz({ count: 5, cefr: 'C2' });
    expect(c2Quiz).toHaveLength(5);
    for (const q of c2Quiz) {
      expect(q.cefr_level).toBe('C2');
    }
  });

  it('can generate specific question types on demand', async () => {
    const qTypes: QuizExerciseType[] = [
      'definition',
      'synonym',
      'antonym',
      'fill_blank',
      'sentence_completion',
      'sat_context',
    ];

    for (const qType of qTypes) {
      const quiz = await VocabularyService.generateQuiz({ count: 2, exerciseType: qType });
      expect(quiz).toHaveLength(2);
      expect(quiz[0].exercise_type).toBe(qType);
      expect(quiz[1].exercise_type).toBe(qType);
    }
  });
});

describe('Word of the Day and Determinism', () => {
  it('returns the same word of the day on repeated calls on the same day', async () => {
    const w1 = VocabularyService.getWordOfTheDay();
    const w2 = VocabularyService.getWordOfTheDay();

    expect(w1).toBeDefined();
    expect(w2).toBeDefined();
    expect(w1.id).toBe(w2.id);
    expect(w1.word).toBe(w2.word);
    expect(['C1', 'C2']).toContain(w1.cefr_level);
  });
});
