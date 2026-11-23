import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Flag, Gift, Heart, PartyPopper, Send } from "lucide-react";
import { useApi } from "@/lib/api-context";
import { addDemoPost } from "@/lib/api";
import { previewModeration, submitPost } from "@/lib/wall.functions";
import { PageHeader, Panel } from "@/components/oasis/ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_oasis/wall")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "Sun Devil Positivity Wall. OASIS" }, { name: "description", content: "Anonymous encouragement from fellow ASU students." }, { property: "og:title", content: "Sun Devil Positivity Wall. OASIS" }, { property: "og:description", content: "Anonymous encouragement from fellow ASU students." }] }),
  component: WallPage,
});

const TINTS = ["bg-white", "bg-sky/60", "bg-mist", "bg-primary-blue/25"];

function WallPage() {
  const api = useApi();
  const qc = useQueryClient();
  const posts = useQuery({ queryKey: [api.mode, "posts"], queryFn: () => api.listPosts() });
  const mine = useQuery({ queryKey: [api.mode, "reactions"], queryFn: () => api.myReactions() });
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [received, setReceived] = useState<{ id: string; body: string } | null>(null);
  const [forward, setForward] = useState("");
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: [api.mode, "posts"] }), qc.invalidateQueries({ queryKey: [api.mode, "reactions"] })]);
  const has = new Set(mine.data ?? []);

  async function post(text: string, passForward: boolean) {
    setBusy(true);
    try {
      if (api.mode === "demo") {
        const m = await previewModeration({ data: { body: text } });
        if (m.status === "approved") addDemoPost(text, passForward);
        toast[m.status === "approved" ? "success" : "message"](m.status === "approved" ? "Shared anonymously 💛" : "Held for review", { description: m.note || undefined });
      } else {
        const r = await submitPost({ data: { body: text, passForward } });
        if (!r.ok) { toast.error(r.message); return false; }
        toast[r.status === "approved" ? "success" : "message"](r.status === "approved" ? "Shared anonymously 💛" : "Thanks! It's waiting for a quick review.", { description: r.note || undefined });
      }
      await refresh();
      return true;
    } catch {
      toast.error("Couldn't post right now.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function react(id: string, kind: "heart" | "cheer") {
    await api.react(id, kind, !has.has(`${id}:${kind}`)).catch(() => toast.error("Couldn't react"));
    refresh();
  }
  async function report(id: string) {
    if (!confirm("Report this message for review? It will be hidden after a few reports.")) return;
    await api.report(id, "user report").catch(() => null);
    toast.success("Thanks. our moderators will take a look.");
    refresh();
  }

  return (
    <div>
      <PageHeader eyebrow="Community" title="Sun Devil Positivity Wall">Anonymous, kind and just for encouragement. No usernames, no followers, no DMs. only good vibes.</PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <Panel>
            <form onSubmit={async (e) => { e.preventDefault(); if (await post(body.trim(), false)) setBody(""); }}>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={280} placeholder="Leave something kind for a fellow Sun Devil…" className="min-h-24 rounded-2xl bg-background text-base" />
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>{body.length}/280 · posted anonymously · reviewed for safety</span>
                <Button disabled={busy || body.trim().length < 3} className="rounded-full"><Send className="size-4" /> Share</Button>
              </div>
            </form>
          </Panel>

          <div className="mt-6 columns-1 gap-4 sm:columns-2">
            <AnimatePresence>
              {(posts.data ?? []).map((p, i) => (
                <motion.article key={p.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cn("mb-4 break-inside-avoid rounded-3xl p-5 shadow-soft", TINTS[i % TINTS.length])}>
                  {p.is_pass_forward && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal">Passed forward</p>}
                  <p className="text-lg leading-relaxed">{p.body}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <button onClick={() => react(p.id, "heart")} aria-pressed={has.has(`${p.id}:heart`)} className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1", has.has(`${p.id}:heart`) ? "bg-background" : "bg-background/50")}><Heart className={cn("size-4", has.has(`${p.id}:heart`) && "fill-current text-destructive")} />{p.heart_count}</button>
                    <button onClick={() => react(p.id, "cheer")} aria-pressed={has.has(`${p.id}:cheer`)} className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1", has.has(`${p.id}:cheer`) ? "bg-background" : "bg-background/50")}><PartyPopper className="size-4" />{p.cheer_count}</button>
                    <button onClick={() => report(p.id)} className="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-background/60" aria-label="Report message"><Flag className="size-4" /></button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <aside>
          <Panel className="sticky top-24 bg-dawn">
            <Gift className="size-7" />
            <h2 className="mt-2 text-2xl font-semibold">Pass the Positivity</h2>
            <p className="mt-1 text-muted-foreground">Open a message from another student, then write one to pass forward.</p>
            {received ? (
              <div className="mt-4 space-y-3">
                <motion.p initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} className="rounded-2xl bg-background p-4 font-display text-lg">{received.body}</motion.p>
                <Textarea value={forward} onChange={(e) => setForward(e.target.value)} maxLength={280} placeholder="Now write something kind for the next person…" className="rounded-2xl bg-background" />
                <Button disabled={busy || forward.trim().length < 3} className="w-full rounded-full" onClick={async () => { if (await post(forward.trim(), true)) { setForward(""); setReceived(null); } }}>Pass it forward</Button>
              </div>
            ) : (
              <Button className="mt-4 w-full rounded-full" onClick={async () => { const r = await api.randomPositivity(); if (r) setReceived(r); else toast.message("No messages yet. be the first!"); }}>Receive a message</Button>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
