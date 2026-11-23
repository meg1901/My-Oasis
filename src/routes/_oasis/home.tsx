import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, BookHeart, Film, HeartHandshake, LifeBuoy, Quote as QuoteIcon, SmilePlus, Sparkles, Wind } from "lucide-react";
import { useData, useQuotes } from "@/lib/queries";
import { dailyIndex, greeting, previousMonth } from "@/lib/stats";
import { MOODS, MOOD_LABEL } from "@/lib/types";
import { MoodFace } from "@/components/oasis/MoodFace";
import { Panel } from "@/components/oasis/ui";
import { Clouds } from "@/components/brand/Clouds";
import { personalizedAffirmation } from "@/lib/personalization";
import { Oasi } from "@/components/brand/Oasi";

export const Route = createFileRoute("/_oasis/home")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "Home. OASIS" }, { name: "description", content: "Your daily OASIS dashboard." }, { property: "og:title", content: "Home. OASIS" }, { property: "og:description", content: "Your daily OASIS dashboard." }] }),
  component: HomePage,
});

function HomePage() {
  const { api, profile, journal, moods } = useData();
  const quotes = useQuotes();
  const posts = useQuery({ queryKey: [api.mode, "posts"], queryFn: () => api.listPosts() });
  const name = profile.data?.preferred_name ?? "friend";
  const preferred = profile.data?.affirmation_categories ?? [];
  const affirmation = personalizedAffirmation({ name, mood: moods.data?.[0]?.mood, ...(preferred[0] ? { category: preferred[0] } : {}), variant: dailyIndex(3) });
  const quote = quotes.data?.[dailyIndex(quotes.data.length, new Date(), 7)];
  const today = new Date().toDateString();
  const checkedToday = (moods.data ?? []).some((m) => new Date(m.created_at).toDateString() === today);
  const isFirst = new Date().getDate() === 1;

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden border-b border-sky bg-lagoon px-5 py-8 sm:px-8 md:py-10">
        <Clouds density={4} />
        <div className="relative flex items-center justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl xl:text-5xl">{greeting()}, {name}.</h1>
            <p className="mt-3 text-lg sm:text-xl">Take a moment for yourself today.</p>
            <p className="mt-2 text-base">You are more than your deadlines.</p>
            <Oasi size={88} className="mt-3 md:hidden" />
          </div>
          <Oasi size={180} className="hidden shrink-0 md:block" />
        </div>
      </motion.section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="relative overflow-hidden bg-lagoon lg:col-span-2">
          <p className="text-sm font-bold uppercase tracking-widest opacity-70">Today's affirmation</p>
          <p className="mt-3 font-display text-3xl leading-snug md:text-4xl">{affirmation?.text ?? "…"}</p>
          <Link to="/affirmations" className="mt-5 inline-flex items-center gap-1 font-semibold">More affirmations <ArrowRight className="size-4" /></Link>
        </Panel>
        <Panel className="bg-dawn">
          <QuoteIcon className="size-6 opacity-50" />
          {quote && (
            <figure className="mt-2">
              <blockquote className="font-display text-xl leading-snug">"{quote.text}"</blockquote>
              <figcaption className="mt-3 text-sm"><b>{quote.author}</b><br /><span className="text-muted-foreground">{quote.source}, {quote.year} · {quote.license}</span></figcaption>
            </figure>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="text-2xl font-semibold">{checkedToday ? "Checked in today. nice." : "How are you really feeling today?"}</h2>
          <div className="mt-4 grid grid-cols-5 gap-1 sm:gap-3">
            {MOODS.map((m) => (
              <Link key={m} to="/mood" search={{ m }} className="group flex flex-col items-center gap-1 rounded-2xl p-2 transition hover:bg-mist">
                <span className="transition group-hover:-translate-y-1"><MoodFace mood={m} size={66} /></span>
                <span className="text-[10px] font-bold sm:text-sm">{MOOD_LABEL[m]}</span>
              </Link>
            ))}
          </div>
        </Panel>
        <Link to="/reset" className="group">
          <Panel className="h-full bg-sky transition group-hover:-translate-y-1">
            <Wind className="size-7" />
            <h2 className="mt-3 text-2xl font-semibold">One minute reset</h2>
            <p className="mt-1 text-muted-foreground">One minute of box breathing under a calm sky.</p>
            <span className="mt-4 inline-flex items-center gap-1 font-semibold">Start <ArrowRight className="size-4" /></span>
          </Panel>
        </Link>
      </div>

      <Link to="/rewind" className="block">
        <div className="relative overflow-hidden rounded-2xl bg-night p-6 text-primary-foreground shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest opacity-70">{isFirst ? "It's here!" : "Signature feature"}</p>
              <h2 className="text-3xl font-semibold">Your OASIS Rewind · {previousMonth().label}</h2>
              <p className="opacity-80">A cinematic look back at your month's bright spots.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 font-semibold text-foreground"><Film className="size-4" /> Watch</span>
          </div>
        </div>
      </Link>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Recent small wins</h2><Link to="/journal" className="text-sm font-semibold">Journal →</Link></div>
          <ul className="mt-4 space-y-3">
            {(journal.data ?? []).slice(0, 3).map((j) => (
              <li key={j.id} className="rounded-2xl bg-mist p-4">
                <p className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleDateString()} · {j.prompt ?? "Free write"}</p>
                <p className="mt-1">{j.body}</p>
              </li>
            ))}
            {journal.data?.length === 0 && <p className="text-muted-foreground">No entries yet. What went well today?</p>}
          </ul>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">From the Positivity Wall</h2><Link to="/wall" className="text-sm font-semibold">Wall →</Link></div>
          <ul className="mt-4 space-y-3">
            {(posts.data ?? []).slice(0, 3).map((p) => <li key={p.id} className="rounded-2xl bg-sky/50 p-4">{p.body}</li>)}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { to: "/mood", icon: SmilePlus, label: "Mood patterns" },
          { to: "/affirmations", icon: Sparkles, label: "Affirmations" },
          { to: "/wall", icon: HeartHandshake, label: "Positivity Wall" },
          { to: "/journal", icon: BookHeart, label: "Small Wins" },
          { to: "/reset", icon: Wind, label: "Reset Room" },
          { to: "/rewind", icon: Film, label: "OASIS Rewind" },
          { to: "/resources", icon: LifeBuoy, label: "Campus support" },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="flex items-center gap-3 rounded-2xl glass p-4 font-semibold transition hover:-translate-y-0.5">
            <q.icon className="size-5 text-teal" /> {q.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
