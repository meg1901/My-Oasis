export const MOODS = ["amazing", "good", "okay", "low", "overwhelmed"] as const;
export type Mood = (typeof MOODS)[number];
export const MOOD_LABEL: Record<Mood, string> = { amazing: "Amazing", good: "Good", okay: "Okay", low: "Low", overwhelmed: "Overwhelmed" };
export const MOOD_SCORE: Record<Mood, number> = { amazing: 5, good: 4, okay: 3, low: 2, overwhelmed: 1 };

export const CONTEXTS = ["Academics", "Homesickness", "Relationships", "Career", "Finances", "Personal"] as const;

export const AFFIRMATION_CATEGORIES = [
  { id: "academic", label: "Academic confidence" },
  { id: "self-worth", label: "Self worth" },
  { id: "stress", label: "Stress" },
  { id: "career", label: "Career uncertainty" },
  { id: "homesick", label: "Homesickness" },
  { id: "gratitude", label: "Gratitude" },
  { id: "compassion", label: "Self compassion" },
  { id: "motivation", label: "Motivation" },
] as const;

export const CAMPUSES = ["Tempe", "Downtown Phoenix", "Polytechnic", "West Valley", "Lake Havasu", "ASU Online", "Other"] as const;
export const WELLNESS_GOALS = ["Manage stress", "Sleep better", "Feel more connected", "Build confidence", "Practice gratitude", "Be kinder to myself"] as const;

export const JOURNAL_PROMPTS = [
  "What went well today?",
  "What are you proud of?",
  "What made you smile?",
  "What did you learn?",
  "What are you grateful for?",
] as const;

export interface Profile {
  preferred_name: string | null;
  campus: string | null;
  wellness_goals: string[];
  affirmation_categories: string[];
  onboarded: boolean;
  email?: string;
  age?: number | null;
  gender?: string | null;
  college?: string | null;
  degree_program?: string | null;
  student_level?: string | null;
  academic_year?: string | null;
  avatar?: string | null;
  character_preference?: "male" | "female" | null;
}
export interface MoodEntry { id: string; mood: Mood; contexts: string[]; note: string | null; created_at: string }
export interface JournalEntry { id: string; prompt: string | null; body: string; is_small_win: boolean; created_at: string; updated_at?: string }
export interface SavedAffirmation { id: string; text: string; category: string | null; source: string; created_at: string }
export interface Post { id: string; body: string; heart_count: number; cheer_count: number; is_pass_forward: boolean; created_at: string }
export interface Quote { id: string; text: string; author: string; source: string; year: string | null; license: string }
export interface Affirmation { id: string; category: string; text: string }
