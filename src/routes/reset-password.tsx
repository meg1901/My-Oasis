import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Oasi } from "@/components/brand/Oasi";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password. OASIS" },
      { name: "description", content: "Set a new password for your OASIS account." },
      { property: "og:title", content: "Reset password. OASIS" },
      { property: "og:description", content: "Set a new password for your OASIS account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("type") === "recovery") sessionStorage.setItem("oasis-password-recovery", "1");
    setRecovery(sessionStorage.getItem("oasis-password-recovery") === "1");
    const onRecovery = () => setRecovery(true);
    window.addEventListener("oasis-password-recovery", onRecovery);
    return () => window.removeEventListener("oasis-password-recovery", onRecovery);
  }, []);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!recovery) {
      toast.error("Open the password reset link from your email first.");
      return;
    }
    if (pw.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    sessionStorage.removeItem("oasis-password-recovery");
    toast.success("Password updated. Welcome back!");
    navigate({ to: "/home" });
  }
  return (
    <div className="grid min-h-screen place-items-center bg-sky-gradient px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-[2rem] glass p-7 shadow-soft"
      >
        <div className="flex justify-center">
          <Oasi size={90} mood="calm" />
        </div>
        <h1 className="text-center text-2xl font-semibold">Choose a new password</h1>
        {!recovery && (
          <p className="text-center">Open the password reset link from your email to continue.</p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="pw">New password</Label>
          <Input
            id="pw"
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="h-11 rounded-xl bg-background"
          />
        </div>
        <Button disabled={busy || !recovery} className="h-11 w-full rounded-full">
          Save password
        </Button>
      </form>
    </div>
  );
}
