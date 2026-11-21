import type {
  VocabReviewRating,
  VocabLearningStatus,
  UserVocabularyItem,
} from '../types/vocabulary.types';

export interface SrsCalculationResult {
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  status: VocabLearningStatus;
  isDifficult: boolean;
}

/**
 * Calculates updated SM-2 Spaced Repetition parameters for a vocabulary word.
 */
export function calculateSrsReview(
  current: Partial<UserVocabularyItem>,
  rating: VocabReviewRating,
  _userTimezone = 'UTC'
): SrsCalculationResult {
  const currentInterval = current.current_interval ?? 0;
  const currentEase = current.ease_factor ?? 2.5;
  const reviewCount = (current.review_count ?? 0) + 1;
  let correctCount = current.correct_count ?? 0;
  let incorrectCount = current.incorrect_count ?? 0;
  let newEase = currentEase;
  let newInterval = 1;
  let isDifficult = current.is_difficult ?? false;
  let status: VocabLearningStatus = 'learning';

  const now = new Date();

  switch (rating) {
    case 'again': {
      incorrectCount += 1;
      newEase = Math.max(1.3, Number((currentEase - 0.2).toFixed(2)));
      newInterval = 0; // immediate/same day
      isDifficult = true;
      status = 'learning';
      // Review again in 15 minutes today
      const retryDate = new Date(now.getTime() + 15 * 60 * 1000);
      return {
        nextReviewAt: retryDate.toISOString(),
        intervalDays: 0,
        easeFactor: newEase,
        reviewCount,
        correctCount,
        incorrectCount,
        status,
        isDifficult,
      };
    }

    case 'hard': {
      correctCount += 1;
      newEase = Math.max(1.3, Number((currentEase - 0.15).toFixed(2)));
      newInterval = currentInterval <= 0 ? 1 : Math.max(1, Math.round(currentInterval * 1.2));
      isDifficult = true;
      status = 'learning';
      break;
    }

    case 'good': {
      correctCount += 1;
      if (currentInterval <= 0) {
        newInterval = 1;
      } else if (currentInterval === 1) {
        newInterval = 3;
      } else {
        newInterval = Math.round(currentInterval * currentEase);
      }
      isDifficult = false;
      // Mark as mastered if interval reached 14+ days and answered correctly at least 3 times
      if (newInterval >= 14 && correctCount >= 3) {
        status = 'mastered';
      } else {
        status = 'learning';
      }
      break;
    }

    case 'easy': {
      correctCount += 1;
      newEase = Math.min(2.8, Number((currentEase + 0.15).toFixed(2)));
      if (currentInterval <= 0) {
        newInterval = 3;
      } else {
        newInterval = Math.round(currentInterval * currentEase * 1.3);
      }
      isDifficult = false;
      if (newInterval >= 14 && correctCount >= 2) {
        status = 'mastered';
      } else {
        status = 'learning';
      }
      break;
    }
  }

  // Calculate next review timestamp aligned to student's day
  const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    nextReviewAt: nextDate.toISOString(),
    intervalDays: newInterval,
    easeFactor: newEase,
    reviewCount,
    correctCount,
    incorrectCount,
    status,
    isDifficult,
  };
}

/**
 * Checks if a word is due for SRS review right now.
 */
export function isWordDueForReview(nextReviewAtStr?: string | null): boolean {
  if (!nextReviewAtStr) return false;
  return new Date(nextReviewAtStr).getTime() <= Date.now();
}

/**
 * Returns a human-readable interval description.
 */
export function getIntervalDescription(days: number): string {
  if (days <= 0) return 'Immediate';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'month' : 'months'}`;
}
