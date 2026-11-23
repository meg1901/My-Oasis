import { useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Send, X, ArrowUpRight } from "lucide-react";
import { Oasi } from "@/components/brand/Oasi";
import { personalizedAffirmation, companionReply } from "@/lib/personalization";
import { useData } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
type Msg = { from: "oasi" | "me"; text: string; to?: string; label?: string };
export function OasiCompanion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, moods } = useData();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const latest = moods.data?.[0]?.mood;
  const suggestion = companionReply(
    latest === "overwhelmed" || latest === "low"
      ? "breath"
      : location.pathname === "/journal"
        ? "win"
        : "rewind",
  );
  const go = (to: string) => {
    navigate({ to });
    setOpen(false);
  };
  const affirm = () =>
    setMsgs((m) => [
      ...m,
      {
        from: "oasi",
        text: personalizedAffirmation({
          name: profile.data?.preferred_name,
          mood: latest,
          variant: m.length,
        }).text,
      },
    ]);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    const reply = companionReply(text);
    setMsgs((m) => [...m, { from: "me", text }, { from: "oasi", ...reply }]);
  };
  return (
    <div className="fixed bottom-24 right-3 z-40 lg:bottom-5 lg:right-5">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-2 flex h-[min(520px,70dvh)] w-[min(360px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-soft"
          >
            <div className="flex items-center justify-between bg-dawn p-4">
              <div className="flex items-center gap-2">
                <Oasi size={48} float={false} />
                <div>
                  <p className="font-brand text-xl">OASI</p>
                  <p className="text-sm text-muted-foreground">
                    Your friendly guide, not a therapist
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close OASI"
              >
                <X />
              </Button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              <p className="rounded-2xl bg-mist p-3">
                {profile.data?.preferred_name ? `Hi, ${profile.data.preferred_name}! ` : "Hi! "}
                {suggestion.text}
              </p>
              <Button variant="outline" onClick={() => go(suggestion.to)}>
                {suggestion.label}
                <ArrowUpRight className="size-4" />
              </Button>
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.from === "me"
                      ? "ml-6 rounded-xl bg-navy p-3 text-primary-foreground"
                      : "mr-4 rounded-xl bg-mist p-3"
                  }
                >
                  {m.text}
                  {m.to && (
                    <Button variant="ghost" className="mt-2" onClick={() => go(m.to ?? "/mood")}>
                      {m.label}
                      <ArrowUpRight className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => go("/reset")}>
                  Take a breath
                </Button>
                <Button size="sm" variant="outline" onClick={() => go("/journal")}>
                  Write a small win
                </Button>
                <Button size="sm" variant="outline" onClick={affirm}>
                  Give me an affirmation
                </Button>
                <Button size="sm" variant="outline" onClick={() => go("/resources")}>
                  Find campus support
                </Button>
                <Button size="sm" variant="outline" onClick={() => go("/rewind")}>
                  Show my monthly rewind
                </Button>
              </div>
            </div>
            <form onSubmit={send} className="flex gap-2 border-t p-3">
              <Input
                aria-label="Message OASI"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What is on your mind?"
                maxLength={600}
              />
              <Button size="icon" aria-label="Send">
                <Send />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
          aria-label="Talk to OASI"
          className="h-auto rounded-full p-0 hover:bg-transparent"
        >
          <Oasi size={72} />
        </Button>
      </div>
    </div>
  );
}
