import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Film, Lock, Sparkles } from "lucide-react";
import { useData } from "@/lib/queries";
import { demoSnapshot } from "@/lib/api";
import { computeMonthStats, previousMonth, templateNarrative } from "@/lib/stats";
import { MAX_REWIND_MOMENTS, type RewindHighlightInput } from "@/lib/rewind-story";
import { RewindPlayer, type RewindData } from "@/components/oasis/RewindPlayer";
import { PageHeader, Panel } from "@/components/oasis/ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { resolveCharacter } from "@/lib/rewind-character";
import { selectRewindEntries, rewindPeriod } from "@/lib/rewind-story";
import { Stars } from "@/components/brand/Clouds";

export const Route = createFileRoute("/_oasis/rewind")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "Your OASIS Rewind" }, { name: "description", content: "An animated short film made from your real monthly moments." }, { property: "og:title", content: "Your OASIS Rewind" }, { property: "og:description", content: "An animated short film made from your real monthly moments." }] }),
  component: RewindPage,
});

const toMoment = (entry: { id: string; body: string; created_at: string }): RewindHighlightInput => ({ id: entry.id, text: entry.body, createdAt: entry.created_at });
const DEMO_STORY_INDEXES = [0, 2, 5, 7, 8, 11];

function RewindPage() {
  const { api, profile, moods, journal, saved } = useData();
  const [thisMonth, setThisMonth] = useState(false);
  const { start, end, label } = rewindPeriod(thisMonth);
  const name = profile.data?.preferred_name ?? "friend";
  const monthEntries = useMemo(() => selectRewindEntries(journal.data ?? [], start, end), [journal.data, start, end]);
  const stats = useMemo(() => computeMonthStats(moods.data ?? [], journal.data ?? [], saved.data ?? [], start, end), [moods.data, journal.data, saved.data, start, end]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState<RewindData | null>(null);

  const loading = profile.isPending || journal.isPending || moods.isPending || saved.isPending;
  const failed = profile.isError || journal.isError || moods.isError || saved.isError;

  async function createMine() {
    if (loading || failed || selected.size === 0) return;
    setBusy(true);
    try {
      const entries = selectRewindEntries(journal.data ?? [], start, end, selected);
      const moments = entries.map(toMoment);
      const highlights = moments.map((moment) => moment.text);
      const narrative = templateNarrative(name, label, stats, highlights);
      if (!thisMonth) await api.saveRecap(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01`, stats, narrative);
      setPlaying({ name, month: label, stats, highlights, moments, narrative, narrativeSource: "template", isDemo: api.mode === "demo", avatar: profile.data?.avatar ?? "cloud", character: resolveCharacter(profile.data ?? {}, api.mode === "demo") });
    } catch {
      toast.error("Couldn't build your Rewind");
    } finally {
      setBusy(false);
    }
  }

  function previewDemo() {
    if (api.mode !== "demo") return;
    setBusy(true);
    const { start, end, label } = previousMonth();
    const demo = demoSnapshot();
    const demoStats = computeMonthStats(demo.moods, demo.journal, demo.saved, start, end);
    const entries = DEMO_STORY_INDEXES.map((index) => demo.journal[index]).filter((entry) => entry !== undefined);
    const moments = entries.map(toMoment);
    const highlights = moments.map((moment) => moment.text);
    const narrative = templateNarrative("Ansh", label, demoStats, highlights);
    setPlaying({ name: "Ansh", month: label, stats: demoStats, highlights, moments, narrative, narrativeSource: "template", isDemo: true, avatar: "cloud", character: "male" });
    setBusy(false);
  }

  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else if (next.size >= MAX_REWIND_MOMENTS) {
      toast.message(`Your short film fits up to ${MAX_REWIND_MOMENTS} moments. Remove one to choose another.`);
      return current;
    } else next.add(id);
    return next;
  });

  const selectionFull = selected.size >= Math.min(MAX_REWIND_MOMENTS, monthEntries.length) && monthEntries.length > 0;

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-night p-8 text-primary-foreground shadow-soft md:p-12">
        <Stars count={50} />
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-80">Signature animated short film</p>
          <h1 className="mt-2 text-5xl font-semibold md:text-6xl">Your OASIS Rewind</h1>
          <p className="mt-3 max-w-xl text-lg opacity-90">Watch your chosen journal moments become a miniature campus story. Every film is about 54 seconds and uses only your real activity.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={api.mode === "demo" ? previewDemo : createMine} disabled={busy || (api.mode !== "demo" && (loading || failed || selected.size === 0))} className="rounded-full bg-background px-7 text-foreground hover:bg-background/90"><Film className="size-4" /> {api.mode === "demo" ? "Watch Ansh’s Rewind" : "Watch My Rewind"}</Button>
            {api.mode === "live" && <Button size="lg" variant="outline" className="rounded-full bg-background text-foreground" onClick={() => { setThisMonth((current) => !current); setSelected(new Set()); }}>{thisMonth ? "Previous Month" : "Preview This Month"}</Button>}
          </div>
          {api.mode === "demo" ? <p className="mt-2 text-sm opacity-75">Ansh’s fictional film is ready, with six animated memories.</p> : <p className="mt-2 text-sm opacity-75">{thisMonth ? "Your month so far" : "Your previous month"}. Choose your own journal moments below.</p>}
        </div>
      </div>

      <PageHeader eyebrow={label} title="Direct your own film">Choose up to {MAX_REWIND_MOMENTS} journal moments. They appear in date order and stay private.</PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-xl font-semibold"><Lock className="size-4" /> Your {label} entries</h2>
            {monthEntries.length > 0 && <Button variant="ghost" size="sm" className="text-sm font-semibold" onClick={() => setSelected(selectionFull ? new Set() : new Set(monthEntries.slice(0, MAX_REWIND_MOMENTS).map((entry) => entry.id)))}>{selectionFull ? "Clear" : `Select up to ${MAX_REWIND_MOMENTS}`}</Button>}
          </div>
          <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {monthEntries.map((entry) => (
              <li key={entry.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-mist p-3">
                  <Checkbox checked={selected.has(entry.id)} onCheckedChange={() => toggle(entry.id)} className="mt-1" />
                  <span><span className="block text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>{entry.body}</span>
                </label>
              </li>
            ))}
            {loading && <p role="status">Gathering your moments…</p>}
            {failed && <p role="alert">We couldn’t load your moments. Please try again shortly.</p>}
            {!loading && !failed && monthEntries.length === 0 && <p className="text-muted-foreground">There are no journal moments here yet, {name}. Your story can begin with one small moment whenever you’re ready.</p>}
          </ul>
        </Panel>
        <Panel>
          <h2 className="text-xl font-semibold">Your film</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {[["Check ins", stats.checkIns], ["Days", stats.daysCheckedIn], ["Entries", stats.journalCount], ["Small wins", stats.smallWins]].map(([key, value]) => (
              <div key={key as string} className="rounded-2xl bg-mist p-3"><dt className="text-xs text-muted-foreground">{key}</dt><dd className="font-display text-3xl">{value}</dd></div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">{selected.size} of {MAX_REWIND_MOMENTS} moments selected. Unmatched moments become a quiet reflection scene.</p>
          <Button className="mt-4 w-full rounded-full" disabled={busy || loading || failed || selected.size === 0} onClick={createMine}><Sparkles className="size-4" /> {busy ? "Creating…" : "Create my film"}</Button>
        </Panel>
      </div>

      <AnimatePresence>{playing && <RewindPlayer data={playing} onClose={() => setPlaying(null)} />}</AnimatePresence>
    </div>
  );
}
