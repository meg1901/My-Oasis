import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, Pencil, Trash2, Wand2 } from "lucide-react";
import { useAct, useData } from "@/lib/queries";
import { JOURNAL_PROMPTS } from "@/lib/types";

import { contextualPrompt } from "@/lib/personalization";
import { PageHeader, Panel, SourceNote } from "@/components/oasis/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_oasis/journal")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "Small Wins Journal. OASIS" }, { name: "description", content: "A private journal for celebrating what went right." }, { property: "og:title", content: "Small Wins Journal. OASIS" }, { property: "og:description", content: "A private journal for celebrating what went right." }] }),
  component: JournalPage,
});

function JournalPage() {
  const { api, journal, moods } = useData();
  const [prompt, setPrompt] = useState<string | null>(JOURNAL_PROMPTS[0]);
  const [aiPrompt, setAiPrompt] = useState<{ text: string; source: "curated" } | null>(null);
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const add = useAct((v: { prompt: string | null; body: string }) => api.addJournal(v), ["journal"]);
  const upd = useAct((v: { id: string; body: string }) => api.updateJournal(v.id, v.body), ["journal"]);
  const del = useAct((id: string) => api.deleteJournal(id), ["journal"]);

  async function suggest() {
    const p = { text: contextualPrompt(moods.data?.[0]?.mood, Math.floor(Math.random() * 3)), source: "curated" as const };
    setAiPrompt(p);
    setPrompt(p.text);
  }

  return (
    <div>
      <PageHeader eyebrow="Small Wins Journal" title="What went right?">
        <span className="inline-flex items-center gap-1.5"><Lock className="size-4" /> Private. only you can read your entries.</span>
      </PageHeader>

      <Panel>
        <div className="flex flex-wrap gap-2">
          {JOURNAL_PROMPTS.map((p) => (
            <button key={p} onClick={() => { setPrompt(p); setAiPrompt(null); }} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", prompt === p ? "bg-navy text-primary-foreground" : "bg-mist")}>{p}</button>
          ))}
          <button onClick={() => { setPrompt(null); setAiPrompt(null); }} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", prompt === null ? "bg-navy text-primary-foreground" : "bg-mist")}>Free write</button>
          <button onClick={suggest} className="inline-flex items-center gap-1.5 rounded-full border border-teal px-4 py-1.5 text-sm font-semibold"><Wand2 className="size-4" />Suggest a prompt</button>
        </div>
        <h2 className="mt-6 font-display text-3xl">{prompt ?? "Write anything on your mind."}</h2>
        {aiPrompt && <SourceNote source={aiPrompt.source} />}
        <form className="mt-4" onSubmit={async (e) => {
          e.preventDefault();
          if (!body.trim()) return;
          try { await add.mutateAsync({ prompt, body: body.trim() }); setBody(""); toast.success("Small win saved ✨"); } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't save"); }
        }}>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} placeholder="Even tiny wins count…" className="min-h-32 rounded-2xl bg-background text-base" />
          <div className="mt-3 flex justify-end"><Button disabled={add.isPending || !body.trim()} className="rounded-full px-6">Save entry</Button></div>
        </form>
      </Panel>

      <div className="mt-8 space-y-3">
        <h2 className="text-2xl font-semibold">Your entries</h2>
        <AnimatePresence>
          {(journal.data ?? []).map((j) => (
            <motion.article key={j.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="rounded-3xl glass p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-muted-foreground">{new Date(j.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {j.prompt ?? "Free write"}</p>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(j.id); setEditBody(j.body); }} aria-label="Edit entry" className="rounded-full p-1.5 hover:bg-mist"><Pencil className="size-4" /></button>
                  <button onClick={() => confirm("Delete this entry?") && del.mutate(j.id)} aria-label="Delete entry" className="rounded-full p-1.5 hover:bg-mist"><Trash2 className="size-4" /></button>
                </div>
              </div>
              {editing === j.id ? (
                <div className="mt-2">
                  <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} className="rounded-2xl bg-background" />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" className="rounded-full" onClick={() => upd.mutate({ id: j.id, body: editBody.trim() }, { onSuccess: () => setEditing(null) })}>Save</Button>
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-lg">{j.body}</p>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
        {journal.data?.length === 0 && <p className="text-muted-foreground">Your first small win is waiting to be written.</p>}
      </div>
    </div>
  );
}
