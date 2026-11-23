import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CloudRain, Pause, Play, SkipForward, Square, Waves, Wind, Volume2, VolumeX } from "lucide-react";
import { PageHeader, Panel } from "@/components/oasis/ui";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { chime, startAmbient, type Ambient } from "@/lib/sound";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_oasis/reset")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "Reset Room. OASIS" }, { name: "description", content: "Box breathing, grounding and a one minute pause." }, { property: "og:title", content: "Reset Room. OASIS" }, { property: "og:description", content: "Box breathing, grounding and a one minute pause." }] }),
  component: ResetPage,
});

type Phase = { label: string; secs: number; scale: number };
const BOX: Phase[] = [
  { label: "Inhale", secs: 4, scale: 1 },
  { label: "Hold", secs: 4, scale: 1 },
  { label: "Exhale", secs: 4, scale: 0.55 },
  { label: "Hold", secs: 4, scale: 0.55 },
];
const GENTLE: Phase[] = [
  { label: "Breathe in", secs: 4, scale: 1 },
  { label: "Breathe out", secs: 6, scale: 0.55 },
];

function Breathing({ cues }: { cues: boolean }) {
  const [gentle, setGentle] = useState(false);
  const [state, setState] = useState<"idle" | "running" | "paused">("idle");
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(1);
  const [cycles, setCycles] = useState(0);
  const phases = gentle ? GENTLE : BOX;
  const p = phases[phase % phases.length]!;

  useEffect(() => {
    if (state !== "running") return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c < p.secs) return c + 1;
        setPhase((ph) => {
          const next = (ph + 1) % phases.length;
          if (next === 0) setCycles((x) => x + 1);
          if (cues) chime(next % 2 === 0 ? 528 : 396);
          return next;
        });
        return 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [state, p.secs, phases.length, cues]);

  const stop = () => { setState("idle"); setPhase(0); setCount(1); setCycles(0); };
  const skip = () => { setPhase((x) => (x + 1) % phases.length); setCount(1); };

  return (
    <Panel className="relative overflow-hidden bg-night text-primary-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">{gentle ? "Gentle breathing" : "Box breathing"}</h2>
        <div className="flex items-center gap-2 text-sm">
          <Switch id="gentle" checked={gentle} onCheckedChange={(v) => { setGentle(v); stop(); }} />
          <Label htmlFor="gentle">No breath holding</Label>
        </div>
      </div>
      <div className="relative my-8 grid h-72 place-items-center">
        <motion.div
          animate={{ scale: state === "idle" ? 0.7 : p.scale, borderRadius: gentle ? "50%" : "28%" }}
          transition={{ duration: state === "running" ? p.secs : 0.6, ease: "easeInOut" }}
          className="absolute size-64 bg-lagoon shadow-glow"
        />
        <div className="relative text-center text-foreground">
          <AnimatePresence mode="wait">
            <motion.p key={state === "idle" ? "idle" : `${phase}-${p.label}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-display text-3xl">
              {state === "idle" ? "Ready?" : p.label}
            </motion.p>
          </AnimatePresence>
          {state !== "idle" && <p className="mt-1 text-5xl font-semibold tabular-nums" aria-live="polite">{count}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {state !== "running" ? (
          <Button onClick={() => setState("running")} className="rounded-full bg-background text-foreground hover:bg-background/90"><Play className="size-4" />{state === "paused" ? "Resume" : "Start"}</Button>
        ) : (
          <Button onClick={() => setState("paused")} className="rounded-full bg-background text-foreground hover:bg-background/90"><Pause className="size-4" />Pause</Button>
        )}
        <Button variant="ghost" onClick={stop} disabled={state === "idle"} className="rounded-full hover:bg-background/10"><Square className="size-4" />Stop</Button>
        <Button variant="ghost" onClick={skip} disabled={state === "idle"} className="rounded-full hover:bg-background/10"><SkipForward className="size-4" />Skip</Button>
      </div>
      <p className="mt-4 text-center text-sm opacity-70">{cycles > 0 ? `${cycles} calm cycle${cycles > 1 ? "s" : ""} complete` : "Breathe at a pace that feels comfortable. Stop anytime."}</p>
    </Panel>
  );
}

function MinuteTimer() {
  const [left, setLeft] = useState(60);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setLeft((l) => { if (l <= 1) { setOn(false); chime(660); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [on]);
  const pct = (60 - left) / 60;
  return (
    <Panel className="text-center">
      <h2 className="text-2xl font-semibold">One-minute pause</h2>
      <svg viewBox="0 0 120 120" className="mx-auto my-4 size-40" role="img" aria-label={`${left} seconds left`}>
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--mist)" strokeWidth="10" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--teal)" strokeWidth="10" strokeLinecap="round" strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - pct)} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 1s linear" }} />
        <text x="60" y="68" textAnchor="middle" className="fill-foreground font-display text-3xl">{left}</text>
      </svg>
      <p className="mb-4 text-muted-foreground">{left === 0 ? "Welcome back. How do you feel?" : "Let your shoulders drop. Unclench your jaw."}</p>
      <div className="flex justify-center gap-2">
        <Button className="rounded-full" onClick={() => { if (left === 0) setLeft(60); setOn(!on); }}>{on ? "Pause" : left === 0 ? "Again" : "Begin"}</Button>
        <Button variant="ghost" className="rounded-full" onClick={() => { setOn(false); setLeft(60); }}>Reset</Button>
      </div>
    </Panel>
  );
}

const GROUND = [
  { n: 5, sense: "things you can see", hint: "A palm tree, a cloud, the color of your notebook…" },
  { n: 4, sense: "things you can feel", hint: "Your feet on the floor, the chair, a breeze…" },
  { n: 3, sense: "things you can hear", hint: "Distant voices, an AC hum, birds…" },
  { n: 2, sense: "things you can smell", hint: "Coffee, fresh air, your sleeve…" },
  { n: 1, sense: "thing you can taste", hint: "Or one thing you appreciate about yourself." },
];

function Grounding() {
  const [i, setI] = useState(0);
  const g = GROUND[i];
  return (
    <Panel className="bg-dawn">
      <h2 className="text-2xl font-semibold">5-4-3-2-1 grounding</h2>
      <AnimatePresence mode="wait">
        {g ? (
          <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-6">
            <p className="font-display text-6xl">{g.n}</p>
            <p className="text-xl font-semibold">{g.sense}</p>
            <p className="mt-1 text-muted-foreground">{g.hint}</p>
          </motion.div>
        ) : (
          <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 font-display text-2xl">You're here. You're grounded. Nicely done.</motion.p>
        )}
      </AnimatePresence>
      <div className="flex gap-2">
        {g ? <Button className="rounded-full" onClick={() => setI(i + 1)}>Next</Button> : <Button className="rounded-full" onClick={() => setI(0)}>Start over</Button>}
      </div>
    </Panel>
  );
}

const PAUSES = [
  "Look at the sky for ten seconds. Notice one shape in the clouds.",
  "Roll your shoulders back three times, slowly.",
  "Place a hand on your chest. Feel it rise and fall.",
  "Sip some water. Arizona is thirsty work.",
  "Name one thing that went okay today.",
];

function Ambience({ cues, setCues }: { cues: boolean; setCues: (v: boolean) => void }) {
  const [playing, setPlaying] = useState<Ambient | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => () => stopRef.current?.(), []);
  const toggle = (k: Ambient) => {
    stopRef.current?.();
    stopRef.current = null;
    if (playing === k) { setPlaying(null); return; }
    stopRef.current = startAmbient(k);
    setPlaying(k);
  };
  const opts: [Ambient, string, typeof Wind][] = [["rain", "Soft rain", CloudRain], ["wind", "Desert breeze", Wind], ["waves", "Lake waves", Waves]];
  return (
    <Panel>
      <h2 className="text-2xl font-semibold">Ambient sound <span className="text-base font-normal text-muted-foreground">(optional)</span></h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {opts.map(([k, label, Icon]) => (
          <button key={k} onClick={() => toggle(k)} aria-pressed={playing === k} className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold", playing === k ? "border-teal bg-teal/40" : "border-navy/15 bg-background")}>
            <Icon className="size-4" />{label}
          </button>
        ))}
      </div>
      <button onClick={() => setCues(!cues)} className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
        {cues ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />} Breathing sound cues {cues ? "on" : "off"}
      </button>
    </Panel>
  );
}

function ResetPage() {
  const [cues, setCues] = useState(false);
  const [pause, setPause] = useState(0);
  return (
    <div>
      <PageHeader eyebrow="Reset Room" title="Take a breath. You're safe here.">A quiet sky for a quiet minute. Try whatever feels right.</PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Breathing cues={cues} />
        <div className="space-y-6">
          <MinuteTimer />
          <Ambience cues={cues} setCues={setCues} />
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Grounding />
        <Panel className="bg-sky">
          <h2 className="text-2xl font-semibold">Mindful pause</h2>
          <AnimatePresence mode="wait">
            <motion.p key={pause} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 font-display text-2xl">{PAUSES[pause % PAUSES.length]}</motion.p>
          </AnimatePresence>
          <Button variant="outline" className="rounded-full bg-background" onClick={() => setPause(pause + 1)}>Another one</Button>
        </Panel>
      </div>
    </div>
  );
}
