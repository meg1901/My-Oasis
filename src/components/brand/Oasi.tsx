import { cn } from "@/lib/utils";

export type OasiMood = "happy" | "calm" | "wow";

/** OASI: a rounded sky-blue cloud bot. */
export function Oasi({ size = 96, mood = "happy", float = true, className }: { size?: number; mood?: OasiMood; float?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={size * (100 / 120)}
      className={cn("size-auto shrink-0", float && "animate-bob", "drop-shadow-[0_10px_18px_color-mix(in_oklab,var(--navy)_22%,transparent)]", className)}
      role="img"
      aria-label="OASI, your cloud companion"
    >
      <g fill="var(--sky)" stroke="color-mix(in oklab, var(--navy) 18%, transparent)" strokeWidth="1.5">
        <path d="M28 82 C12 82 6 68 14 58 C8 44 22 32 34 38 C38 22 58 16 70 28 C82 18 104 26 102 44 C116 48 116 74 98 80 C94 84 88 84 84 82 Z" />
      </g>
      <path d="M32 44 C40 36 52 36 58 40" stroke="var(--offwhite)" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" fill="none" />
      <g className="animate-blink" fill="var(--navy)">
        {mood === "calm" ? (
          <>
            <path d="M42 58 q5 4 10 0" stroke="var(--navy)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M70 58 q5 4 10 0" stroke="var(--navy)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="47" cy="57" rx="4" ry={mood === "wow" ? 5.5 : 4.6} />
            <ellipse cx="75" cy="57" rx="4" ry={mood === "wow" ? 5.5 : 4.6} />
            <circle cx="48.5" cy="55.5" r="1.3" fill="var(--offwhite)" />
            <circle cx="76.5" cy="55.5" r="1.3" fill="var(--offwhite)" />
          </>
        )}
      </g>
      {mood === "wow" ? (
        <ellipse cx="61" cy="70" rx="4" ry="4.5" fill="var(--navy)" />
      ) : (
        <path d="M53 67 Q61 75 69 67" stroke="var(--navy)" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      <ellipse cx="38" cy="66" rx="5" ry="3" fill="var(--primary-blue)" />
      <ellipse cx="84" cy="66" rx="5" ry="3" fill="var(--primary-blue)" />
    </svg>
  );
}
