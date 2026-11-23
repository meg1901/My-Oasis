const BLOCK =
  /\b(kill|die|stupid|idiot|hate you|ugly|loser|fuck|shit|bitch|retard|slut|whore|nazi|porn|nude|rape|suicide)\b/i;
const PII =
  /(\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b|@[a-z0-9_]{2,}|[^\s@]+@[^\s@]+\.[a-z]{2,}|https?:\/\/|\b(instagram|snapchat|insta|snap|discord|tiktok)\b)/i;
export type ModerationResult = { status: "approved" | "pending"; note: string };
export function moderateContent(body: string): ModerationResult {
  if (PII.test(body))
    return {
      status: "pending",
      note: "This may contain contact information. The wall stays anonymous.",
    };
  if (BLOCK.test(body)) return { status: "pending", note: "Held for moderator review." };
  return { status: "approved", note: "" };
}
