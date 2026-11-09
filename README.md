# SAT Learning Platform — Full Backend & Database Architecture

This repository contains the complete PostgreSQL database architecture (Phase 1) and full backend & AI integration layer (Phase 2) for an adaptive, personalized SAT preparation platform covering **Math** and **Reading and Writing**.

---

## 1. Architecture Overview

The backend layer is engineered for reliability, data integrity, and strict least-privilege security:
- **Database & Identity**: Supabase PostgreSQL with 20 normalized tables and Supabase Auth.
- **Client Backend Services (`src/services/`)**: Typed, modular TypeScript service classes consuming Supabase Client and protected Edge Functions.
- **Protected Supabase Edge Functions (`supabase/functions/`)**:
  - `generate-roadmap`: Derives student needs, calls Google Gemini API with structured outputs, cross-checks every item against the published curriculum database, deterministically schedules workload, and safely persists versioned roadmaps.
  - `ai-tutor`: Socratic, contextual AI tutor grounded in published lesson materials with daily token limits (50k tokens/day) and rate limiting (10 req/min).
- **Authoritative Grading & Answer Protection**: Questions, correct answers, and scoring formulas cannot be manipulated by client browsers. Formative quizzes and diagnostic tests are scored authoritatively via PostgreSQL `SECURITY DEFINER` stored procedures (`submit_quiz_attempt`, `submit_assessment`).
- **Validation**: Zod validation schemas across every request, response, and Gemini JSON output.
- **Testing**: Comprehensive Vitest test suite covering scoring arithmetic, placement thresholds, study-time arithmetic, roadmap validation, usage limits, and error sanitization.

---

## 2. Relational Schema Architecture

The database architecture consists of **20 normalized tables** organized into five functional layers:

```
+-----------------------------------------------------------------------------------------+
|                                    SUPABASE AUTH                                        |
|                                    (auth.users)                                         |
+--------------------------------------------+--------------------------------------------+
                                             | 1:1
                                             v
+-----------------------------------------------------------------------------------------+
|                                     PROFILES                                            |
|                                (public.profiles)                                        |
+---------------------+----------------------+---------------------+----------------------+
                      |                      |                     |
                      v                      v                     v
            +-------------------+  +-------------------+  +-------------------+
            |STUDENT_PREFERENCES|  |  LESSON_PROGRESS  |  |   STUDY_ACTIVITIES|
            +-------------------+  +---------+---------+  +-------------------+
                                             |
                      +----------------------+----------------------+
                      |                                             |
                      v                                             v
            +-------------------+                         +-------------------+
            |    ASSESSMENTS    |                         |     ROADMAPS      |
            +---------+---------+                         +---------+---------+
                      | 1:N                                         | 1:N
                      v                                             v
            +-------------------+                         +-------------------+
            |ASSESSMENT_ANSWERS |                         |   ROADMAP_ITEMS   |
            +---------+---------+                         +---------+---------+
                      |                                             |
                      | References                                  | References
                      v                                             v
+-----------------------------------------------------------------------------------------+
|                                   CURRICULUM LAYER                                      |
|                                                                                         |
|   +-------------------+       +-------------------+       +-------------------+         |
|   |      SKILLS       |<------|      LESSONS      |<------|  LESSON_MODULES   |         |
|   |  (Parent / Child) |       +---------+---------+       +-------------------+         |
|   +---------+---------+                 |                                               |
|             ^                           v                                               |
|             |                 +-------------------+                                     |
|             +-----------------|      QUIZZES      |                                     |
|                               +---------+---------+                                     |
|                                         | 1:N                                           |
|   +-------------------+                 v                                               |
|   |     QUESTIONS     |<--------+ quiz_questions +                                      |
|   +---------+---------+                                                                 |
+-------------+---------------------------------------------------------------------------+
              |                                         |
              v                                         v
+---------------------------------+   +---------------------------------+
|          QUIZ_ATTEMPTS          |   |          TUTOR_SESSIONS         |
|     (public.quiz_attempts)      |   |     (public.tutor_sessions)     |
+----------------+----------------+   +----------------+----------------+
                 | 1:N                                 | 1:N
                 v                                     v
+---------------------------------+   +---------------------------------+
|          QUIZ_ANSWERS           |   |          TUTOR_MESSAGES         |
+---------------------------------+   +----------------+----------------+
                                                       |
                                                       v
                                      +---------------------------------+
                                      |            AI_USAGE             |
                                      |       (Token Consumption)       |
                                      +---------------------------------+
```

### Table Catalog

| # | Table Name | Description | Key Relationships |
|---|------------|-------------|-------------------|
| 1 | `profiles` | Student and educator profiles linked 1:1 with Supabase Auth | `id -> auth.users.id` |
| 2 | `student_preferences` | Pacing, weekly study hours budget, notification preferences | `user_id -> profiles.id` |
| 3 | `skills` | Hierarchical taxonomy of SAT skills (Math and RW) | `parent_id -> skills.id` |
| 4 | `lesson_modules` | Thematic units grouping lessons by subject and pathway | Relational module container |
| 5 | `lessons` | Structured instructional units with JSONB content blocks | `skill_id -> skills.id`, `module_id -> lesson_modules.id` |
| 6 | `questions` | Question bank with options, correct answer, explanation, passage | `skill_id -> skills.id`, `lesson_id -> lessons.id` |
| 7 | `quizzes` | Formative mini-quizzes assessing lessons or skills | `skill_id -> skills.id`, `lesson_id -> lessons.id` |
| 8 | `quiz_questions` | Junction table mapping questions to quizzes with point weights | `quiz_id -> quizzes.id`, `question_id -> questions.id` |
| 9 | `assessments` | Diagnostic tests and full-length exam attempts | `user_id -> profiles.id` |
| 10 | `assessment_answers` | Granular question-level answers for diagnostics | `assessment_id -> assessments.id`, `question_id -> questions.id` |
| 11 | `lesson_progress` | Resumable student progress through lessons (last step, time) | `user_id -> profiles.id`, `lesson_id -> lessons.id` |
| 12 | `student_skill_mastery` | Rolling mastery score (0-100%) and tiers per skill | `user_id -> profiles.id`, `skill_id -> skills.id` |
| 13 | `study_activities` | Daily activity logs powering streaks and hours tracking | `user_id -> profiles.id` |
| 14 | `roadmaps` | Versioned adaptive learning roadmaps | `user_id -> profiles.id` (Filtered unique active index) |
| 15 | `roadmap_items` | Sequential milestones (lessons, quizzes, reviews) in roadmap | `roadmap_id -> roadmaps.id`, `lesson_id -> lessons.id`, `quiz_id -> quizzes.id` |
| 16 | `quiz_attempts` | Student quiz attempt sessions, score, and pass/fail state | `quiz_id -> quizzes.id`, `user_id -> profiles.id` |
| 17 | `quiz_answers` | Question-level answers and points awarded per attempt | `attempt_id -> quiz_attempts.id`, `question_id -> questions.id` |
| 18 | `tutor_sessions` | AI tutor dialogues tied to specific study contexts | `user_id -> profiles.id` |
| 19 | `tutor_messages` | Message transcripts between student and AI assistant | `session_id -> tutor_sessions.id` |
| 20 | `ai_usage` | Immutable audit ledger of tokens and API calls | `user_id -> profiles.id`, `session_id -> tutor_sessions.id` |

---

## 3. Strongly Typed PostgreSQL Enums

The schema avoids unstructured strings for finite domain states:
- `app_subject`: `'math'`, `'reading_writing'`
- `learning_pathway`: `'foundation'`, `'pre_sat'`, `'sat_advanced'`
- `user_role`: `'student'`, `'tutor'`, `'admin'`
- `difficulty_level`: `'easy'`, `'medium'`, `'hard'`
- `question_type`: `'multiple_choice'`, `'student_produced_response'`
- `assessment_type`: `'diagnostic'`, `'practice_test'`, `'domain_quiz'`
- `assessment_status`: `'not_started'`, `'in_progress'`, `'completed'`, `'abandoned'`
- `progress_status`: `'not_started'`, `'in_progress'`, `'completed'`
- `roadmap_status`: `'draft'`, `'active'`, `'completed'`, `'archived'`
- `roadmap_item_type`: `'lesson'`, `'quiz'`, `'practice_test'`, `'review_session'`, `'diagnostic'`
- `roadmap_item_status`: `'pending'`, `'in_progress'`, `'completed'`, `'skipped'`
- `quiz_attempt_status`: `'in_progress'`, `'submitted'`, `'abandoned'`
- `session_status`: `'active'`, `'closed'`, `'archived'`
- `message_role`: `'user'`, `'assistant'`, `'system'`
- `ai_feature`: `'tutor_chat'`, `'roadmap_generation'`, `'question_explanation'`, `'diagnostic_analysis'`
- `mastery_level`: `'novice'`, `'developing'`, `'proficient'`, `'mastered'`

---

## 4. Security & Row Level Security (RLS)

All 20 tables have Row Level Security enabled. Key security rules:

1. **Curriculum Protection**:
   - `skills`, `lesson_modules`, `lessons`, `questions`, `quizzes`, and `quiz_questions` are `SELECT`-only for standard users where `is_published = true`.
   - Modifying curriculum requires the `admin` role or `service_role`.
2. **Profile Privilege Guard**:
   - The trigger `trg_protect_profile_role` prevents any authenticated non-admin user from escalating their `role` column.
3. **Answer Key Protection**:
   - Scores cannot be submitted directly by client input.
   - Grading is performed authoritatively inside the database via `submit_quiz_attempt()` and `submit_assessment()`.
4. **AI Quota Tampering Protection**:
   - The `ai_usage` table does not expose `INSERT` or `UPDATE` policies to client roles.
   - AI consumption is recorded via `service_role` or the `SECURITY DEFINER` procedure `log_ai_consumption()`.
5. **Private Student Data Isolation**:
   - Every student query is scoped to `auth.uid() = user_id`.
   - Sub-item tables (`assessment_answers`, `roadmap_items`, `quiz_answers`, `tutor_messages`) enforce ownership through existence joins against their user-owned parent records.

---

## 5. Migration Files Structure

Migrations are organized chronologically under `supabase/migrations/`:

```
supabase/migrations/
├── 20261101000001_create_enums_and_extensions.sql       # pgcrypto, uuid-ossp, all 16 domain enums, updated_at helper
├── 20261101000002_create_curriculum_tables.sql           # skills, lesson_modules, lessons, questions, quizzes, quiz_questions
├── 20261101000003_create_user_and_progress_tables.sql     # profiles, student_preferences, assessments, answers, progress, mastery, activities
├── 20261101000004_create_roadmaps_and_quizzes.sql        # roadmaps, roadmap_items, quiz_attempts, quiz_answers
├── 20261101000005_create_tutor_and_ai_usage.sql          # tutor_sessions, tutor_messages, ai_usage audit ledger
├── 20261101000006_create_indexes_and_constraints.sql     # 35+ performance B-tree indexes, check constraints, partial unique active index
├── 20261101000007_create_functions_and_triggers.sql      # handle_new_user, role guard, submit_quiz_attempt, submit_assessment, activate_roadmap
└── 20261101000008_create_row_level_security.sql          # RLS policies across all 20 tables with is_admin() helper
```

### Seed Data

- Located in `supabase/seed.sql`.
- Pre-populates all 8 root domains and 16 child skills across Math and Reading & Writing.
- Pre-populates 6 curricular modules and 6 interactive lessons spanning Foundation, Pre-SAT, and SAT Advanced.
- Pre-populates 8 original SAT-style questions (both Multiple Choice and Student-Produced Response grid-in format) with thorough pedagogical explanations and distractors.
- Pre-populates 4 mini-quizzes with question point weights.
- Contains zero fake student accounts or synthetic progress records.

---

## 6. Local Validation & Verification

Two verification suites validate the schema and seed data:

```powershell
# 1. Structural schema verification (table counts, column types, FKs, RLS coverage)
python scripts/validate_schema.py

# 2. Seed data referential integrity (verifies every UUID, parent_id, module_id, skill_id, quiz_id)
python scripts/validate_seed.py

# Or via npm
npm run validate
```

Validation output verifies:
- `16/16` custom enums parsed.
- `20/20` tables parsed and validated.
- `20/20` tables confirmed with active Row Level Security.
- `30/30` foreign key constraints verified with zero dangling references.
- `55` deterministic seed UUIDs verified across skills, modules, lessons, questions, quizzes, and mappings.

---

## 7. Supabase CLI Setup & Deployment Commands

### Prerequisites
- Node.js (v18+)
- Supabase CLI (`npx supabase` or global install)

### Applying to a Remote Supabase Project

1. **Log in to Supabase CLI**:
   ```bash
   npx supabase login
   ```

2. **Link to your Supabase Project**:
   ```bash
   npx supabase link --project-ref <your-supabase-project-id>
   ```

3. **Push all migrations to your remote database**:
   ```bash
   npx supabase db push
   ```

4. **Seed the curriculum data**:
   ```bash
   # Option A: Via Supabase CLI db reset (resets and runs seed.sql)
   npx supabase db reset --linked

   # Option B: Run seed script directly against project connection string
   npx supabase db query --file supabase/seed.sql --linked
   ```

5. **Generate TypeScript types**:
   ```bash
   npx supabase gen types typescript --linked > types/database.types.ts
   ```

### Local Development (with Docker installed)

```bash
# Start local containers
npx supabase start

# Apply migrations and seed
npx supabase db reset

# Generate local TypeScript types
npx supabase gen types typescript --local > types/database.types.ts
```

---

## 8. Frontend & Service Integration Guidelines

### Client-Side Supabase Client (Anon Key)
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database.types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Authoritative Scoring Calls (Browser to Database RPC)
```typescript
// Submitting a quiz attempt authoritatively
const { data, error } = await supabase.rpc('submit_quiz_attempt', {
  p_attempt_id: attemptId,
  p_answers: [
    { question_id: '40000000-0000-0000-0000-000000000001', user_answer: 'C', time_spent_seconds: 45 },
    { question_id: '40000000-0000-0000-0000-000000000002', user_answer: '10', time_spent_seconds: 60 }
  ]
})
```

### Server-Side AI Usage Logging (Backend Route / Edge Function)
```typescript
// Executed only in server route with service-role client
await supabaseAdmin.rpc('log_ai_consumption', {
  p_user_id: studentId,
  p_feature: 'tutor_chat',
  p_model: 'gemini-1.5-flash',
  p_prompt_tokens: 350,
  p_completion_tokens: 180,
  p_duration_ms: 1200,
  p_session_id: sessionId
})
```

---

## 9. Backend Services & Edge Functions (Phase 2)

### Client Services Catalog (`src/services/`)

| Service | File | Key Methods |
|---|---|---|
| **AuthService** | `src/services/auth.service.ts` | `signUp`, `login`, `logout`, `getSession`, `getCurrentUser`, `requestPasswordReset`, `updateProfile` |
| **OnboardingService** | `src/services/onboarding.service.ts` | `completeOnboarding`, `getPreferences` (weekly budget, exam date, pathway) |
| **AssessmentService** | `src/services/assessment.service.ts` | `startDiagnosticSession` (masks answer keys), `submitAssessment`, `evaluateAssessmentResults` (placement confidence) |
| **RoadmapService** | `src/services/roadmap.service.ts` | `generateRoadmap` (invokes edge function), `getActiveRoadmap`, `getRoadmapHistory`, `updateItemStatus` |
| **TutorService** | `src/services/tutor.service.ts` | `sendMessage` (invokes edge function), `getSessions`, `getSessionMessages`, `closeSession` |
| **CurriculumService** | `src/services/curriculum.service.ts` | `getSkills`, `getModules`, `getLessons`, `getLessonBySlug`, `saveLessonProgress` |
| **QuizService** | `src/services/quiz.service.ts` | `getQuizzes`, `getQuizForTaking`, `startAttempt`, `submitAttempt`, `getAttemptReview`, `getNextRecommendedActivity` |
| **AnalyticsService** | `src/services/analytics.service.ts` | `getSummary`, `calculateStreak`, `getWeeklyStudyMinutes`, `getSkillsNeedingRevision` |

### Supabase Edge Functions (`supabase/functions/`)

1. **`generate-roadmap`** (`supabase/functions/generate-roadmap/index.ts`):
   - Authenticates request from JWT.
   - Loads student profile, target score, study hours budget, and latest diagnostic placement.
   - Calculates available weeks and flags time-constrained situations (<4 weeks to exam).
   - Prompts Gemini with official lesson catalog and requests structured JSON matching Zod schema.
   - Cross-checks every suggested lesson slug against the database to eliminate hallucinated IDs.
   - Safely archives existing active roadmaps and persists the new version with scheduled dates.
2. **`ai-tutor`** (`supabase/functions/ai-tutor/index.ts`):
   - Authenticates request from JWT.
   - Rate limiting: enforces max 10 requests/minute.
   - Quota check: enforces max 50,000 tokens/day per student using `ai_usage` ledger.
   - Grounding: pulls active lesson/question context and last 8 conversation turns.
   - System Prompt: Socratic guidance (hints before answers), step-by-step algebra, no College Board claims, prompt-injection defense.
   - Logs AI consumption via `log_ai_consumption` RPC.

### Running Backend Tests

```bash
# Run all Vitest unit and integration test suites
npm test

# Run database schema & seed integrity validators
npm run validate
```

