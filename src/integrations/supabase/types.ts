export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      affirmations: {
        Row: {
          category: string
          id: string
          text: string
        }
        Insert: {
          category: string
          id?: string
          text: string
        }
        Update: {
          category?: string
          id?: string
          text?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          body: string
          created_at: string
          id: string
          is_small_win: boolean
          prompt: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_small_win?: boolean
          prompt?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_small_win?: boolean
          prompt?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_recaps: {
        Row: {
          created_at: string
          id: string
          month: string
          narrative: string | null
          narrative_source: string | null
          stats: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          narrative?: string | null
          narrative_source?: string | null
          stats?: Json
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          narrative?: string | null
          narrative_source?: string | null
          stats?: Json
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          contexts: string[]
          created_at: string
          id: string
          mood: string
          note: string | null
          user_id: string
        }
        Insert: {
          contexts?: string[]
          created_at?: string
          id?: string
          mood: string
          note?: string | null
          user_id?: string
        }
        Update: {
          contexts?: string[]
          created_at?: string
          id?: string
          mood?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      positivity_posts: {
        Row: {
          author_id: string
          body: string
          cheer_count: number
          created_at: string
          heart_count: number
          id: string
          is_pass_forward: boolean
          moderation_note: string | null
          report_count: number
          status: string
        }
        Insert: {
          author_id: string
          body: string
          cheer_count?: number
          created_at?: string
          heart_count?: number
          id?: string
          is_pass_forward?: boolean
          moderation_note?: string | null
          report_count?: number
          status?: string
        }
        Update: {
          author_id?: string
          body?: string
          cheer_count?: number
          created_at?: string
          heart_count?: number
          id?: string
          is_pass_forward?: boolean
          moderation_note?: string | null
          report_count?: number
          status?: string
        }
        Relationships: []
      }
      post_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "positivity_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_year: string | null
          affirmation_categories: string[]
          age: number | null
          avatar: string | null
          campus: string | null
          character_preference: string | null
          college: string | null
          created_at: string
          degree_program: string | null
          gender: string | null
          id: string
          onboarded: boolean
          preferred_name: string | null
          student_level: string | null
          updated_at: string
          wellness_goals: string[]
        }
        Insert: {
          academic_year?: string | null
          affirmation_categories?: string[]
          age?: number | null
          avatar?: string | null
          campus?: string | null
          character_preference?: string | null
          college?: string | null
          created_at?: string
          degree_program?: string | null
          gender?: string | null
          id: string
          onboarded?: boolean
          preferred_name?: string | null
          student_level?: string | null
          updated_at?: string
          wellness_goals?: string[]
        }
        Update: {
          academic_year?: string | null
          affirmation_categories?: string[]
          age?: number | null
          avatar?: string | null
          campus?: string | null
          character_preference?: string | null
          college?: string | null
          created_at?: string
          degree_program?: string | null
          gender?: string | null
          id?: string
          onboarded?: boolean
          preferred_name?: string | null
          student_level?: string | null
          updated_at?: string
          wellness_goals?: string[]
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string
          id: string
          license: string
          source: string
          text: string
          year: string | null
        }
        Insert: {
          author: string
          id?: string
          license: string
          source: string
          text: string
          year?: string | null
        }
        Update: {
          author?: string
          id?: string
          license?: string
          source?: string
          text?: string
          year?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          post_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "positivity_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_affirmations: {
        Row: {
          category: string | null
          created_at: string
          id: string
          source: string
          text: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          source?: string
          text: string
          user_id?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          source?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      random_positivity: {
        Args: never
        Returns: {
          body: string
          id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
