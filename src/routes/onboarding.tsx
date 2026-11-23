import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { liveApi } from "@/lib/api";
import { AFFIRMATION_CATEGORIES, CAMPUSES, WELLNESS_GOALS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Oasi } from "@/components/brand/Oasi";
import { Clouds } from "@/components/brand/Clouds";
import { Avatar, AVATARS } from "@/components/brand/Avatar";
import { cn } from "@/lib/utils";
import { exitDemo } from "@/lib/mode";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth", search: { mode: "signin", reason: "verify" } });
    }
    const profile = await liveApi.getProfile();
    if (profile.onboarded) throw redirect({ to: "/home" });
    return { profile };
  },
  head: () => ({
    meta: [
      { title: "Welcome to OASIS" },
      { name: "description", content: "Complete your private OASIS student profile." },
      { property: "og:title", content: "Welcome to OASIS" },
      { property: "og:description", content: "Complete your private OASIS student profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={on} className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition", on ? "border-navy bg-navy text-primary-foreground" : "border-navy/15 bg-white hover:bg-sky/50")}>{children}</button>;
}

function Onboarding() {
  const navigate = useNavigate();
  const { profile } = Route.useRouteContext();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.preferred_name ?? "");
  const [degree, setDegree] = useState(profile.degree_program ?? "");
  const [level, setLevel] = useState(profile.student_level ?? "");
  const [year, setYear] = useState(profile.academic_year ?? "");
  const [avatar, setAvatar] = useState(profile.avatar ?? "cloud");
  const [campus, setCampus] = useState(profile.campus ?? "Tempe");
  const [goals, setGoals] = useState<string[]>(profile.wellness_goals ?? []);
  const [cats, setCats] = useState<string[]>(profile.affirmation_categories?.length ? profile.affirmation_categories : ["academic", "stress"]);
  const [busy, setBusy] = useState(false);
  const toggle = (items: string[], set: (value: string[]) => void, value: string) => set(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);

  async function finish() {
    setBusy(true);
    try {
      await liveApi.updateProfile({ preferred_name: name.trim(), degree_program: degree.trim(), student_level: level, academic_year: year, avatar, campus, wellness_goals: goals, affirmation_categories: cats, onboarded: true });
      exitDemo();
      toast.success("Your profile is ready. Welcome to OASIS.");
      navigate({ to: "/home" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save your profile");
    } finally {
      setBusy(false);
    }
  }

  const steps = [
    {
      q: "Hi! I’m OASI. What’s your full name?",
      body: <div className="space-y-2"><Label htmlFor="onboarding-name">Full name</Label><Input id="onboarding-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className="h-12 rounded-2xl bg-white text-lg" maxLength={40} /></div>,
      ok: name.trim().length > 0,
    },
    {
      q: "Tell us about your student journey.",
      body: <div className="space-y-4"><div className="space-y-2"><Label htmlFor="onboarding-degree">Major or degree program</Label><Input id="onboarding-degree" value={degree} onChange={(event) => setDegree(event.target.value)} placeholder="Computer Science" maxLength={120} className="h-12 rounded-2xl bg-white" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="onboarding-level">Student level</Label><select id="onboarding-level" value={level} onChange={(event) => setLevel(event.target.value)} className="h-12 w-full rounded-xl border bg-white px-3"><option value="">Choose one</option><option>Undergraduate</option><option>Graduate</option></select></div><div className="space-y-2"><Label htmlFor="onboarding-year">Year of study</Label><select id="onboarding-year" value={year} onChange={(event) => setYear(event.target.value)} className="h-12 w-full rounded-xl border bg-white px-3"><option value="">Choose one</option>{["First year", "Second year", "Third year", "Fourth year", "Fifth year or beyond"].map((option) => <option key={option}>{option}</option>)}</select></div></div></div>,
      ok: degree.trim().length > 0 && level.length > 0 && year.length > 0,
    },
    {
      q: "Choose your profile avatar.",
      body: <div className="grid grid-cols-4 gap-3">{AVATARS.map((item) => <button type="button" key={item.id} aria-label={item.label} aria-pressed={avatar === item.id} onClick={() => setAvatar(item.id)} className={cn("grid place-items-center rounded-2xl border-2 bg-white p-2 transition hover:-translate-y-1", avatar === item.id ? "border-navy bg-sky" : "border-transparent")}><Avatar kind={item.id} size={72} /><span className="sr-only">{item.label}</span></button>)}</div>,
      ok: Boolean(avatar),
    },
    {
      q: "What would you like to make space for?",
      body: <div className="space-y-5"><div className="flex flex-wrap gap-2">{WELLNESS_GOALS.map((goal) => <Chip key={goal} on={goals.includes(goal)} onClick={() => toggle(goals, setGoals, goal)}>{goal}</Chip>)}</div><div className="space-y-2"><Label htmlFor="onboarding-campus">Your ASU campus</Label><select id="onboarding-campus" value={campus} onChange={(event) => setCampus(event.target.value)} className="h-12 w-full rounded-xl border bg-white px-3">{CAMPUSES.map((option) => <option key={option}>{option}</option>)}</select></div></div>,
      ok: true,
    },
    {
      q: "Which affirmations speak to you?",
      body: <div className="flex flex-wrap gap-2">{AFFIRMATION_CATEGORIES.map((category) => <Chip key={category.id} on={cats.includes(category.id)} onClick={() => toggle(cats, setCats, category.id)}>{category.label}</Chip>)}</div>,
      ok: cats.length > 0,
    },
  ];
  const current = steps[step]!;

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-sky-gradient px-4 py-8">
      <Clouds density={4} />
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-4 flex justify-center"><Oasi size={110} /></div>
        <div className="rounded-[2rem] glass p-6 shadow-soft sm:p-8">
          <p className="mb-3 text-center text-sm font-semibold">Step {step + 1} of {steps.length}</p>
          <div className="mb-6 flex gap-1.5">{steps.map((_, index) => <div key={index} className={cn("h-1.5 flex-1 rounded-full", index <= step ? "bg-primary-blue" : "bg-navy/10")} />)}</div>
          <AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5"><h1 className="font-display text-2xl font-semibold md:text-3xl">{current.q}</h1>{current.body}</motion.div></AnimatePresence>
          <div className="mt-8 flex justify-between"><Button variant="ghost" disabled={step === 0 || busy} onClick={() => setStep(step - 1)} className="rounded-full">Back</Button>{step < steps.length - 1 ? <Button disabled={!current.ok} onClick={() => setStep(step + 1)} className="rounded-full px-6">Next</Button> : <Button disabled={!current.ok || busy} onClick={finish} className="rounded-full px-6">{busy ? "Saving…" : "Enter my oasis"}</Button>}</div>
        </div>
      </div>
    </div>
  );
}
