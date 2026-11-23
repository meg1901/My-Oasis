import type { Mood } from "./types";
import { CRISIS_PATTERN } from "./curated";

const LIBRARY: Record<string, string[]> = {
  academic: [
    "One difficult assignment does not define your abilities.",
    "Learning takes practice, not perfection.",
    "Your worth is bigger than a grade.",
  ],
  homesick: [
    "It's okay to miss home while building a new one.",
    "The people who love you are still part of your story.",
    "You can carry home with you and make room for new connections.",
  ],
  career: [
    "Your journey does not have to follow someone else's timeline.",
    "You are allowed to explore before choosing your next step.",
    "Not knowing what comes next does not mean you are behind.",
  ],
  stress: [
    "You don't need to accomplish everything today. One step is enough.",
    "Rest belongs on your list too.",
    "You can begin with the next small, manageable thing.",
  ],
  "self-worth": [
    "You do not have to earn the right to be treated kindly.",
    "You are more than your deadlines.",
    "Your needs deserve space too.",
  ],
  compassion: [
    "You can be a work in progress and still be worthy of care.",
    "A hard day is not a failed day.",
    "You deserve the kindness you give your friends.",
  ],
  gratitude: [
    "Even the smallest steps deserve to be celebrated.",
    "There is room to notice one good thing today.",
    "Small moments of connection matter.",
  ],
  motivation: [
    "Whatever today looks like, there is space for you here.",
    "You can move forward at your own pace.",
    "One small beginning is enough for now.",
  ],
};
const CONTEXT_CATEGORY: Record<string, string> = {
  Academics: "academic",
  Homesickness: "homesick",
  Career: "career",
  Relationships: "self-worth",
  Finances: "stress",
  Personal: "compassion",
};
export function personalizedAffirmation({
  name,
  mood,
  contexts = [],
  category,
  variant = 0,
}: {
  name?: string | null | undefined;
  mood?: Mood | null | undefined;
  contexts?: string[];
  category?: string;
  variant?: number;
}) {
  const selected =
    mood === "overwhelmed"
      ? "stress"
      : (category ??
        CONTEXT_CATEGORY[contexts[0] ?? ""] ??
        (mood === "low"
          ? "compassion"
          : mood === "amazing" || mood === "good"
            ? "gratitude"
            : "motivation"));
  const pool = LIBRARY[selected] ?? LIBRARY["motivation"] ?? [];
  const sentence =
    pool[Math.abs(variant) % Math.max(pool.length, 1)] ?? "One small step is enough.";
  return {
    text: name?.trim()
      ? `${name.trim()}, ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`
      : sentence,
    category: selected,
    source: "curated" as const,
  };
}
export function contextualPrompt(mood?: Mood, variant = 0) {
  const prompts =
    mood === "overwhelmed" || mood === "low"
      ? [
          "What is one thing you can gently set down for tonight?",
          "Who or what helped you through today?",
          "What small act of kindness could you offer yourself?",
        ]
      : [
          "What small moment would you like to remember from today?",
          "What did you try today that felt meaningful?",
          "Who made your day a little brighter?",
        ];
  return prompts[Math.abs(variant) % prompts.length] ?? "What went well today?";
}
export const GUIDE_ACTIONS = [
  {
    pattern: /breath|overwhelm|calm|anxious|stress|panic|relax/i,
    to: "/reset",
    label: "Take a breath",
    text: "Feeling overwhelmed? Let's take a little breather.",
  },
  {
    pattern: /journal|win|proud|grateful|write/i,
    to: "/journal",
    label: "Write a small win",
    text: "Want to celebrate something you accomplished today?",
  },
  {
    pattern: /affirm|confiden|worth|believe/i,
    to: "/affirmations",
    label: "Find an affirmation",
    text: "You deserve words that are kind to you.",
  },
  {
    pattern: /feel|mood|check/i,
    to: "/mood",
    label: "Check in",
    text: "There is space for all of your feelings here.",
  },
  {
    pattern: /wall|community|lonely|alone|connect/i,
    to: "/wall",
    label: "Visit the Wall",
    text: "A little encouragement from a fellow Sun Devil can go a long way.",
  },
  {
    pattern: /rewind|month|recap/i,
    to: "/rewind",
    label: "Watch my Rewind",
    text: "Your monthly Rewind is waiting for you.",
  },
  {
    pattern: /counsel|help|support|resource|therap|tutor|career/i,
    to: "/resources",
    label: "Find campus support",
    text: "You do not have to figure it out alone. ASU support is here for you.",
  },
] as const;
export function companionReply(message: string) {
  if (CRISIS_PATTERN.test(message))
    return {
      to: "/resources",
      label: "Find support now",
      text: "I'm glad you told me. Please call or text 988 for support from a real person now, or contact ASU Counseling Services.",
    };
  return (
    GUIDE_ACTIONS.find((a) => a.pattern.test(message)) ?? {
      to: "/mood",
      label: "Check in with yourself",
      text: "Whatever today looks like, there is space for you here. What would feel helpful right now?",
    }
  );
}
