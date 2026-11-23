import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BookHeart, HeartHandshake, Sparkles, Wind, Film, SmilePlus } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Oasi } from "@/components/brand/Oasi";
import { Clouds } from "@/components/brand/Clouds";
import { Button } from "@/components/ui/button";
import { enterDemo } from "@/lib/mode";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OASIS. Your pause in the chaos | ASU wellness companion" },
      {
        name: "description",
        content:
          "Mood check ins, affirmations, box breathing, a small wins journal and a monthly Rewind, made for Sun Devils.",
      },
      { property: "og:title", content: "OASIS. Your pause in the chaos" },
      {
        property: "og:description",
        content: "A calm, campus-focused wellness companion for Arizona State University students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: SmilePlus,
    title: "Mood check ins",
    text: "Notice how you really feel and see gentle patterns over time.",
  },
  {
    icon: Sparkles,
    title: "Affirmations",
    text: "Swipeable cards made for exam weeks, homesick nights and everything between.",
  },
  {
    icon: HeartHandshake,
    title: "Positivity Wall",
    text: "Anonymous encouragement from fellow Sun Devils. Pass it forward.",
  },
  {
    icon: Wind,
    title: "Reset Room",
    text: "Box breathing, grounding and a one minute pause under a calm sky.",
  },
  {
    icon: BookHeart,
    title: "Small Wins Journal",
    text: "A private place to celebrate what went right.",
  },
  {
    icon: Film,
    title: "OASIS Rewind",
    text: "A cinematic look back at your month, built from your real moments.",
  },
];

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active || !data.user) return;
      if (!data.user.email_confirmed_at) {
        navigate({ to: "/auth", search: { mode: "signin", reason: "verify" }, replace: true });
        return;
      }
      const { liveApi } = await import("@/lib/api");
      const profile = await liveApi.getProfile();
      if (active) navigate({ to: profile.onboarded ? "/home" : "/onboarding", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);
  const tryDemo = () => {
    enterDemo();
    navigate({ to: "/home" });
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-gradient">
      <Clouds />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Wordmark size={48} />
        <div className="flex gap-2">
          <Button variant="ghost" asChild className="rounded-full">
            <Link to="/auth">Log In</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/auth" search={{ mode: "signup" }}>
              Create Account
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-10 py-10 md:grid-cols-[1.2fr_1fr] md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 inline-flex rounded-full glass px-4 py-1.5 text-sm font-semibold">
              For Arizona State University students
            </p>
            <h1 className="text-5xl font-semibold leading-[1.05] md:text-7xl">OASIS</h1>
            <p className="mt-4 text-2xl font-semibold">Your pause in the chaos.</p>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              OASIS is a calm corner of your day. check in with yourself, breathe, celebrate small
              wins and feel the warmth of your campus community.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="rounded-full px-7">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Create Account
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={tryDemo}
                className="rounded-full border-navy/20 bg-background/70 px-7"
              >
                Explore Demo
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Demo uses a fictional student and sample data. no sign-up needed.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mx-auto"
          >
            <div className="relative">
              <div className="absolute -left-4 -top-10 max-w-[220px] rounded-3xl rounded-bl-md bg-card px-4 py-3 text-sm shadow-soft md:-left-16">
                Hi, I'm <b>OASI</b>! Want to take a breath together?
              </div>
              <Oasi size={280} />
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-lagoon">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="mt-1 text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </section>

        <footer className="border-t border-navy/10 py-8 text-sm text-muted-foreground">
          OASIS is an independent student project and is not an official ASU service. It is not a
          substitute for professional care. In crisis? Call or text <b>988</b>, or see{" "}
          <Link to="/resources" className="underline">
            campus resources
          </Link>
          .
        </footer>
      </main>
    </div>
  );
}
