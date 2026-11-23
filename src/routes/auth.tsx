import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { liveApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/brand/Wordmark";
import { Oasi } from "@/components/brand/Oasi";
import { Clouds } from "@/components/brand/Clouds";
import { isAsuEmail } from "@/lib/stats";
import { enterDemo, exitDemo } from "@/lib/mode";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["signin", "signup", "forgot"]).optional(), reason: z.enum(["verify"]).optional() }),
  head: () => ({
    meta: [
      { title: "Sign in to OASIS" },
      { name: "description", content: "Sign in or join OASIS with your verified ASU email." },
      { property: "og:title", content: "Sign in to OASIS" },
      { property: "og:description", content: "Join the OASIS wellness community with your verified ASU email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "signin" | "signup" | "forgot";
type SentState = { kind: "verify" | "reset"; message: string };

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<SentState | null>(null);
  const [formError, setFormError] = useState("");
  const normalizedEmail = email.trim().toLowerCase();
  const onboardingRedirect = () => `${window.location.origin}/onboarding`;
  const canResend = mode === "signin" && /email not confirmed|verify your ASU email/i.test(formError) && isAsuEmail(normalizedEmail);

  const changeMode = (next: AuthMode) => {
    setMode(next);
    setSent(null);
    setFormError("");
    setPassword("");
    setConfirmPassword("");
  };

  async function resendVerification() {
    setBusy(true);
    setFormError("");
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: normalizedEmail, options: { emailRedirectTo: onboardingRedirect() } });
      if (error) throw error;
      toast.success("Verification email sent again");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not resend the verification email");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      if (mode === "signup") {
        if (!isAsuEmail(normalizedEmail)) throw new Error("Please use your valid @asu.edu email to join OASIS.");
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        if (password !== confirmPassword) throw new Error("Your passwords do not match.");
        const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password, options: { emailRedirectTo: onboardingRedirect() } });
        if (error) throw error;
        if (data.session) {
          exitDemo();
          navigate({ to: "/onboarding" });
          return;
        }
        setSent({ kind: "verify", message: "We sent a verification link to your ASU inbox. Open it before logging in." });
      } else if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        if (!data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error("Please verify your ASU email before logging in. You can resend the link from the signup screen.");
        }
        const profile = await liveApi.getProfile();
        exitDemo();
        toast.success(`Welcome back${profile.preferred_name ? `, ${profile.preferred_name}` : ""}`);
        navigate({ to: profile.onboarded ? "/home" : "/onboarding" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent({ kind: "reset", message: "If that email has an account, a password reset link is on its way." });
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-sky-gradient px-4 py-10">
      <Clouds density={4} />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Oasi size={110} />
          <Link to="/"><Wordmark size={48} /></Link>
        </div>
        <div className="rounded-[2rem] glass p-7 shadow-soft">
          {sent ? (
            <div className="space-y-4 text-center" aria-live="polite">
              <MailCheck className="mx-auto size-12 text-primary-blue" />
              <h1 className="font-display text-3xl font-semibold">{sent.kind === "verify" ? "Check your ASU inbox" : "Check your email"}</h1>
              <p className="text-lg">{sent.message}</p>
              <p className="rounded-2xl bg-mist p-3 font-semibold">{normalizedEmail}</p>
              {formError && <p role="alert" className="rounded-xl bg-sky/60 p-3 text-sm font-semibold">{formError}</p>}
              {sent.kind === "verify" && <Button variant="outline" disabled={busy} onClick={resendVerification} className="w-full rounded-full">{busy ? "Sending…" : "Resend verification email"}</Button>}
              <Button variant="ghost" onClick={() => changeMode("signin")}>Back to log in</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h1 className="text-center font-display text-3xl font-semibold">{mode === "signup" ? "Join OASIS" : mode === "forgot" ? "Reset your password" : "Welcome back"}</h1>
              {mode === "signup" && <p className="text-center text-sm text-muted-foreground">Use your @asu.edu email. We’ll send a verification link before you can log in.</p>}
              {search.reason === "verify" && <p className="rounded-xl bg-sky/60 p-3 text-sm font-semibold" role="status">Please verify your ASU email to continue.</p>}
              <div className="space-y-1.5">
                <Label htmlFor="email">{mode === "signup" ? "ASU email" : "Email"}</Label>
                <Input id="email" type="email" required autoComplete="email" placeholder="sparky@asu.edu" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded-xl bg-white" />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded-xl bg-white" />
                </div>
              )}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-12 rounded-xl bg-white" />
                </div>
              )}
              {formError && <div role="alert" className="rounded-xl bg-sky/60 p-3 text-sm font-semibold"><p>{formError}</p>{canResend && <Button type="button" variant="outline" disabled={busy} onClick={resendVerification} className="mt-3 w-full rounded-full bg-white">{busy ? "Sending…" : "Resend verification email"}</Button>}</div>}
              <Button type="submit" disabled={busy} className="h-12 w-full rounded-full">{busy ? "One moment…" : mode === "signup" ? "Create Account" : mode === "forgot" ? "Send reset link" : "Log In"}</Button>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                {mode === "signin" ? (
                  <><button type="button" className="underline-offset-4 hover:underline" onClick={() => changeMode("signup")}>New here? Join</button><button type="button" className="text-muted-foreground underline-offset-4 hover:underline" onClick={() => changeMode("forgot")}>Forgot password?</button></>
                ) : (
                  <button type="button" className="underline-offset-4 hover:underline" onClick={() => changeMode("signin")}>I already have an account</button>
                )}
              </div>
            </form>
          )}
        </div>
        <button onClick={() => { enterDemo(); navigate({ to: "/home" }); }} className="mt-5 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline">Just looking? Explore the demo with fictional data →</button>
      </div>
    </div>
  );
}
