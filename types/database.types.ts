export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppSubject = 'math' | 'reading_writing'
export type LearningPathway = 'foundation' | 'pre_sat' | 'sat_advanced'
export type UserRole = 'student' | 'tutor' | 'admin'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type QuestionType = 'multiple_choice' | 'student_produced_response'
export type AssessmentType = 'diagnostic' | 'practice_test' | 'domain_quiz'
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type RoadmapStatus = 'draft' | 'active' | 'completed' | 'archived'
export type RoadmapItemType = 'lesson' | 'quiz' | 'practice_test' | 'review_session' | 'diagnostic'
export type RoadmapItemStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
export type QuizAttemptStatus = 'in_progress' | 'submitted' | 'abandoned'
export type SessionStatus = 'active' | 'closed' | 'archived'
export type MessageRole = 'user' | 'assistant' | 'system'
export type AiFeature = 'tutor_chat' | 'roadmap_generation' | 'question_explanation' | 'diagnostic_analysis'
export type MasteryLevel = 'novice' | 'developing' | 'proficient' | 'mastered'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          target_score: number | null
          target_math_score: number | null
          target_rw_score: number | null
          target_exam_date: string | null
          starting_level: LearningPathway
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          target_score?: number | null
          target_math_score?: number | null
          target_rw_score?: number | null
          target_exam_date?: string | null
          starting_level?: LearningPathway
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          target_score?: number | null
          target_math_score?: number | null
          target_rw_score?: number | null
          target_exam_date?: string | null
          starting_level?: LearningPathway
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_preferences: {
        Row: {
          id: string
          user_id: string
          weekly_study_hours_budget: number
          preferred_study_days: string[]
          reminder_notifications: boolean
          email_notifications: boolean
          theme: 'light' | 'dark' | 'system'
          preferred_pathway: LearningPathway
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weekly_study_hours_budget?: number
          preferred_study_days?: string[]
          reminder_notifications?: boolean
          email_notifications?: boolean
          theme?: 'light' | 'dark' | 'system'
          preferred_pathway?: LearningPathway
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weekly_study_hours_budget?: number
          preferred_study_days?: string[]
          reminder_notifications?: boolean
          email_notifications?: boolean
          theme?: 'light' | 'dark' | 'system'
          preferred_pathway?: LearningPathway
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          parent_id: string | null
          code: string
          subject: AppSubject
          domain: string
          name: string
          description: string | null
          pathway: LearningPathway
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          code: string
          subject: AppSubject
          domain: string
          name: string
          description?: string | null
          pathway?: LearningPathway
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          code?: string
          subject?: AppSubject
          domain?: string
          name?: string
          description?: string | null
          pathway?: LearningPathway
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_modules: {
        Row: {
          id: string
          subject: AppSubject
          pathway: LearningPathway
          title: string
          slug: string
          description: string | null
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: AppSubject
          pathway: LearningPathway
          title: string
          slug: string
          description?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: AppSubject
          pathway?: LearningPathway
          title?: string
          slug?: string
          description?: string | null
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          module_id: string | null
          skill_id: string
          subject: AppSubject
          pathway: LearningPathway
          title: string
          slug: string
          summary: string | null
          content: Json
          estimated_duration_minutes: number
          difficulty: DifficultyLevel
          order_index: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id?: string | null
          skill_id: string
          subject: AppSubject
          pathway: LearningPathway
          title: string
          slug: string
          summary?: string | null
          content?: Json
          estimated_duration_minutes: number
          difficulty?: DifficultyLevel
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string | null
          skill_id?: string
          subject?: AppSubject
          pathway?: LearningPathway
          title?: string
          slug?: string
          summary?: string | null
          content?: Json
          estimated_duration_minutes?: number
          difficulty?: DifficultyLevel
          order_index?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          skill_id: string
          lesson_id: string | null
          subject: AppSubject
          pathway: LearningPathway
          difficulty: DifficultyLevel
          question_type: QuestionType
          passage: string | null
          prompt: string
          options: Json
          correct_answer: string
          explanation: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          skill_id: string
          lesson_id?: string | null
          subject: AppSubject
          pathway?: LearningPathway
          difficulty?: DifficultyLevel
          question_type?: QuestionType
          passage?: string | null
          prompt: string
          options?: Json
          correct_answer: string
          explanation: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          skill_id?: string
          lesson_id?: string | null
          subject?: AppSubject
          pathway?: LearningPathway
          difficulty?: DifficultyLevel
          question_type?: QuestionType
          passage?: string | null
          prompt?: string
          options?: Json
          correct_answer?: string
          explanation?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string | null
          skill_id: string
          subject: AppSubject
          pathway: LearningPathway
          title: string
          description: string | null
          passing_score_percent: number
          time_limit_minutes: number | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          skill_id: string
          subject: AppSubject
          pathway?: LearningPathway
          title: string
          description?: string | null
          passing_score_percent?: number
          time_limit_minutes?: number | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          skill_id?: string
          subject?: AppSubject
          pathway?: LearningPathway
          title?: string
          description?: string | null
          passing_score_percent?: number
          time_limit_minutes?: number | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question_id: string
          order_index: number
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question_id: string
          order_index?: number
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question_id?: string
          order_index?: number
          points?: number
          created_at?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          title: string
          assessment_type: AssessmentType
          subject: AppSubject | null
          pathway: LearningPathway | null
          status: AssessmentStatus
          total_questions: number
          answered_questions: number
          total_score: number | null
          math_score: number | null
          rw_score: number | null
          time_spent_seconds: number
          diagnostic_results: Json
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          assessment_type?: AssessmentType
          subject?: AppSubject | null
          pathway?: LearningPathway | null
          status?: AssessmentStatus
          total_questions?: number
          answered_questions?: number
          total_score?: number | null
          math_score?: number | null
          rw_score?: number | null
          time_spent_seconds?: number
          diagnostic_results?: Json
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          assessment_type?: AssessmentType
          subject?: AppSubject | null
          pathway?: LearningPathway | null
          status?: AssessmentStatus
          total_questions?: number
          answered_questions?: number
          total_score?: number | null
          math_score?: number | null
          rw_score?: number | null
          time_spent_seconds?: number
          diagnostic_results?: Json
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_answers: {
        Row: {
          id: string
          assessment_id: string
          question_id: string
          user_answer: string | null
          is_correct: boolean | null
          time_spent_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          question_id: string
          user_answer?: string | null
          is_correct?: boolean | null
          time_spent_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          question_id?: string
          user_answer?: string | null
          is_correct?: boolean | null
          time_spent_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          status: ProgressStatus
          progress_percent: number
          last_step_index: number
          time_spent_seconds: number
          notes: string | null
          started_at: string
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          status?: ProgressStatus
          progress_percent?: number
          last_step_index?: number
          time_spent_seconds?: number
          notes?: string | null
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          status?: ProgressStatus
          progress_percent?: number
          last_step_index?: number
          time_spent_seconds?: number
          notes?: string | null
          started_at?: string
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_skill_mastery: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          mastery_level: MasteryLevel
          mastery_score: number
          questions_attempted: number
          questions_correct: number
          last_practiced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          mastery_level?: MasteryLevel
          mastery_score?: number
          questions_attempted?: number
          questions_correct?: number
          last_practiced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          mastery_level?: MasteryLevel
          mastery_score?: number
          questions_attempted?: number
          questions_correct?: number
          last_practiced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          reference_id: string | null
          duration_seconds: number
          activity_date: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          reference_id?: string | null
          duration_seconds?: number
          activity_date?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          reference_id?: string | null
          duration_seconds?: number
          activity_date?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          id: string
          user_id: string
          version: number
          title: string
          subject: AppSubject | null
          pathway: LearningPathway
          status: RoadmapStatus
          is_active: boolean
          generation_metadata: Json
          start_date: string
          target_exam_date: string | null
          weekly_study_budget_hours: number
          total_items: number
          completed_items: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          version?: number
          title: string
          subject?: AppSubject | null
          pathway: LearningPathway
          status?: RoadmapStatus
          is_active?: boolean
          generation_metadata?: Json
          start_date?: string
          target_exam_date?: string | null
          weekly_study_budget_hours?: number
          total_items?: number
          completed_items?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          version?: number
          title?: string
          subject?: AppSubject | null
          pathway?: LearningPathway
          status?: RoadmapStatus
          is_active?: boolean
          generation_metadata?: Json
          start_date?: string
          target_exam_date?: string | null
          weekly_study_budget_hours?: number
          total_items?: number
          completed_items?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          id: string
          roadmap_id: string
          item_type: RoadmapItemType
          lesson_id: string | null
          quiz_id: string | null
          skill_id: string | null
          title: string
          description: string | null
          order_index: number
          estimated_duration_minutes: number
          scheduled_date: string | null
          status: RoadmapItemStatus
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          item_type: RoadmapItemType
          lesson_id?: string | null
          quiz_id?: string | null
          skill_id?: string | null
          title: string
          description?: string | null
          order_index: number
          estimated_duration_minutes: number
          scheduled_date?: string | null
          status?: RoadmapItemStatus
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          item_type?: RoadmapItemType
          lesson_id?: string | null
          quiz_id?: string | null
          skill_id?: string | null
          title?: string
          description?: string | null
          order_index?: number
          estimated_duration_minutes?: number
          scheduled_date?: string | null
          status?: RoadmapItemStatus
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          attempt_number: number
          status: QuizAttemptStatus
          score: number
          max_score: number
          score_percentage: number
          passed: boolean
          started_at: string
          submitted_at: string | null
          time_spent_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id: string
          attempt_number?: number
          status?: QuizAttemptStatus
          score?: number
          max_score?: number
          score_percentage?: number
          passed?: boolean
          started_at?: string
          submitted_at?: string | null
          time_spent_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string
          attempt_number?: number
          status?: QuizAttemptStatus
          score?: number
          max_score?: number
          score_percentage?: number
          passed?: boolean
          started_at?: string
          submitted_at?: string | null
          time_spent_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          user_answer: string | null
          is_correct: boolean | null
          points_awarded: number
          time_spent_seconds: number
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          user_answer?: string | null
          is_correct?: boolean | null
          points_awarded?: number
          time_spent_seconds?: number
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          user_answer?: string | null
          is_correct?: boolean | null
          points_awarded?: number
          time_spent_seconds?: number
          feedback?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tutor_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          subject: AppSubject | null
          context_type: string
          context_id: string | null
          status: SessionStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          subject?: AppSubject | null
          context_type?: string
          context_id?: string | null
          status?: SessionStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          subject?: AppSubject | null
          context_type?: string
          context_id?: string | null
          status?: SessionStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor_messages: {
        Row: {
          id: string
          session_id: string
          sender_role: MessageRole
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender_role: MessageRole
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender_role?: MessageRole
          content?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          feature: AiFeature
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          request_duration_ms: number | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          feature: AiFeature
          model: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          request_duration_ms?: number | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          feature?: AiFeature
          model?: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          request_duration_ms?: number | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      telegram_connections: {
        Row: {
          id: string
          user_id: string
          telegram_chat_id: number
          telegram_username: string | null
          connected_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          telegram_chat_id: number
          telegram_username?: string | null
          connected_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          telegram_chat_id?: number
          telegram_username?: string | null
          connected_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      telegram_link_tokens: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          id: string
          user_id: string
          enabled: boolean
          reminder_time: string
          timezone: string
          study_days: string[]
          reminder_before_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          enabled?: boolean
          reminder_time?: string
          timezone?: string
          study_days?: string[]
          reminder_before_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          enabled?: boolean
          reminder_time?: string
          timezone?: string
          study_days?: string[]
          reminder_before_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          id: string
          user_id: string
          notification_type: string
          scheduled_at: string
          sent_at: string | null
          status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: string
          scheduled_at: string
          sent_at?: string | null
          status: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Functions: {
      submit_quiz_attempt: {
        Args: {
          p_attempt_id: string
          p_answers: Json
        }
        Returns: Json
      }
      submit_assessment: {
        Args: {
          p_assessment_id: string
          p_answers: Json
        }
        Returns: Json
      }
      activate_roadmap: {
        Args: {
          p_roadmap_id: string
        }
        Returns: void
      }
      save_lesson_progress: {
        Args: {
          p_lesson_id: string
          p_status: ProgressStatus
          p_progress_percent: number
          p_last_step_index: number
          p_time_spent_delta_seconds: number
          p_notes?: string
        }
        Returns: Database['public']['Tables']['lesson_progress']['Row']
      }
      log_ai_consumption: {
        Args: {
          p_user_id: string
          p_feature: AiFeature
          p_model: string
          p_prompt_tokens: number
          p_completion_tokens: number
          p_duration_ms?: number
          p_session_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Views: {
      [_ in never]: never
    }
    Enums: {
      app_subject: AppSubject
      learning_pathway: LearningPathway
      user_role: UserRole
      difficulty_level: DifficultyLevel
      question_type: QuestionType
      assessment_type: AssessmentType
      assessment_status: AssessmentStatus
      progress_status: ProgressStatus
      roadmap_status: RoadmapStatus
      roadmap_item_type: RoadmapItemType
      roadmap_item_status: RoadmapItemStatus
      quiz_attempt_status: QuizAttemptStatus
      session_status: SessionStatus
      message_role: MessageRole
      ai_feature: AiFeature
      mastery_level: MasteryLevel
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
