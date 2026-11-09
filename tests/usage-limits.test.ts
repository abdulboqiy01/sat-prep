import { describe, it, expect } from 'vitest';

describe('AI Usage Rate Limiting & Quota Enforcement', () => {
  const MAX_PER_MINUTE = 10;
  const DAILY_TOKEN_LIMIT = 50000;

  function checkRateLimit(requestTimestamps: number[], currentTime: number): {
    allowed: boolean;
    remaining: number;
  } {
    const oneMinuteAgo = currentTime - 60 * 1000;
    const recentRequests = requestTimestamps.filter((t) => t >= oneMinuteAgo);
    const allowed = recentRequests.length < MAX_PER_MINUTE;
    return {
      allowed,
      remaining: Math.max(0, MAX_PER_MINUTE - recentRequests.length),
    };
  }

  function checkDailyTokenQuota(consumedTokensToday: number, requestedPromptTokens: number): {
    allowed: boolean;
    remainingTokens: number;
  } {
    const projectedTotal = consumedTokensToday + requestedPromptTokens;
    const allowed = projectedTotal <= DAILY_TOKEN_LIMIT;
    return {
      allowed,
      remainingTokens: Math.max(0, DAILY_TOKEN_LIMIT - consumedTokensToday),
    };
  }

  it('allows requests within the 10 requests/minute threshold', () => {
    const now = Date.now();
    const timestamps = [now - 30000, now - 20000, now - 10000]; // 3 requests in last 30s

    const status = checkRateLimit(timestamps, now);
    expect(status.allowed).toBe(true);
    expect(status.remaining).toBe(7);
  });

  it('blocks requests when 10 requests/minute limit is exceeded', () => {
    const now = Date.now();
    // 10 requests within the last 40 seconds
    const timestamps = Array.from({ length: 10 }, (_, i) => now - i * 4000);

    const status = checkRateLimit(timestamps, now);
    expect(status.allowed).toBe(false);
    expect(status.remaining).toBe(0);
  });

  it('enforces the 50,000 daily token quota', () => {
    expect(checkDailyTokenQuota(45000, 1000).allowed).toBe(true);
    expect(checkDailyTokenQuota(49500, 400).allowed).toBe(true);
    // Exceeding 50k
    expect(checkDailyTokenQuota(49900, 500).allowed).toBe(false);
    expect(checkDailyTokenQuota(50000, 50).allowed).toBe(false);
  });
});
