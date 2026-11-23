import { supabase } from "@/integrations/supabase/client";
import { buildDemoData, DEMO_PROFILE } from "./demo-data";
import type { Affirmation, JournalEntry, Mood, MoodEntry, Post, Profile, Quote, SavedAffirmation } from "./types";

export type Mode = "live" | "demo";

export interface Api {
  mode: Mode;
  getProfile(): Promise<Profile>;
  updateProfile(p: Partial<Profile>): Promise<void>;
  listMoods(): Promise<MoodEntry[]>;
  addMood(m: { mood: Mood; contexts: string[]; note?: string }): Promise<void>;
  listJournal(): Promise<JournalEntry[]>;
  addJournal(e: { prompt: string | null; body: string }): Promise<void>;
  updateJournal(id: string, body: string): Promise<void>;
  deleteJournal(id: string): Promise<void>;
  listSaved(): Promise<SavedAffirmation[]>;
  save(a: { text: string; category: string | null; source: string }): Promise<void>;
  unsave(text: string): Promise<void>;
  listPosts(): Promise<Post[]>;
  myReactions(): Promise<string[]>; // `${postId}:${kind}`
  react(postId: string, kind: "heart" | "cheer", on: boolean): Promise<void>;
  report(postId: string, reason: string): Promise<void>;
  randomPositivity(): Promise<{ id: string; body: string } | null>;
  saveRecap(month: string, stats: object, narrative: string): Promise<void>;
}

export async function listQuotes(): Promise<Quote[]> {
  const { data } = await supabase.from("quotes").select("*").order("author");
  return data ?? [];
}
export async function listAffirmations(): Promise<Affirmation[]> {
  const { data } = await supabase.from("affirmations").select("*");
  return data ?? [];
}

const must = <T,>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
};

export const liveApi: Api = {
  mode: "live",
  async getProfile() {
    const { data: u } = await supabase.auth.getUser();
    const r = await supabase.from("profiles").select("preferred_name,campus,wellness_goals,affirmation_categories,onboarded,age,gender,college,degree_program,student_level,academic_year,avatar,character_preference").eq("id", u.user?.id ?? "").maybeSingle();
    if (r.error) throw new Error(r.error.message);
    const preference = r.data?.character_preference;
    return { ...(r.data ?? { preferred_name: null, campus: null, wellness_goals: [], affirmation_categories: [], onboarded: false }), character_preference: preference === "male" || preference === "female" ? preference : null, email: u.user?.email ?? '' };
  },
  async updateProfile(p) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Not signed in");
    const { email: _email, ...fields } = p;
    must(await supabase.from("profiles").upsert({ id: u.user.id, ...fields, updated_at: new Date().toISOString() }));
  },
  async listMoods() {
    return must(await supabase.from("mood_entries").select("id,mood,contexts,note,created_at").order("created_at", { ascending: false }).limit(500)) as MoodEntry[];
  },
  async addMood(m) {
    must(await supabase.from("mood_entries").insert({ mood: m.mood, contexts: m.contexts, note: m.note ?? null }));
  },
  async listJournal() {
    return must(await supabase.from("journal_entries").select("id,prompt,body,is_small_win,created_at,updated_at").order("created_at", { ascending: false }).limit(500));
  },
  async addJournal(e) { must(await supabase.from("journal_entries").insert({ prompt: e.prompt, body: e.body })); },
  async updateJournal(id, body) { must(await supabase.from("journal_entries").update({ body, updated_at: new Date().toISOString() }).eq("id", id)); },
  async deleteJournal(id) { must(await supabase.from("journal_entries").delete().eq("id", id)); },
  async listSaved() { return must(await supabase.from("saved_affirmations").select("id,text,category,source,created_at").order("created_at", { ascending: false })); },
  async save(a) { must(await supabase.from("saved_affirmations").upsert({ text: a.text, category: a.category, source: a.source }, { onConflict: "user_id,text", ignoreDuplicates: true })); },
  async unsave(text) { must(await supabase.from("saved_affirmations").delete().eq("text", text)); },
  async listPosts() {
    return must(await supabase.from("positivity_posts").select("id,body,heart_count,cheer_count,is_pass_forward,created_at").order("created_at", { ascending: false }).limit(100));
  },
  async myReactions() {
    const rows = must(await supabase.from("reactions").select("post_id,kind"));
    return rows.map((r) => `${r.post_id}:${r.kind}`);
  },
  async react(postId, kind, on) {
    if (on) must(await supabase.from("reactions").insert({ post_id: postId, kind }));
    else must(await supabase.from("reactions").delete().eq("post_id", postId).eq("kind", kind));
  },
  async report(postId, reason) {
    const r = await supabase.from("post_reports").insert({ post_id: postId, reason });
    if (r.error && !r.error.message.includes("duplicate")) throw new Error(r.error.message);
  },
  async saveRecap(month, stats, narrative) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('Please sign in');
    must(await supabase.from('monthly_recaps').upsert({ user_id: data.user.id, month, stats: JSON.parse(JSON.stringify(stats)), narrative, narrative_source: 'template' }, { onConflict: 'user_id,month' }));
  },
  async randomPositivity() {
    const { data } = await supabase.rpc("random_positivity");
    return data?.[0] ?? null;
  },
};

// ---------- Demo (in-memory, fictional) ----------
let store: (ReturnType<typeof buildDemoData> & { profile: Profile; reactions: Set<string> }) | null = null;
const S = () => (store ??= { ...buildDemoData(), profile: { ...DEMO_PROFILE }, reactions: new Set() });
let n = 0;
const nid = () => `demo-${Date.now()}-${n++}`;
const sortDesc = <T extends { created_at: string }>(a: T[]) => [...a].sort((x, y) => y.created_at.localeCompare(x.created_at));

export const demoApi: Api = {
  mode: "demo",
  async getProfile() { return { ...S().profile }; },
  async saveRecap() {},
  async updateProfile(p) { Object.assign(S().profile, p); },
  async listMoods() { return sortDesc(S().moods); },
  async addMood(m) { S().moods.push({ id: nid(), mood: m.mood, contexts: m.contexts, note: m.note ?? null, created_at: new Date().toISOString() }); },
  async listJournal() { return sortDesc(S().journal); },
  async addJournal(e) { S().journal.push({ id: nid(), prompt: e.prompt, body: e.body, is_small_win: true, created_at: new Date().toISOString() }); },
  async updateJournal(id, body) { const e = S().journal.find((x) => x.id === id); if (e) e.body = body; },
  async deleteJournal(id) { S().journal = S().journal.filter((x) => x.id !== id); },
  async listSaved() { return sortDesc(S().saved); },
  async save(a) { if (!S().saved.some((s) => s.text === a.text)) S().saved.push({ id: nid(), ...a, created_at: new Date().toISOString() }); },
  async unsave(text) { S().saved = S().saved.filter((s) => s.text !== text); },
  async listPosts() { return sortDesc(S().posts); },
  async myReactions() { return [...S().reactions]; },
  async react(postId, kind, on) {
    const key = `${postId}:${kind}`;
    const p = S().posts.find((x) => x.id === postId);
    if (on) S().reactions.add(key); else S().reactions.delete(key);
    if (p) { const f = kind === "heart" ? "heart_count" : "cheer_count"; p[f] = Math.max(0, p[f] + (on ? 1 : -1)); }
  },
  async report(postId) { S().posts = S().posts.filter((p) => p.id !== postId); },
  async randomPositivity() {
    const ps = S().posts;
    const p = ps[Math.floor(Math.random() * ps.length)];
    return p ? { id: p.id, body: p.body } : null;
  },
};

export function addDemoPost(body: string, passForward: boolean) {
  S().posts.push({ id: nid(), body, heart_count: 0, cheer_count: 0, is_pass_forward: passForward, created_at: new Date().toISOString() });
}

/** Fictional film data. Call only from demo mode, never as a personal fallback. */
export function demoSnapshot() { const d = buildDemoData(); return { ...d, profile: DEMO_PROFILE }; }
