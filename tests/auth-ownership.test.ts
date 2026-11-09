import { describe, it, expect } from 'vitest';
import { signUpSchema } from '../src/schemas/auth.schema';
import { onboardingPreferencesSchema } from '../src/schemas/onboarding.schema';
import { sanitizeError, AuthenticationError } from '../src/lib/errors';

describe('Auth Ownership, Input Validation & Error Sanitization', () => {
  it('validates compliant registration credentials', () => {
    const valid = {
      email: 'student@example.com',
      password: 'SecurePassword1',
      fullName: 'John Doe',
    };
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects passwords lacking digits or uppercase letters', () => {
    const noDigits = {
      email: 'student@example.com',
      password: 'OnlyLettersPassword',
      fullName: 'John Doe',
    };
    expect(signUpSchema.safeParse(noDigits).success).toBe(false);

    const noUpper = {
      email: 'student@example.com',
      password: 'lowercase12345',
      fullName: 'John Doe',
    };
    expect(signUpSchema.safeParse(noUpper).success).toBe(false);
  });

  it('enforces that targetScore matches the sum of targetMathScore and targetRwScore', () => {
    const validScores = {
      subjectFocus: 'both' as const,
      pathway: 'pre_sat' as const,
      dailyStudyMinutes: 45,
      preferredStudyDays: ['monday' as const, 'wednesday' as const, 'saturday' as const],
      targetScore: 1350,
      targetMathScore: 700,
      targetRwScore: 650,
      areasOfDifficulty: [],
    };
    expect(onboardingPreferencesSchema.safeParse(validScores).success).toBe(true);

    const mismatchedScores = {
      ...validScores,
      targetScore: 1400, // 700 + 650 = 1350 != 1400!
    };
    expect(onboardingPreferencesSchema.safeParse(mismatchedScores).success).toBe(false);
  });

  it('sanitizes internal errors so database details and stacks do not leak', () => {
    const rawPgError = new Error('violates row-level security policy for table "questions"');
    const sanitized = sanitizeError(rawPgError);
    expect(sanitized.statusCode).toBe(403);
    expect(sanitized.code).toBe('RLS_VIOLATION');
    expect(sanitized.error).not.toContain('table "questions"');

    const authError = new AuthenticationError();
    const sanitizedAuth = sanitizeError(authError);
    expect(sanitizedAuth.statusCode).toBe(401);
    expect(sanitizedAuth.code).toBe('AUTHENTICATION_REQUIRED');
  });
});
