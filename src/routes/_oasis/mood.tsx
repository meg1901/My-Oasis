import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Heart } from "lucide-react";
import { useAct, useData } from "@/lib/queries";
import { CONTEXTS, MOODS, MOOD_LABEL, type Mood } from "@/lib/types";
import { dayKey, reflectionSummary, weeklySeries } from "@/lib/stats";

import { personalizedAffirmation } from "@/lib/personalization";
import { MoodFace } from "@/components/oasis/MoodFace";
import { PageHeader, Panel, SourceNote } from "@/components/oasis/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_oasis/mood")({
  validateSearch: z.object({ m: z.enum(MOODS).optional() }),
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "Mood check in. OASIS" }, { name: "description", content: "Check in with yourself and see gentle mood patterns." }, { property: "og:title", content: "Mood check in. OASIS" }, { property: "og:description", content: "Check in with yourself and see gentle mood patterns." }] }),
  component: MoodPage,
});

const SCORE_COLOR = ["", "var(--mood-overwhelmed)", "var(--mood-low)", "var(--mood-okay)", "var(--mood-good)", "var(--mood-amazing)"];

function MoodPage() {
  const search = Route.useSearch();
  const { api, moods, profile } = useData();
  const [mood, setMood] = useState<Mood | null>(search.m ?? null);
  const [ctx, setCtx] = useState<string[]>([]);
  const [result, setResult] = useState<{ text: string; source: "curated" } | null>(null);
  const add = useAct((v: { mood: Mood; contexts: string[] }) => api.addMood(v), ["moods"]);
  const save = useAct((t: string) => api.save({ text: t, category: null, source: "mood" }), ["saved"]);

  async function submit() {
    if (!mood) return;
    try {
      await add.mutateAsync({ mood, contexts: ctx });
      setResult(personalizedAffirmation({ name: profile.data?.preferred_name, mood, contexts: ctx }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your check in");
    }
  }

  const all = moods.data ?? [];
  const week = weeklySeries(all);
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const byDay = new Map<string, Mood>();
  for (const m of [...all].reverse()) byDay.set(dayKey(m.created_at), m.mood);

  return (
    <div>
      <PageHeader eyebrow="Mood check in" title="How are you really feeling today?">There's no wrong answer. Noticing is the first kind thing you can do for yourself.</PageHeader>

      <Panel>
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="r" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <div className="flex justify-center"><MoodFace mood={mood ?? "okay"} size={72} /></div>
              <p className="mt-2 text-muted-foreground">Thanks for checking in. Here's something for you:</p>
              <p className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-snug">{result.text}</p>
              <SourceNote source={result.source} />
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => save.mutate(result.text, { onSuccess: () => toast.success("Saved to favorites") })}><Heart className="size-4" /> Save</Button>
                <Button className="rounded-full" onClick={() => { setResult(null); setMood(null); setCtx([]); }}>Done</Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="f" exit={{ opacity: 0 }}>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:gap-4">
                {MOODS.map((m) => (
                  <Button variant="ghost" key={m} onClick={() => setMood(m)} aria-pressed={mood === m} className={cn("flex flex-col items-center h-auto min-w-0 flex-col gap-2 rounded-2xl border-2 px-1 py-4 transition hover:-translate-y-1 md:p-4", mood === m ? "-translate-y-1 border-navy bg-background shadow-soft" : "border-transparent bg-mist hover:bg-sky/50")}>
                    <MoodFace mood={m} size={84} selected={mood === m} />
                    <span className="text-xs font-bold sm:text-base">{MOOD_LABEL[m]}</span>
                  </Button>
                ))}
              </div>
              <p className="mt-6 font-semibold">What's on your mind? <span className="font-normal text-muted-foreground">(optional)</span></p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CONTEXTS.map((c) => (
                  <Button variant="outline" key={c} onClick={() => setCtx(ctx.includes(c) ? ctx.filter((x) => x !== c) : [...ctx, c])} aria-pressed={ctx.includes(c)} className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", ctx.includes(c) ? "border-teal bg-teal/40" : "border-navy/15 bg-background")}>{c}</Button>
                ))}
              </div>
              <Button disabled={!mood || add.isPending} onClick={submit} size="lg" className="mt-6 rounded-full px-8">{add.isPending ? "Saving…" : "Check in"}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="text-2xl font-semibold">This week</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={week}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v: number) => String(v)} axisLine={false} tickLine={false} width={24} />
                <Tooltip formatter={(v: number) => [v, "Mood score"]} cursor={{ fill: "var(--mist)" }} />
                <Bar dataKey="score" radius={[12, 12, 12, 12]}>
                  {week.map((d) => <Cell key={d.day} fill={SCORE_COLOR[Math.round(d.score ?? 0)] ?? "var(--muted)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 rounded-2xl bg-mist p-4">{reflectionSummary(all)}</p>
        </Panel>
        <Panel>
          <h2 className="text-2xl font-semibold">{now.toLocaleString("en-US", { month: "long" })}</h2>
          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
            {Array.from({ length: first.getDay() }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
              const m = byDay.get(dayKey(d));
              return (
                <div key={i} title={m ? MOOD_LABEL[m] : undefined} className={cn("grid aspect-square place-items-center rounded-xl", m ? "" : "bg-muted/60")} style={m ? { background: `var(--mood-${m})` } : undefined}>
                  <span className="text-foreground">{i + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {MOODS.map((m) => <span key={m} className="inline-flex items-center gap-1"><span className="size-3 rounded-full" style={{ background: `var(--mood-${m})` }} />{MOOD_LABEL[m]}</span>)}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">OASIS helps you notice patterns. It doesn't diagnose anything. If heavy days keep showing up, <a href="/resources" className="underline">ASU support</a> is there for you.</p>
        </Panel>
      </div>
    </div>
  );
}
