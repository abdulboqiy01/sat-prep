// Type definitions for SAT Advanced Vocabulary Learning System

export type CefrLevel = 'B2' | 'C1' | 'C2';

export type VocabLearningStatus = 'new' | 'learning' | 'review_due' | 'mastered';

export type VocabReviewRating = 'again' | 'hard' | 'good' | 'easy';

export type VocabCategory =
  | 'Academic Vocabulary'
  | 'Argumentation and Rhetoric'
  | 'Science and Research'
  | 'Literature and Literary Analysis'
  | 'History and Social Sciences'
  | 'Politics and Society'
  | 'Economics'
  | 'Philosophy'
  | 'Evidence and Reasoning'
  | "Tone and Author's Attitude";

export interface VocabularyWord {
  id: string;
  word: string;
  pronunciation: string;
  part_of_speech: string;
  cefr_level: CefrLevel;
  definition: string;
  simple_explanation: string;
  synonyms: string[];
  antonyms: string[];
  example_sentence: string;
  sat_context_sentence: string;
  category: VocabCategory | string;
  tags: string[];
  audio_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserVocabularyItem {
  id: string;
  user_id: string;
  word_id: string;
  status: VocabLearningStatus;
  is_saved: boolean;
  is_difficult: boolean;
  next_review_at: string;
  last_reviewed_at: string | null;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  ease_factor: number;
  current_interval: number; // in days
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  word?: VocabularyWord;
}

export interface VocabularyReviewLog {
  id: string;
  user_id: string;
  word_id: string;
  rating: VocabReviewRating;
  scheduled_interval: number;
  actual_interval: number;
  ease_factor_before: number;
  ease_factor_after: number;
  reviewed_at: string;
}

export interface VocabularyDailyStats {
  id?: string;
  user_id: string;
  stat_date: string; // YYYY-MM-DD
  new_words_learned: number;
  words_reviewed: number;
  quizzes_taken: number;
  quiz_accuracy: number;
  total_study_seconds: number;
  daily_goal: number;
  goal_completed: boolean;
}

export type QuizExerciseType =
  | 'definition'
  | 'synonym'
  | 'antonym'
  | 'fill_blank'
  | 'sentence_completion'
  | 'matching'
  | 'sat_context';

export interface QuizQuestion {
  id: string;
  exercise_type: QuizExerciseType;
  prompt: string;
  passage?: string | null;
  target_word: string;
  options: Array<{ id: string; text: string }>;
  correct_option_id: string;
  explanation: string;
  cefr_level: CefrLevel;
}

export interface QuizAttemptRecord {
  id?: string;
  user_id: string;
  quiz_type: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  answers: Array<{
    question_id: string;
    target_word: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }>;
  completed_at?: string;
}

export interface VocabularyDashboardStats {
  totalWords: number;
  learnedWords: number;
  wordsInProgress: number;
  wordsToReview: number;
  dailyGoal: number;
  dailyGoalProgress: number;
  currentStreak: number;
  accuracyPercentage: number;
  totalQuizzesTaken: number;
  wordOfTheDay: VocabularyWord;
  weeklyActivity: Array<{
    day: string;
    date: string;
    wordsLearned: number;
    wordsReviewed: number;
  }>;
}

