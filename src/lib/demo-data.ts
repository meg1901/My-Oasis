import type { JournalEntry, Mood, MoodEntry, Post, Profile, SavedAffirmation } from "./types";

/** Fictional demo student. All names and events are made up. */
export const DEMO_PROFILE: Profile = {
  preferred_name: "Ansh",
  email: "ansh@asu.edu",
  avatar: "cloud",
  college: "Ira A. Fulton Schools of Engineering",
  degree_program: "Computer Science",
  student_level: "Undergraduate",
  academic_year: "First year",
  campus: "Tempe",
  wellness_goals: ["Manage stress", "Practice gratitude"],
  affirmation_categories: ["academic", "stress", "gratitude"],
  onboarded: true,
};

const WINS: [string, string][] = [
  ["What went well today?", "Finally understood recursion in CSE 110 after office hours. It clicked!"],
  ["What made you smile?", "My roommate left a sticky note on my laptop that said 'you got this'."],
  ["What are you proud of?", "Went to the career fair even though I was nervous and talked to three recruiters."],
  ["What are you grateful for?", "Video call with my little sister. She showed me her science project."],
  ["What did you learn?", "Learned that taking a 10-minute walk before studying actually helps me focus."],
  ["What went well today?", "Turned in my lab report a day early for the first time this semester."],
  ["What made you smile?", "Saw the most incredible pink-and-orange sunset from the parking structure."],
  ["What are you proud of?", "Said no to an extra shift so I could rest. Felt weird but right."],
  ["What are you grateful for?", "My study group. We laughed so hard during the chem review."],
  ["What did you learn?", "Asked my professor for an extension and she was really kind about it."],
  ["What went well today?", "Cooked an actual dinner instead of instant noodles. Small but mighty."],
  ["What are you proud of?", "Got a B+ on the midterm I was really worried about."],
  ["What made you smile?", "A stranger at the MU complimented my Sun Devils hoodie."],
  ["What are you grateful for?", "Mom mailed me a care package with homemade tortillas."],
  ["What went well today?", "Joined the hiking club's sunrise hike up A Mountain."],
];

const MOOD_PATTERN: Mood[] = ["good", "okay", "good", "amazing", "low", "okay", "good", "overwhelmed", "okay", "good", "good", "amazing", "okay", "low", "good", "good", "amazing", "okay", "good", "overwhelmed", "good", "amazing", "good"];
const CTX_PATTERN: string[][] = [["Academics"], [], ["Relationships"], ["Personal"], ["Homesickness"], ["Academics", "Finances"], [], ["Academics"], ["Career"], [], ["Relationships"], ["Personal"]];

function at(base: Date, dayOffset: number, hour: number) {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + dayOffset, hour, (dayOffset * 7) % 60).toISOString();
}

export function buildDemoData(now = new Date()) {
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const daysInPrev = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const moods: MoodEntry[] = [];
  const journal: JournalEntry[] = [];
  let mi = 0;
  for (let d = 0; d < daysInPrev; d++) {
    if (d % 4 === 2 && d !== 2) continue; // skip some days, realistic
    const mood = MOOD_PATTERN[mi % MOOD_PATTERN.length] ?? "okay";
    moods.push({ id: `dm-${d}`, mood, contexts: CTX_PATTERN[mi % CTX_PATTERN.length] ?? [], note: null, created_at: at(prevStart, d, 9 + (d % 10)) });
    mi++;
  }
  WINS.forEach(([prompt, body], i) => {
    const d = Math.min(daysInPrev - 1, i * 2);
    journal.push({ id: `dj-${i}`, prompt, body, is_small_win: true, created_at: at(prevStart, d, 21) });
  });
  // a few entries this month so the dashboard looks lived-in
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const recentMoods: Mood[] = ["good", "okay", "amazing", "good", "low", "good"];
  recentMoods.forEach((mood, i) => {
    if (today.getDate() - (i + 1) < 1) return;
    moods.push({ id: `dr-${i}`, mood, contexts: i % 2 ? ["Academics"] : [], note: null, created_at: at(today, -(i + 1), 10) });
  });
  if (today.getDate() > 1) {
    journal.push({ id: "dj-r1", prompt: "What went well today?", body: "Presented in my UNI class without my voice shaking. Progress!", is_small_win: true, created_at: at(today, -1, 20) });
  }
  if (today.getDate() > 3) {
    journal.push({ id: "dj-r2", prompt: "What made you smile?", body: "Found a quiet corner in Noble Library with a view of the palm trees.", is_small_win: true, created_at: at(today, -3, 19) });
  }
  const saved: SavedAffirmation[] = [
    { id: "ds-1", text: "My worth is not measured by a single grade.", category: "academic", source: "curated", created_at: at(prevStart, 3, 12) },
    { id: "ds-2", text: "I only have to handle this moment, not the whole semester.", category: "stress", source: "curated", created_at: at(prevStart, 9, 12) },
    { id: "ds-3", text: "Missing home means I am connected to people who love me.", category: "homesick", source: "curated", created_at: at(prevStart, 15, 12) },
  ];
  const posts: Post[] = [
    "To whoever is studying at Hayden at 2am: you're doing amazing. Drink some water!",
    "First semester away from home and it's hard. If that's you too, you're not alone. 💛",
    "Bombed a midterm last week, did better on the quiz today. Progress is progress, Sun Devils.",
    "The sunset over Tempe tonight was unreal. Go look up!",
    "Reminder: asking for help is a strength, not a weakness.",
    "Whoever left free snacks in the engineering lounge: you're a hero.",
  ].map((body, i) => ({ id: `dp-${i}`, body, heart_count: 12 - i * 2, cheer_count: 4 - (i % 3), is_pass_forward: i === 4, created_at: at(today, -i, 14) }));
  return { moods, journal, saved, posts };
}
