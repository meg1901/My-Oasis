import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, ShieldAlert, ArrowLeft } from "lucide-react";
import { RESOURCES } from "@/lib/resources";
import { Wordmark } from "@/components/brand/Wordmark";
import { Clouds } from "@/components/brand/Clouds";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Campus resources. OASIS" },
      { name: "description", content: "Official ASU counseling, wellness, academic and student support services." },
      { property: "og:title", content: "Campus resources. OASIS" },
      { property: "og:description", content: "Official ASU counseling, wellness, academic and student support services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourcesPage,
});

const CATS = ["Counseling & crisis", "Health & wellness", "Academic support", "Student services"] as const;

function ResourcesPage() {
  return (
    <div className="relative min-h-screen bg-sky-gradient pb-16">
      <Clouds density={6} className="shared-clouds" />
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link to="/"><Wordmark size={44} /></Link>
        <Link to="/home" className="inline-flex items-center gap-1 text-sm font-semibold"><ArrowLeft className="size-4" /> Back to OASIS</Link>
      </header>
      <main className="relative z-10 mx-auto max-w-5xl px-4">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-teal">Campus support</p>
        <h1 className="text-4xl font-semibold md:text-5xl">You don't have to figure it out alone.</h1>
        <div className="mt-6 flex gap-3 rounded-3xl border-2 border-destructive/30 bg-background p-5">
          <ShieldAlert className="size-6 shrink-0 text-destructive" />
          <p><b>In immediate danger or crisis?</b> Call 911, or call or text <b>988</b> (Suicide & Crisis Lifeline) any time. ASU Counseling Services also offers 24/7 support for students.</p>
        </div>
        <p className="mt-4 rounded-2xl bg-sky/60 p-4 text-sm">
          <b>OASIS is an independent student project</b>. not an official Arizona State University service, and not a substitute for professional care. The links below go to official ASU and national services.
        </p>
        {CATS.map((c) => (
          <section key={c} className="mt-10">
            <h2 className="text-2xl font-semibold">{c}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {RESOURCES.filter((r) => r.category === c).map((r) => (
                <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="group rounded-3xl glass p-5 shadow-soft transition hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-2"><h3 className="text-lg font-semibold">{r.name}</h3><ExternalLink className="size-4 shrink-0 opacity-50 group-hover:opacity-100" /></div>
                  <p className="mt-1 text-muted-foreground">{r.description}</p>
                  <p className="mt-3 text-xs text-teal">{new URL(r.url).hostname} · Official</p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
