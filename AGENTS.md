<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- App screens live under the `_oasis` pathless layout (client-only) so the same pages serve signed-in users and the fictional demo mode; pages read data only through `useApi()` (live vs demo implementations in `src/lib/api.ts`).
- Personalization and navigation suggestions use pure local functions in `src/lib/personalization.ts`; no model provider is required, so all wellness features remain available offline from a provider.
- Student profile extensions are additive and owner-scoped; signup domain enforcement runs on the auth lifecycle so direct registration cannot bypass it. Protected student routes require a confirmed email, and login redirects by profile completion.
- The welcome overlay runs once per browser session and respects reduced motion; route changes never restart it.
- Wall posts are inserted only by the `submitPost` server function after moderation; clients cannot read `author_id`.
- Button icon sizing excludes SVGs with explicit size classes so illustrated avatars and mood faces retain their dimensions.
- Rewind is a 54-second story; `rewind-story.ts` intersects selected owner entries with the chosen previous/current period, while fictional snapshots are demo-only, preventing fallback leakage.
- Character appearance resolves an independent persisted profile preference before gender; local nested SVG joints attach hands to forearms and limbs to shoulder/hip pivots so animation cannot detach body parts.
- Shared cloud backgrounds use an explicit fixed class instead of conflicting absolute/fixed utilities so every tab retains visible scenery.
