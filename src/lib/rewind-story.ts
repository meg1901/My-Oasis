import type { JournalEntry } from "./types";
import { previousMonth } from "./stats";

export function rewindPeriod(thisMonth: boolean, now = new Date()) {
  if (!thisMonth) return previousMonth(now);
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end: now, label: start.toLocaleString("en-US", { month: "long", year: "numeric" }) };
}

/** Selection is always intersected with this account's entries and the chosen period. */
export function selectRewindEntries(entries: JournalEntry[], start: Date, end: Date, selected?: Set<string>): JournalEntry[] {
  return entries.filter((entry) => {
    const time = new Date(entry.created_at).getTime();
    return time >= start.getTime() && time < end.getTime() && (!selected || selected.has(entry.id));
  }).sort((a, b) => a.created_at.localeCompare(b.created_at)).slice(0, selected ? MAX_REWIND_MOMENTS : entries.length);
}

export const REWIND_ACTIVITIES = [
  "career",
  "study",
  "assignment",
  "gym",
  "friends",
  "class",
  "breathing",
  "difficult",
  "celebration",
  "reflection",
] as const;

export type RewindActivity = (typeof REWIND_ACTIVITIES)[number];

export interface RewindHighlightInput {
  id: string;
  text: string;
  createdAt: string;
}

export interface RewindMoment extends RewindHighlightInput {
  activity: RewindActivity;
  caption: string;
}

export const MAX_REWIND_MOMENTS = 7;
export const REWIND_TOTAL_MS = 54000;

const RULES: Array<[RewindActivity, RegExp, string]> = [
  ["career", /career fair|recruiter|job fair|internship|interview|networking/i, "You made room for your future."],
  ["gym", /\bgym\b|workout|exercis|weightlift|lifting weights|\bhik(?:e|ed|ing)\b|\brun(?:ning)?\b/i, "You made time to move."],
  ["friends", /friends?|roommate|study group|laughed|sister|brother|family|video call|\bmom\b|\bdad\b|care package/i, "Connection found its way into your month."],
  ["assignment", /assignment|lab report|homework|turned in|submitted|project|essay|\bpaper\b/i, "You followed something through."],
  ["celebration", /\bgot an? [a-f][+-]?\b|\bpassed\b|achiev|celebrat|progress|\bwin\b/i, "A moment worth celebrating."],
  ["study", /stud(?:y|ied|ying)|exam|midterm|quiz|library|office hours|recursion|review|revision/i, "You gave your learning some time."],
  ["breathing", /breath|meditat|\bwalk(?:ed|ing)?\b|\brest(?:ed|ing)?\b|\bpause\b|quiet corner/i, "You found a little room to breathe."],
  ["difficult", /difficult|hard day|rough day|nervous|worried|overwhelmed|bombed|anxious|struggl/i, "Even the heavier days were part of your story."],
  ["class", /\bclass(?:es)?\b|lecture|campus|professor|presented|\buni\b/i, "Another day of showing up on campus."],
];

/** Classify only explicit journal language. Unknown moments use a neutral reflection scene. */
export function classifyJournalMoment(text: string): RewindActivity {
  return RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? "reflection";
}

export function buildStoryMoments(highlights: RewindHighlightInput[]): RewindMoment[] {
  return [...highlights]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((highlight) => {
      const activity = classifyJournalMoment(highlight.text);
      return {
        ...highlight,
        activity,
        caption: RULES.find(([kind]) => kind === activity)?.[2] ?? "A moment you chose to remember.",
      };
    });
}
