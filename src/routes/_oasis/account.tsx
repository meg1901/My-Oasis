import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAct, useData } from "@/lib/queries";
import { AFFIRMATION_CATEGORIES, CAMPUSES, type Profile } from "@/lib/types";
import { Avatar, AVATARS } from "@/components/brand/Avatar";
import { PageHeader } from "@/components/oasis/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StudentCharacter } from "@/components/oasis/rewind/StudentCharacter";
import { resolveCharacter } from "@/lib/rewind-character";
export const Route = createFileRoute("/_oasis/account")({
  head: () => ({
    meta: [
      { title: "Your account | OASIS" },
      { name: "description", content: "Your private OASIS student profile and preferences." },
      { property: "og:title", content: "Your account | OASIS" },
      {
        property: "og:description",
        content: "Personalize your OASIS profile and affirmation preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});
function Account() {
  const { api, profile } = useData();
  const [draft, setDraft] = useState<Partial<Profile>>({});
  const p = { ...profile.data, ...draft };
  const update = useAct((values: Partial<Profile>) => api.updateProfile(values), ["profile"]);
  const field = (key: keyof Profile, value: string) =>
    setDraft((d) => ({ ...d, [key]: value || null }));
  const textField = (
    key: "preferred_name" | "college" | "degree_program",
    label: string,
    maxLength = 120,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        value={p[key] ?? ""}
        onChange={(e) => field(key, e.target.value)}
        maxLength={maxLength}
        required={key === "preferred_name"}
        className="h-12 bg-background"
      />
    </div>
  );
  const selectField = (
    key: "gender" | "student_level" | "academic_year" | "campus",
    label: string,
    options: readonly string[],
  ) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <select
        id={key}
        value={p[key] ?? ""}
        onChange={(e) => field(key, e.target.value)}
        className="h-12 w-full rounded-md border border-input bg-background px-3 text-base"
      >
        <option value="">Not specified</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
  return (
    <div>
      <PageHeader eyebrow="Your account" title="A little more you">
        Your space, your preferences. Your profile is never shown on the Positivity Wall.
      </PageHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await update.mutateAsync(draft);
            setDraft({});
            toast.success("Profile saved");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save your profile");
          }
        }}
      >
        <div className="grid gap-8 xl:grid-cols-[300px_1fr]">
          <aside className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar kind={p.avatar ?? "cloud"} size={96} />
              <div>
                <h2 className="text-2xl font-semibold">{p.preferred_name ?? "Your profile"}</h2>
                <p>{api.mode === "demo" ? "Fictional demo student" : "ASU student"}</p>
              </div>
            </div>
            <p className="font-semibold">Choose your avatar</p>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((a) => (
                <Button
                  key={a.id}
                  type="button"
                  variant="outline"
                  title={a.label}
                  aria-label={a.label}
                  aria-pressed={p.avatar === a.id}
                  onClick={() => field("avatar", a.id)}
                  className={cn("h-20 p-1", p.avatar === a.id && "border-2 border-navy bg-sky")}
                >
                  <Avatar kind={a.id} size={60} />
                </Button>
              ))}
            </div>
            <fieldset className="space-y-2">
              <legend className="font-semibold">Your Rewind character</legend>
              <select aria-label="Character preference" value={p.character_preference ?? ""} onChange={(e) => setDraft((d) => ({ ...d, character_preference: e.target.value === "male" || e.target.value === "female" ? e.target.value : null }))} className="h-12 w-full rounded-md border border-input bg-background px-3">
                <option value="">Match my profile</option>
                <option value="male">Male student</option>
                <option value="female">Female student</option>
              </select>
              <StudentCharacter avatar={p.avatar ?? "cloud"} appearance={resolveCharacter(p)} size={120} action="smiling" backpack={false} className="mx-auto" />
            </fieldset>
            <p className="flex items-start gap-2 text-sm">
              <ShieldCheck className="size-5 shrink-0 text-teal" />
              Only you can see and edit this information.
            </p>
          </aside>
          <div className="space-y-6">
            <h2 className="border-b pb-3 text-2xl font-semibold">About you</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {textField("preferred_name", "Preferred name", 40)}
              <div className="space-y-2">
                <Label htmlFor="account-email">ASU email address</Label>
                <Input id="account-email" value={p.email ?? ""} readOnly className="h-12 bg-mist" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  min={13}
                  max={120}
                  value={p.age ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, age: e.target.value ? Number(e.target.value) : null }))
                  }
                  className="h-12"
                />
              </div>
              {selectField("gender", "Gender (optional)", [
                "Woman",
                "Man",
                "Nonbinary",
                "Self described",
                "Prefer not to say",
              ])}
            </div>
            <h2 className="border-b pb-3 text-2xl font-semibold">Your student life</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {textField("college", "College or school")}
              {textField("degree_program", "Degree program")}
              {selectField("student_level", "Student level", ["Undergraduate", "Graduate"])}
              {selectField("academic_year", "Academic year", [
                "First year",
                "Second year",
                "Third year",
                "Fourth year",
                "Fifth year or beyond",
              ])}
              {selectField("campus", "ASU campus", CAMPUSES)}
            </div>
            <h2 className="border-b pb-3 text-2xl font-semibold">Words that speak to you</h2>
            <div className="flex flex-wrap gap-2">
              {AFFIRMATION_CATEGORIES.map((c) => {
                const selected = p.affirmation_categories?.includes(c.id) ?? false;
                return (
                  <Button
                    type="button"
                    key={c.id}
                    variant={selected ? "default" : "outline"}
                    aria-pressed={selected}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        affirmation_categories: selected
                          ? (p.affirmation_categories ?? []).filter((v) => v !== c.id)
                          : [...(p.affirmation_categories ?? []), c.id],
                      }))
                    }
                  >
                    {c.label}
                  </Button>
                );
              })}
            </div>
            <Button type="submit" disabled={update.isPending || !profile.data} size="lg">
              <Save className="size-4" />
              {update.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
