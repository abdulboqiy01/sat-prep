import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { z } from 'npm:zod@3.22.4';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseUserClient, getSupabaseAdminClient } from '../_shared/supabaseClient.ts';
import { GeminiService } from '../_shared/geminiClient.ts';

// Zod Schema for incoming request
const requestSchema = z.object({
  force_regenerate: z.boolean().default(false),
  custom_goal_notes: z.string().max(500).optional(),
});

// Zod Schema for Gemini Structured Output
const geminiRoadmapItemSchema = z.object({
  item_type: z.enum(['lesson', 'quiz', 'practice_test', 'review_session', 'diagnostic']),
  lesson_slug: z.string().optional().nullable(),
  skill_code: z.string().optional().nullable(),
  title: z.string().min(3).max(150),
  description: z.string().max(500).optional(),
  estimated_duration_minutes: z.number().int().min(10).max(180),
  suggested_week_number: z.number().int().min(1).max(52),
  priority: z.enum(['critical_gap', 'reinforcement', 'mastery_challenge', 'review']).default('reinforcement'),
});

const geminiRoadmapSchema = z.object({
  roadmap_title: z.string().min(5).max(150),
  target_pathway: z.enum(['foundation', 'pre_sat', 'sat_advanced']),
  overview_strategy: z.string().min(10).max(1000),
  time_horizon_note: z.string().optional(),
  items: z.array(geminiRoadmapItemSchema).min(3).max(40),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = getSupabaseUserClient(authHeader);
    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = getSupabaseAdminClient();
    const rawBody = await req.json().catch(() => ({}));
    const validatedRequest = requestSchema.safeParse(rawBody);

    if (!validatedRequest.success) {
      return new Response(JSON.stringify({ error: 'Invalid request', details: validatedRequest.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch Profile and Preferences
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, target_score, target_math_score, target_rw_score, target_exam_date, starting_level')
      .eq('id', user.id)
      .single();

    const { data: preferences } = await adminClient
      .from('student_preferences')
      .select('weekly_study_hours_budget, preferred_study_days, preferred_pathway')
      .eq('user_id', user.id)
      .maybeSingle();

    // 2. Fetch Latest Diagnostic Assessment Results
    const { data: latestDiagnostic } = await adminClient
      .from('assessments')
      .select('total_score, math_score, rw_score, diagnostic_results, completed_at')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Fetch Curricular Universe: Published Skills and Lessons
    const { data: publishedLessons } = await adminClient
      .from('lessons')
      .select('id, slug, title, subject, pathway, difficulty, estimated_duration_minutes, skill_id, skills(id, code, name, domain)')
      .eq('is_published', true);

    const { data: publishedQuizzes } = await adminClient
      .from('quizzes')
      .select('id, title, subject, pathway, skill_id, lesson_id')
      .eq('is_published', true);

    if (!publishedLessons || publishedLessons.length === 0) {
      return new Response(JSON.stringify({ error: 'No published curriculum lessons available to assemble roadmap.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build Lookups for Strict Cross-Verification
    const lessonSlugMap = new Map<string, (typeof publishedLessons)[0]>();
    const lessonIdMap = new Map<string, (typeof publishedLessons)[0]>();
    for (const l of publishedLessons) {
      lessonSlugMap.set(l.slug, l);
      lessonIdMap.set(l.id, l);
    }

    // 4. Deterministic Scheduling Arithmetic
    const weeklyHours = preferences?.weekly_study_hours_budget || 5.0;
    const weeklyMinutesBudget = Math.round(weeklyHours * 60);
    const targetExamDateStr = profile?.target_exam_date;
    const resolvedPathway = latestDiagnostic?.diagnostic_results?.recommended_pathway || profile?.starting_level || 'pre_sat';

    let totalWeeksAvailable = 12; // Default flexible horizon
    let isTimeConstrained = false;
    let timeLimitationMessage = '';

    if (targetExamDateStr) {
      const examDate = new Date(targetExamDateStr);
      const today = new Date();
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        totalWeeksAvailable = 2;
        isTimeConstrained = true;
        timeLimitationMessage = 'Target exam date is immediate. High-priority triage plan generated.';
      } else {
        totalWeeksAvailable = Math.max(1, Math.min(52, Math.floor(diffDays / 7)));
        if (totalWeeksAvailable < 4) {
          isTimeConstrained = true;
          timeLimitationMessage = `Exam is in ${diffDays} days (${totalWeeksAvailable} weeks). Core foundational topics prioritized over comprehensive survey.`;
        }
      }
    }

    // 5. Build Compact Curriculum Catalog for Gemini Context
    const lessonCatalog = publishedLessons.map((l) => ({
      slug: l.slug,
      title: l.title,
      subject: l.subject,
      pathway: l.pathway,
      difficulty: l.difficulty,
      minutes: l.estimated_duration_minutes,
      skill_code: (l.skills as any)?.code || '',
      domain: (l.skills as any)?.domain || '',
    }));

    // 6. Gemini Prompt
    const systemPrompt = `You are a Senior SAT Curriculum Architect. Generate a personalized learning roadmap.
CRITICAL INTEGRITY RULES:
1. You MUST ONLY reference lesson slugs from the provided OFFICIAL LESSON CATALOG. DO NOT invent or alter lesson slugs.
2. The student has a STRICT study budget of ${weeklyMinutesBudget} minutes per week across ${totalWeeksAvailable} total weeks.
3. Target Pathway: ${resolvedPathway}.
4. Prioritize documented skill gaps first, followed by reinforcement and timed checkpoints.
5. You MUST return ONLY a valid JSON object matching the requested schema. No markdown formatting, no conversational filler.`;

    const userPrompt = `Student Context:
- Target Score: ${profile?.target_score || 'Not specified'} (Math: ${profile?.target_math_score || '-'}, RW: ${profile?.target_rw_score || '-'})
- Assigned Pathway: ${resolvedPathway}
- Weekly Study Time: ${weeklyHours} hours (${weeklyMinutesBudget} minutes)
- Time Horizon: ${totalWeeksAvailable} weeks ${isTimeConstrained ? `(EXAM DATE CLOSE: ${timeLimitationMessage})` : ''}
- Diagnostic Score: ${latestDiagnostic?.total_score || 'Initial placement'}
- Diagnostic Breakdown: ${JSON.stringify(latestDiagnostic?.diagnostic_results || {})}

OFFICIAL LESSON CATALOG (Choose lessons only from this list):
${JSON.stringify(lessonCatalog, null, 2)}

Return a structured JSON roadmap matching the schema:
{
  "roadmap_title": "string",
  "target_pathway": "${resolvedPathway}",
  "overview_strategy": "string",
  "time_horizon_note": "string",
  "items": [
    {
      "item_type": "lesson | quiz | practice_test | review_session",
      "lesson_slug": "exact-lesson-slug-from-catalog",
      "title": "Item title",
      "description": "Why this item is assigned",
      "estimated_duration_minutes": 25,
      "suggested_week_number": 1,
      "priority": "critical_gap | reinforcement | mastery_challenge | review"
    }
  ]
}`;

    // 7. Request Structured Output from Gemini
    const geminiPayload = await GeminiService.generate(userPrompt, {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      responseMimeType: 'application/json',
    });

    // 8. Validate with Zod
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(geminiPayload.text);
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to parse Gemini output as JSON.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validatedRoadmap = geminiRoadmapSchema.safeParse(parsedJson);
    if (!validatedRoadmap.success) {
      return new Response(
        JSON.stringify({ error: 'Gemini generated schema validation error', details: validatedRoadmap.error.flatten() }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const plan = validatedRoadmap.data;

    // 9. Database-Backed Verification: Verify Every Item Against Catalog
    // Discard or map any item whose lesson slug does not exist in our actual database!
    const verifiedItems: Array<{
      item_type: 'lesson' | 'quiz' | 'practice_test' | 'review_session' | 'diagnostic';
      lesson_id: string | null;
      quiz_id: string | null;
      skill_id: string | null;
      title: string;
      description: string;
      estimated_duration_minutes: number;
      scheduled_date: string | null;
      order_index: number;
    }> = [];

    const todayDate = new Date();
    let currentOrderIndex = 0;

    for (const item of plan.items) {
      let resolvedLessonId: string | null = null;
      let resolvedSkillId: string | null = null;
      let resolvedQuizId: string | null = null;

      if (item.lesson_slug) {
        const foundLesson = lessonSlugMap.get(item.lesson_slug);
        if (foundLesson) {
          resolvedLessonId = foundLesson.id;
          resolvedSkillId = foundLesson.skill_id;
        }
      }

      // If it's a quiz, try to match to a published quiz
      if (item.item_type === 'quiz') {
        const matchingQuiz = publishedQuizzes?.find(
          (q) => (resolvedLessonId && q.lesson_id === resolvedLessonId) || (resolvedSkillId && q.skill_id === resolvedSkillId)
        );
        if (matchingQuiz) {
          resolvedQuizId = matchingQuiz.id;
          resolvedSkillId = matchingQuiz.skill_id;
        }
      }

      // Calculate scheduled date deterministically from week number
      const dayOffset = (item.suggested_week_number - 1) * 7 + (currentOrderIndex % 5);
      const scheduledDate = new Date(todayDate);
      scheduledDate.setDate(todayDate.getDate() + dayOffset);
      const scheduledDateStr = scheduledDate.toISOString().split('T')[0];

      verifiedItems.push({
        item_type: item.item_type,
        lesson_id: resolvedLessonId,
        quiz_id: resolvedQuizId,
        skill_id: resolvedSkillId,
        title: item.title,
        description: item.description || '',
        estimated_duration_minutes: item.estimated_duration_minutes,
        scheduled_date: scheduledDateStr,
        order_index: currentOrderIndex++,
      });
    }

    // 10. Persist to Database Non-Destructively
    // Deactivate previous active roadmaps
    await adminClient
      .from('roadmaps')
      .update({ is_active: false, status: 'archived' })
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Fetch highest version number for student
    const { data: prevRoadmaps } = await adminClient
      .from('roadmaps')
      .select('version')
      .eq('user_id', user.id)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (prevRoadmaps?.[0]?.version || 0) + 1;

    // Insert new active roadmap
    const { data: newRoadmap, error: insertRoadmapError } = await adminClient
      .from('roadmaps')
      .insert({
        user_id: user.id,
        version: nextVersion,
        title: plan.roadmap_title,
        pathway: plan.target_pathway,
        status: 'active',
        is_active: true,
        generation_metadata: {
          strategy: plan.overview_strategy,
          time_limitation_note: timeLimitationMessage || plan.time_horizon_note || null,
          weeks_allocated: totalWeeksAvailable,
          weekly_study_budget_hours: weeklyHours,
          gemini_tokens: geminiPayload.totalTokens,
        },
        start_date: todayDate.toISOString().split('T')[0],
        target_exam_date: targetExamDateStr || null,
        weekly_study_budget_hours: weeklyHours,
        total_items: verifiedItems.length,
        completed_items: 0,
      })
      .select()
      .single();

    if (insertRoadmapError || !newRoadmap) {
      throw new Error(`Failed to insert roadmap: ${insertRoadmapError?.message}`);
    }

    // Insert all verified roadmap items
    const itemsToInsert = verifiedItems.map((item) => ({
      roadmap_id: newRoadmap.id,
      ...item,
    }));

    const { error: insertItemsError } = await adminClient.from('roadmap_items').insert(itemsToInsert);

    if (insertItemsError) {
      throw new Error(`Failed to insert roadmap items: ${insertItemsError.message}`);
    }

    // Log AI Usage into audited ai_usage table
    await adminClient.rpc('log_ai_consumption', {
      p_user_id: user.id,
      p_feature: 'roadmap_generation',
      p_model: geminiPayload.model,
      p_prompt_tokens: geminiPayload.promptTokens,
      p_completion_tokens: geminiPayload.completionTokens,
      p_metadata: { roadmap_id: newRoadmap.id, version: nextVersion },
    });

    return new Response(
      JSON.stringify({
        success: true,
        roadmap: newRoadmap,
        items_count: verifiedItems.length,
        time_limitation: timeLimitationMessage || null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Edge Function error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
