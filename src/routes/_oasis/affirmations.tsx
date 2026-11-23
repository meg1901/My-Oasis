import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Heart, RefreshCw, Share2, Wand2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAct, useAffirmations, useData } from "@/lib/queries";
import { AFFIRMATION_CATEGORIES } from "@/lib/types";
import { dailyIndex } from "@/lib/stats";
import { personalizedAffirmation } from "@/lib/personalization";
import { PageHeader, Panel, SourceNote } from "@/components/oasis/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_oasis/affirmations")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "Affirmations. OASIS" }, { name: "description", content: "Swipeable affirmations for every kind of day." }, { property: "og:title", content: "Affirmations. OASIS" }, { property: "og:description", content: "Swipeable affirmations for every kind of day." }] }),
  component: AffirmationsPage,
});

type Card = { text: string; category: string; source: "curated" };
const BG = ["bg-lagoon", "bg-dawn", "bg-sky", "bg-white"];

function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const left = b[i]; const right = b[j]; if (left !== undefined && right !== undefined) { b[i] = right; b[j] = left; } } return b; }

function AffirmationsPage() {
  const { api, saved, profile, moods } = useData();
  const all = useAffirmations();
  const [cat, setCat] = useState<string>("all");
  const [seed, setSeed] = useState(0);
  const [extra, setExtra] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [gen, setGen] = useState(false);

  const cards: Card[] = useMemo(() => {
    const base = (all.data ?? []).filter((a) => cat === "all" || a.category === cat).map((a) => ({ text: a.text, category: a.category, source: "curated" as const }));
    return [...extra.filter((e) => cat === "all" || e.category === cat), ...(seed ? shuffle(base) : base)];
  }, [all.data, cat, seed, extra]);
  const card = cards[((i % Math.max(cards.length, 1)) + cards.length) % Math.max(cards.length, 1)];
  const daily = (all.data ?? [])[dailyIndex(all.data?.length ?? 0, new Date(), 3)];
  const savedSet = new Set((saved.data ?? []).map((s) => s.text));
  const toggleSave = useAct(async (c: Card) => (savedSet.has(c.text) ? api.unsave(c.text) : api.save({ text: c.text, category: c.category, source: c.source })), ["saved"]);

  const go = (d: number) => { setDir(d); setI((x) => x + d); };
  const onDragEnd = (_: unknown, info: PanInfo) => { if (info.offset.x < -80) go(1); else if (info.offset.x > 80) go(-1); };

  async function generate() {
    setGen(true);
    const result = personalizedAffirmation({ name: profile.data?.preferred_name, mood: moods.data?.[0]?.mood, ...(cat === "all" ? {} : { category: cat }), variant: extra.length });
    setExtra((e) => [result, ...e]); setI(0); setGen(false);
  }

  async function share(text: string) {
    const msg = `${text}\nShared from OASIS`;
    if (navigator.share) { try { await navigator.share({ text: msg }); return; } catch { /* cancelled */ } }
    await navigator.clipboard.writeText(msg);
    toast.success("Copied. ready to share");
  }

  return (
    <div>
      <PageHeader eyebrow="Affirmations" title="Words to carry with you">Swipe through, save the ones that land, and share them with someone who needs it.</PageHeader>
      {daily && (
        <Panel className="mb-6 bg-dawn">
          <p className="text-sm font-bold uppercase tracking-widest opacity-70">Your daily affirmation</p>
          <p className="mt-2 font-display text-2xl">{daily.text}</p>
        </Panel>
      )}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {[{ id: "all", label: "All" }, ...AFFIRMATION_CATEGORIES].map((c) => (
          <button key={c.id} onClick={() => { setCat(c.id); setI(0); }} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold", cat === c.id ? "bg-navy text-primary-foreground" : "bg-background/80")}>{c.label}</button>
        ))}
      </div>

      <div className="relative mx-auto h-[360px] max-w-xl">
        <div className="absolute inset-x-6 top-4 h-full rounded-[2rem] bg-background/50" />
        <AnimatePresence custom={dir} mode="popLayout">
          {card && (
            <motion.div
              key={card.text}
              custom={dir}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={onDragEnd}
              initial={{ opacity: 0, x: dir * 120, rotate: dir * 6 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -dir * 160, rotate: -dir * 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className={cn("absolute inset-0 flex cursor-grab flex-col justify-between rounded-[2rem] p-8 shadow-soft active:cursor-grabbing", BG[Math.abs(i) % BG.length])}
            >
              <p className="text-sm font-bold uppercase tracking-widest opacity-70">{AFFIRMATION_CATEGORIES.find((c) => c.id === card.category)?.label ?? "Affirmation"}</p>
              <p className="font-display text-3xl leading-snug md:text-4xl">{card.text}</p>
              <div className="flex items-center justify-between">
                <SourceNote source={card.source} />
                <span className="text-xs opacity-60">swipe ←→</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {card && (
        <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => go(-1)} aria-label="Previous"><ChevronLeft /></Button>
          <Button variant="outline" className="rounded-full" onClick={() => toggleSave.mutate(card)}><Heart className={cn("size-4", savedSet.has(card.text) && "fill-current text-destructive")} />{savedSet.has(card.text) ? "Saved" : "Save"}</Button>
          <Button variant="outline" className="rounded-full" onClick={() => navigator.clipboard.writeText(card.text).then(() => toast.success("Copied"))}><Copy className="size-4" /> Copy</Button>
          <Button variant="outline" className="rounded-full" onClick={() => share(card.text)}><Share2 className="size-4" /> Share</Button>
          <Button variant="outline" className="rounded-full" onClick={() => { setSeed((s) => s + 1); setI(0); }}><RefreshCw className="size-4" /> Refresh</Button>
          <Button className="rounded-full" onClick={generate} disabled={gen}><Wand2 className="size-4" /> {gen ? "Creating…" : "Personalize"}</Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => go(1)} aria-label="Next"><ChevronRight /></Button>
        </div>
      )}

      <Panel className="mt-10">
        <h2 className="text-2xl font-semibold">Your favorites</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {(saved.data ?? []).map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-3 rounded-2xl bg-mist p-4">
              <span>{s.text}</span>
              <button onClick={() => toggleSave.mutate({ text: s.text, category: s.category ?? "", source: "curated" })} aria-label="Remove favorite"><Heart className="size-4 fill-current text-destructive" /></button>
            </li>
          ))}
          {saved.data?.length === 0 && <p className="text-muted-foreground">Tap the heart on any card to keep it here.</p>}
        </ul>
      </Panel>
    </div>
  );
}
