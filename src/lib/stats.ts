import { MOOD_SCORE, MOODS, type JournalEntry, type Mood, type MoodEntry, type SavedAffirmation } from "./types";

export function isAsuEmail(email: string): boolean {
  return /^[^\s@]+@asu\.edu$/i.test(email.trim());
}

export function dayKey(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

/** Stable index for "of the day" picks. */
export function dailyIndex(length: number, date = new Date(), salt = 0): number {
  if (length <= 0) return 0;
  const k = dayKey(date);
  let h = salt;
  for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % length;
}

export function previousMonth(now = new Date()): { start: Date; end: Date; label: string } {
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end, label: start.toLocaleString("en-US", { month: "long", year: "numeric" }) };
}

const inRange = (iso: string, start: Date, end: Date) => {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
};

export interface MonthStats {
  journalCount: number;
  smallWins: number;
  checkIns: number;
  daysCheckedIn: number;
  moodCounts: Record<Mood, number>;
  topMood: Mood | null;
  topContexts: string[];
  favoriteAffirmations: string[];
  longestStreak: number;
}

export function computeMonthStats(
  moods: MoodEntry[],
  journal: JournalEntry[],
  saved: SavedAffirmation[],
  start: Date,
  end: Date,
): MonthStats {
  const m = moods.filter((x) => inRange(x.created_at, start, end));
  const j = journal.filter((x) => inRange(x.created_at, start, end));
  const moodCounts = Object.fromEntries(MOODS.map((k) => [k, 0])) as Record<Mood, number>;
  const ctx: Record<string, number> = {};
  for (const e of m) {
    moodCounts[e.mood] += 1;
    for (const c of e.contexts) ctx[c] = (ctx[c] ?? 0) + 1;
  }
  let topMood: Mood | null = null;
  for (const k of MOODS) if (moodCounts[k] > 0 && (topMood === null || moodCounts[k] > moodCounts[topMood])) topMood = k;
  const days = new Set(m.map((e) => dayKey(e.created_at)));
  // longest streak of consecutive check in days
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of sorted) {
    const t = new Date(d + "T12:00:00").getTime();
    run = prev !== null && Math.round((t - prev) / 86400000) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }
  return {
    journalCount: j.length,
    smallWins: j.filter((x) => x.is_small_win).length,
    checkIns: m.length,
    daysCheckedIn: days.size,
    moodCounts,
    topMood,
    topContexts: Object.entries(ctx).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k),
    favoriteAffirmations: saved.filter((s) => inRange(s.created_at, start, end)).slice(0, 3).map((s) => s.text),
    longestStreak: longest,
  };
}

/** Average mood score per day for the last 7 days (null when no check in). */
export function weeklySeries(moods: MoodEntry[], now = new Date()) {
  const out: { day: string; label: string; score: number | null }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const k = dayKey(d);
    const es = moods.filter((m) => dayKey(m.created_at) === k);
    const score = es.length ? es.reduce((s, e) => s + MOOD_SCORE[e.mood], 0) / es.length : null;
    out.push({ day: k, label: d.toLocaleDateString("en-US", { weekday: "short" }), score: score === null ? null : Math.round(score * 10) / 10 });
  }
  return out;
}

/** Gentle, non-clinical reflection text. */
export function reflectionSummary(moods: MoodEntry[], now = new Date()): string {
  const weekAgo = now.getTime() - 7 * 86400000;
  const recent = moods.filter((m) => new Date(m.created_at).getTime() >= weekAgo);
  if (recent.length === 0) return "No check ins this week yet. Whenever you're ready, a quick check in is a kind way to notice how you're doing.";
  const counts: Record<string, number> = {};
  const ctx: Record<string, number> = {};
  for (const m of recent) {
    counts[m.mood] = (counts[m.mood] ?? 0) + 1;
    for (const c of m.contexts) ctx[c] = (ctx[c] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as Mood | undefined;
  const topCtx = Object.entries(ctx).sort((a, b) => b[1] - a[1])[0]?.[0];
  const days = new Set(recent.map((m) => dayKey(m.created_at))).size;
  let s = `You checked in on ${days} of the last 7 days. that's real self awareness.`;
  if (top === "amazing" || top === "good") s += " Many of your days felt bright. Notice what helped, so you can return to it.";
  else if (top === "okay") s += " Your week felt mostly steady. Steady counts.";
  else s += " Some days felt heavy. That's human, and you don't have to carry it alone.";
  if (topCtx) s += ` ${topCtx} came up most often.`;
  return s;
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Hello, night owl";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Personalized recap. Uses only real stats and chosen highlights. */
export function templateNarrative(name: string, month: string, s: MonthStats, highlights: string[]): string {
  const parts: string[] = [];
  parts.push(`${name}, in ${month} you showed up for yourself.`);
  if (s.checkIns > 0) parts.push(`You checked in with your feelings ${s.checkIns} time${s.checkIns === 1 ? "" : "s"} across ${s.daysCheckedIn} day${s.daysCheckedIn === 1 ? "" : "s"}.`);
  if (s.smallWins > 0) parts.push(`You celebrated ${s.smallWins} small win${s.smallWins === 1 ? "" : "s"} in your journal.`);
  if (highlights.length > 0) parts.push(`Moments you chose to remember include: "${highlights[0]}"`);
  if (s.checkIns === 0 && s.journalCount === 0) parts.push("It was a quiet month here, and that's okay. OASIS is ready whenever you are.");
  else parts.push("Every check in and every small win is proof that you're paying attention to what matters.");
  return parts.join(" ");
}
