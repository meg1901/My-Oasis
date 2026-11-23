import { describe, expect, it } from "vitest";
import { personalizedAffirmation, contextualPrompt } from "@/lib/personalization";
import { moderateContent } from "@/lib/moderation";
import { DEMO_PROFILE } from "@/lib/demo-data";
import { computeMonthStats, isAsuEmail, templateNarrative, previousMonth } from "@/lib/stats";
import type { JournalEntry, MoodEntry } from "@/lib/types";
import { buildStoryMoments, classifyJournalMoment, MAX_REWIND_MOMENTS, REWIND_TOTAL_MS } from "@/lib/rewind-story";
import { rewindPeriod, selectRewindEntries } from "@/lib/rewind-story";
import { resolveCharacter } from "@/lib/rewind-character";

const start = new Date(2026, 9, 1);
const end = new Date(2026, 10, 1);
const mood = (d: number, m: MoodEntry["mood"] = "good"): MoodEntry => ({ id: String(d), mood: m, contexts: [], note: null, created_at: new Date(2026, 9, d, 10).toISOString() });
const entry = (d: number, body: string): JournalEntry => ({ id: body, prompt: null, body, is_small_win: true, created_at: new Date(2026, 9, d, 20).toISOString() });

describe("ASU email signup", () => {
  it("accepts @asu.edu", () => expect(isAsuEmail("sparky@asu.edu")).toBe(true));
  it("rejects other domains", () => expect(isAsuEmail("sparky@gmail.com")).toBe(false));
  it("rejects lookalike domains", () => expect(isAsuEmail("sparky@asu.edu.evil.com")).toBe(false));
});

describe("Rewind uses only real activity from the previous month", () => {
  it("counts only entries inside the month", () => {
    const outside = { ...mood(1), created_at: new Date(2026, 10, 2).toISOString() };
    const s = computeMonthStats([mood(1), mood(2), mood(2, "low"), outside], [entry(3, "a")], [], start, end);
    expect(s.checkIns).toBe(3);
    expect(s.daysCheckedIn).toBe(2);
    expect(s.journalCount).toBe(1);
    expect(s.longestStreak).toBe(2);
  });
  it("template narrative never mentions highlights the student did not select", () => {
    const s = computeMonthStats([], [entry(3, "secret")], [], start, end);
    expect(templateNarrative("Ansh", "October 2026", s, [])).not.toContain("secret");
  });
});


describe("OASIS contextual personalization", () => {
  it("prioritizes overwhelmed support over an academic context", () => {
    const result = personalizedAffirmation({ name: "Ansh", mood: "overwhelmed", contexts: ["Academics"] });
    expect(result.category).toBe("stress");
  });
  it("selects academic content from Academics", () => expect(personalizedAffirmation({ contexts: ["Academics"] }).category).toBe("academic"));
  it("selects homesick content from Homesickness", () => expect(personalizedAffirmation({ contexts: ["Homesickness"] }).category).toBe("homesick"));
  it("uses the profile name, not a hardcoded demo name", () => expect(personalizedAffirmation({ name: "River" }).text.startsWith("River,")).toBe(true));
  it("uses Ansh only for the fictional demo profile", () => expect(DEMO_PROFILE.preferred_name).toBe("Ansh"));
  it("selects gentler prompts for overwhelmed moods", () => expect(contextualPrompt("overwhelmed")).not.toBe(contextualPrompt("good")));
});
describe("Anonymous community safety", () => {
  it("holds contact information for review", () => expect(moderateContent("Email me at student@asu.edu").status).toBe("pending"));
  it("holds abusive posts for review", () => expect(moderateContent("You are an idiot").status).toBe("pending"));
  it("allows a kind anonymous message", () => expect(moderateContent("You deserve a moment of rest today.").status).toBe("approved"));
});


describe("Animated Rewind story", () => {
  it("maps explicit career fair language to the career scene", () => {
    expect(classifyJournalMoment("I talked to three recruiters at the career fair")).toBe("career");
  });
  it("uses neutral reflection for an unmatched moment", () => {
    expect(classifyJournalMoment("I watered my tiny plant before breakfast")).toBe("reflection");
  });
  it("orders selected moments chronologically without adding achievements", () => {
    const moments = buildStoryMoments([
      { id: "later", text: "Turned in my assignment", createdAt: "2026-10-08T10:00:00Z" },
      { id: "first", text: "Went to the gym", createdAt: "2026-10-02T10:00:00Z" },
    ]);
    expect(moments.map((moment) => moment.id)).toEqual(["first", "later"]);
    expect(moments.map((moment) => moment.activity)).toEqual(["gym", "assignment"]);
  });
  it("limits a film to seven selected moments and a 54 second runtime", () => {
    expect(MAX_REWIND_MOMENTS).toBe(7);
    expect(REWIND_TOTAL_MS).toBe(54000);
  });
});

describe("Monthly availability", () => {
  it("offers October on the first day of November", () => {
    const range = previousMonth(new Date(2026, 10, 1));
    expect(range.start.getMonth()).toBe(9);
    expect(range.end.getMonth()).toBe(10);
    expect(range.start.getDate()).toBe(1);
  });
});

describe("Personal Rewind isolation", () => {
  it("never substitutes fictional data for an empty personal journal", () => {
    expect(selectRewindEntries([], start, end, new Set(["dj-0"]))).toEqual([]);
  });
  it("uses only selected owner entries within the chosen month", () => {
    const own = entry(3, "My own class");
    expect(selectRewindEntries([own, entry(4, "Private unselected")], start, end, new Set([own.id, "dj-0"]))).toEqual([own]);
  });
  it("previews the current month without including previous or future moments", () => {
    const now = new Date(2026, 10, 23, 12);
    const range = rewindPeriod(true, now);
    expect(range.start).toEqual(new Date(2026, 10, 1));
    const current = { ...entry(2, "This month"), created_at: new Date(2026, 10, 2).toISOString() };
    const future = { ...entry(3, "Future"), created_at: new Date(2026, 10, 24).toISOString() };
    expect(selectRewindEntries([entry(1, "Last month"), current, future], range.start, range.end)).toEqual([current]);
  });
});

describe("Rewind character preferences", () => {
  it("matches male profiles to male students", () => expect(resolveCharacter({ gender: "Man" })).toBe("male"));
  it("matches female profiles to female students", () => expect(resolveCharacter({ gender: "Woman" })).toBe("female"));
  it("lets any gender override appearance independently of avatar", () => expect(resolveCharacter({ gender: "Man", character_preference: "female" })).toBe("female"));
  it("lets unspecified users select their character", () => expect(resolveCharacter({ character_preference: "female" })).toBe("female"));
  it("keeps Ansh's demo film male", () => expect(resolveCharacter({ character_preference: "female" }, true)).toBe("male"));
});
