import type { Mood } from "./types";

/** Maps mood and context to original curated affirmation categories. */
export function categoriesFor(mood: Mood, contexts: string[]): string[] {
  const out: string[] = [];
  const map: Record<string, string> = { Academics: "academic", Homesickness: "homesick", Career: "career", Relationships: "self-worth", Finances: "stress", Personal: "compassion" };
  for (const c of contexts) { const v = map[c]; if (v) out.push(v); }
  if (mood === "overwhelmed") out.push("stress", "compassion");
  if (mood === "low") out.push("compassion", "self-worth");
  if (mood === "okay") out.push("motivation");
  if (mood === "good" || mood === "amazing") out.push("gratitude", "motivation");
  return [...new Set(out)];
}

export const EXTRA_JOURNAL_PROMPTS = [
  "Name one tiny thing you did today that future-you will thank you for.",
  "Who made your day a little easier, and how?",
  "What's something you handled better than you would have a year ago?",
  "Describe a moment today when you felt calm, even briefly.",
  "What's one thing you're looking forward to this week?",
  "What would you tell a friend who had the day you had?",
];

export const CRISIS_PATTERN = /\b(suicid|kill myself|end my life|self[- ]?harm|hurt myself|want to die|don'?t want to (be here|live))/i;
