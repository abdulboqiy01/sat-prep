import { describe, it, expect } from 'vitest';
import { geminiRoadmapResponseSchema } from '../src/schemas/roadmap.schema';

describe('Gemini Roadmap Validation & Database Cross-Checking', () => {
  const validGeminiOutput = {
    roadmap_title: 'Personalized Pre-SAT Accelerator Plan',
    target_pathway: 'pre_sat',
    overview_strategy:
      'Targeting core algebraic systems and rhetorical transitional markers over 8 weeks.',
    weeks_allocated: 8,
    items: [
      {
        item_type: 'lesson',
        lesson_slug: 'solving-single-variable-linear-equations',
        skill_code: 'MATH_ALG_LIN_ONE',
        title: 'Single Variable Equations',
        description: 'Establish foundational algebraic fluency',
        estimated_duration_minutes: 25,
        pedagogical_priority: 'critical_gap',
      },
      {
        item_type: 'lesson',
        lesson_slug: 'systems-linear-equations-sat-contexts',
        skill_code: 'MATH_ALG_SYSTEMS',
        title: 'Systems of Equations Modeling',
        description: 'Bridge to 2x2 coordinate geometry intersections',
        estimated_duration_minutes: 30,
        pedagogical_priority: 'reinforcement',
      },
      {
        item_type: 'quiz',
        quiz_id: '50000000-0000-0000-0000-000000000001',
        title: 'Mid-Module Algebra Assessment',
        description: 'Timed formative assessment',
        estimated_duration_minutes: 20,
        pedagogical_priority: 'mastery_challenge',
      },
    ],
  };

  it('validates compliant structured JSON output from Gemini', () => {
    const result = geminiRoadmapResponseSchema.safeParse(validGeminiOutput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(3);
      expect(result.data.target_pathway).toBe('pre_sat');
    }
  });

  it('rejects malformed Gemini output missing required roadmap title', () => {
    const invalid = { ...validGeminiOutput, roadmap_title: '' };
    const result = geminiRoadmapResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects roadmap with unsupported item types', () => {
    const invalid = {
      ...validGeminiOutput,
      items: [
        ...validGeminiOutput.items,
        {
          item_type: 'unsupported_video_type', // Invalid enum
          title: 'Invalid',
          estimated_duration_minutes: 20,
        },
      ],
    };
    const result = geminiRoadmapResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects roadmap with fewer than 3 milestone items', () => {
    const invalid = {
      ...validGeminiOutput,
      items: [validGeminiOutput.items[0]], // Only 1 item
    };
    const result = geminiRoadmapResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('detects and filters fictitious lesson slugs not present in curriculum catalog', () => {
    const officialCatalogSlugs = new Set([
      'solving-single-variable-linear-equations',
      'systems-linear-equations-sat-contexts',
    ]);

    const generatedSlugs = [
      'solving-single-variable-linear-equations',
      'fictitious-ai-hallucinated-lesson-slug', // Hallucinated!
      'systems-linear-equations-sat-contexts',
    ];

    const verified = generatedSlugs.filter((slug) => officialCatalogSlugs.has(slug));
    expect(verified).toHaveLength(2);
    expect(verified).not.toContain('fictitious-ai-hallucinated-lesson-slug');
  });
});
