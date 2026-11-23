import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import {
  BookHeart,
  Film,
  HeartHandshake,
  Home,
  LifeBuoy,
  LogOut,
  SmilePlus,
  Sparkles,
  Wind,
  UserRound,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { demoApi, liveApi } from "@/lib/api";
import { ApiContext } from "@/lib/api-context";
import { exitDemo, isDemo } from "@/lib/mode";
import { Wordmark } from "@/components/brand/Wordmark";
import { Clouds } from "@/components/brand/Clouds";
import { OasiCompanion } from "@/components/oasis/OasiCompanion";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/_oasis")({
  ssr: false,
  beforeLoad: async () => {
    if (isDemo()) return { mode: "demo" as const };
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth", search: { mode: "signin", reason: "verify" } });
    }
    const p = await liveApi.getProfile();
    if (!p.onboarded) throw redirect({ to: "/onboarding" });
    return { mode: "live" as const };
  },
  component: Shell,
});
const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/mood", label: "Mood", icon: SmilePlus },
  { to: "/affirmations", label: "Affirm", icon: Sparkles },
  { to: "/wall", label: "Wall", icon: HeartHandshake },
  { to: "/reset", label: "Reset", icon: Wind },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/rewind", label: "Rewind", icon: Film },
  { to: "/resources", label: "Support", icon: LifeBuoy },
] as const;
function Shell() {
  const { mode } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function leave() {
    await queryClient.cancelQueries();
    queryClient.clear();
    if (mode === "demo") exitDemo();
    else await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <ApiContext.Provider value={mode === "demo" ? demoApi : liveApi}>
      <div className="relative min-h-screen bg-mist pb-24 lg:pb-6">
        <Clouds density={6} className="shared-clouds" />
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-background px-5 py-6 lg:flex">
          <Link to="/home" aria-label="OASIS home">
            <Wordmark size={49} />
            <p className="mt-3 text-sm font-semibold">Your pause in the chaos.</p>
          </Link>
          <nav aria-label="Main" className="mt-9 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition hover:bg-mist"
                activeProps={{ className: "bg-sky" }}
              >
                <n.icon className="size-5" />
                {n.label === "Affirm"
                  ? "Affirmations"
                  : n.label === "Wall"
                    ? "Positivity Wall"
                    : n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-3 border-t pt-5">
            <Link
              to="/account"
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold"
              activeProps={{ className: "bg-sky" }}
            >
              <UserRound className="size-5" />
              My account
            </Link>
            <Button variant="ghost" onClick={leave} className="justify-start">
              <LogOut className="size-5" />
              {mode === "demo" ? "Exit demo" : "Log out"}
            </Button>
          </div>
        </aside>
        <div className="lg:ml-60">
          {mode === "demo" && (
            <div className="relative z-10 flex items-center justify-center gap-3 bg-sky px-3 py-2 text-sm">
              <span>
                <b>Demo mode</b> · Ansh’s fictional student life. Changes stay in this preview.
              </span>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={leave}>
                Exit
              </Button>
            </div>
          )}
          <header className="relative z-20 flex items-center justify-between border-b bg-background px-4 py-4 lg:hidden">
            <Link to="/home">
              <Wordmark size={40} />
              <p className="mt-1 text-xs font-semibold">Your pause in the chaos.</p>
            </Link>
            <div className="flex gap-1">
              <Button asChild variant="ghost" size="icon">
                <Link to="/account" aria-label="My account">
                  <UserRound />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Log out" onClick={leave}>
                <LogOut />
              </Button>
            </div>
          </header>
          <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 sm:px-6 xl:px-8">
            <Outlet />
          </main>
        </div>
        <nav
          className="fixed inset-x-2 bottom-2 z-30 grid grid-cols-8 rounded-2xl border bg-background p-1 shadow-soft lg:hidden"
          aria-label="Main mobile"
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex min-w-0 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold"
              activeProps={{ className: "bg-sky" }}
            >
              <n.icon className="size-5" />
              {n.label}
            </Link>
          ))}
        </nav>
        <OasiCompanion />
      </div>
    </ApiContext.Provider>
  );
}
