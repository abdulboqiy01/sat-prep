import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../src/services/analytics.service';

describe('Study Time & Workload Calculations', () => {
  function calculateWeeklyBudgetHours(daysCount: number, dailyMinutes: number): number {
    return Math.round(((daysCount * dailyMinutes) / 60) * 10) / 10;
  }

  function calculateAvailableWeeks(targetExamDateStr: string | null, referenceDate = new Date()): {
    weeks: number;
    isTimeConstrained: boolean;
  } {
    if (!targetExamDateStr) {
      return { weeks: 12, isTimeConstrained: false };
    }

    const examDate = new Date(targetExamDateStr);
    const diffTime = examDate.getTime() - referenceDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { weeks: 2, isTimeConstrained: true };
    }

    const weeks = Math.max(1, Math.min(52, Math.floor(diffDays / 7)));
    return {
      weeks,
      isTimeConstrained: weeks < 4,
    };
  }

  it('correctly calculates weekly study budget in hours', () => {
    // 3 days * 30 mins = 90 mins = 1.5 hours
    expect(calculateWeeklyBudgetHours(3, 30)).toBe(1.5);
    // 5 days * 45 mins = 225 mins = 3.8 hours
    expect(calculateWeeklyBudgetHours(5, 45)).toBe(3.8);
    // 6 days * 60 mins = 360 mins = 6.0 hours
    expect(calculateWeeklyBudgetHours(6, 60)).toBe(6.0);
  });

  it('calculates available weeks and flags tight deadlines', () => {
    const today = new Date('2026-11-01T00:00:00Z');

    // 14 days away -> 2 weeks (time constrained)
    const twoWeeksAway = '2026-11-15';
    const res1 = calculateAvailableWeeks(twoWeeksAway, today);
    expect(res1.weeks).toBe(2);
    expect(res1.isTimeConstrained).toBe(true);

    // 70 days away -> 10 weeks (not time constrained)
    const tenWeeksAway = '2027-01-10';
    const res2 = calculateAvailableWeeks(tenWeeksAway, today);
    expect(res2.weeks).toBe(10);
    expect(res2.isTimeConstrained).toBe(false);

    // No exam date -> flexible default 12 weeks
    const res3 = calculateAvailableWeeks(null, today);
    expect(res3.weeks).toBe(12);
    expect(res3.isTimeConstrained).toBe(false);
  });

  it('accurately computes daily consecutive study streaks', () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    // Consecutive 3 days active
    expect(AnalyticsService.calculateStreak([todayStr, yesterdayStr, twoDaysAgoStr])).toBe(3);

    // Activity yesterday and 2 days ago (streak still active for today)
    expect(AnalyticsService.calculateStreak([yesterdayStr, twoDaysAgoStr])).toBe(2);

    // Broken streak (activity was 5 days ago)
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    expect(AnalyticsService.calculateStreak([fiveDaysAgo.toISOString().split('T')[0]])).toBe(0);

    // Empty activities
    expect(AnalyticsService.calculateStreak([])).toBe(0);
  });
});
