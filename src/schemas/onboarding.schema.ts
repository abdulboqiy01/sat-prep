import { z } from 'zod';

export const studyDaysEnum = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

export const onboardingPreferencesSchema = z
  .object({
    subjectFocus: z.enum(['math', 'reading_writing', 'both']),
    pathway: z.enum(['foundation', 'pre_sat', 'sat_advanced', 'unknown']),
    dailyStudyMinutes: z
      .number()
      .int()
      .min(15, 'Minimum daily study time is 15 minutes')
      .max(240, 'Maximum realistic daily study time is 240 minutes'),
    preferredStudyDays: z
      .array(studyDaysEnum)
      .min(1, 'Please select at least one study day per week')
      .max(7),
    targetExamDate: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true;
          const date = new Date(val);
          if (isNaN(date.getTime())) return false;
          // Must not be in the past
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          return date >= now;
        },
        { message: 'Target exam date cannot be in the past.' }
      ),
    targetScore: z
      .number()
      .int()
      .min(400, 'SAT minimum score is 400')
      .max(1600, 'SAT maximum score is 1600')
      .optional()
      .nullable(),
    targetMathScore: z
      .number()
      .int()
      .min(200, 'Section minimum score is 200')
      .max(800, 'Section maximum score is 800')
      .optional()
      .nullable(),
    targetRwScore: z
      .number()
      .int()
      .min(200, 'Section minimum score is 200')
      .max(800, 'Section maximum score is 800')
      .optional()
      .nullable(),
    areasOfDifficulty: z.array(z.string().trim()).default([]),
  })
  .refine(
    (data) => {
      if (data.targetScore && data.targetMathScore && data.targetRwScore) {
        return data.targetScore === data.targetMathScore + data.targetRwScore;
      }
      return true;
    },
    {
      message: 'Total target score must equal Math target plus Reading/Writing target.',
      path: ['targetScore'],
    }
  );

export type OnboardingPreferencesInput = z.infer<typeof onboardingPreferencesSchema>;
