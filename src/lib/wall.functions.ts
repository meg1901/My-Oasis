import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Public check used by demo mode (nothing is stored). */
export const previewModeration = createServerFn({ method: "POST" })
  .inputValidator(z.object({ body: z.string().min(3).max(280) }))
  .handler(async ({ data }) => {
    const { moderate } = await import("@/server/moderation.server");
    return moderate(data.body);
  });

export const submitPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ body: z.string().trim().min(3).max(280), passForward: z.boolean().default(false) }))
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string }).email ?? "";
    if (!/@asu\.edu$/i.test(email)) {
      return { ok: false as const, message: "Posting to the wall is for verified @asu.edu accounts." };
    }
    const { moderate } = await import("@/server/moderation.server");
    const m = await moderate(data.body);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("positivity_posts").insert({
      author_id: context.userId, body: data.body, status: m.status, moderation_note: m.note || null, is_pass_forward: data.passForward,
    });
    if (error) return { ok: false as const, message: "Couldn't post right now. Please try again." };
    return { ok: true as const, status: m.status, note: m.note };
  });
