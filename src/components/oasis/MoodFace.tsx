import type { Mood } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Faithful sun, cloud, cross, crescent and shoulder silhouettes from the approved reference. */
export function MoodFace({ mood, size = 84, selected = false }: { mood: Mood; size?: number; selected?: boolean }) {
  return <svg viewBox="0 0 100 100" width={size} height={size} className={cn("mood-face size-auto max-w-full shrink-0", selected && "mood-face-selected")} role="img" aria-label={`${mood} face${selected ? ", selected" : ""}`}>
    <g strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {mood === "amazing" ? <>
        <path d="M50 7 V18 M50 82 V93 M7 50 H18 M82 50 H93 M20 20 L28 28 M72 72 L80 80 M20 80 L28 72 M72 28 L80 20" stroke="var(--primary-blue)" fill="none" />
        <circle cx="50" cy="50" r="24" fill="var(--sky)" stroke="var(--navy)" />
        <g className="mood-features"><circle cx="41" cy="47" r="2.5" fill="var(--navy)" /><circle cx="59" cy="47" r="2.5" fill="var(--navy)" /><path d="M39 58 Q50 65 61 58" stroke="var(--navy)" fill="none" /></g>
      </> : mood === "good" ? <>
        <path d="M32 29 C9 29 8 61 28 69 C42 78 65 77 79 65 C96 49 84 21 66 24 C72 35 70 48 62 51 C54 55 39 51 34 44 C30 39 29 34 32 29Z" fill="var(--sky)" />
        <g className="mood-features"><circle cx="40" cy="51" r="2.5" fill="var(--navy)" /><circle cx="59" cy="51" r="2.5" fill="var(--navy)" /><path d="M40 61 Q50 67 60 61" stroke="var(--navy)" fill="none" /></g>
      </> : mood === "okay" ? <>
        <path d="M49 20 V79 M49 44 H68 M49 56 H30" fill="none" stroke="var(--primary-blue)" strokeWidth="11" />
        <path d="M49 19 V33" stroke="var(--sky)" strokeWidth="10" />
        <g className="mood-features"><circle cx="38" cy="24" r="2.2" fill="var(--navy)" /><circle cx="53" cy="24" r="2.2" fill="var(--navy)" /><path d="M39 30 H51" stroke="var(--navy)" fill="none" /></g>
      </> : mood === "low" ? <>
        <path d="M58 15 C24 16 24 69 58 71 C39 66 35 27 58 15Z" fill="var(--sky)" />
        <path d="M58 15 C24 16 24 69 58 71" fill="none" stroke="var(--navy)" />
        <g className="mood-features"><circle cx="51" cy="37" r="2.2" fill="var(--navy)" /><circle cx="65" cy="39" r="2.2" fill="var(--navy)" /><path d="M50 49 Q57 53 66 50" fill="none" stroke="var(--navy)" /></g>
        <circle cx="18" cy="21" r="1.6" fill="var(--primary-blue)" /><circle cx="27" cy="12" r="1.6" fill="var(--sky)" />
      </> : <>
        <path d="M12 61 Q25 39 50 40 Q70 41 88 58" fill="none" stroke="var(--navy)" opacity=".65" />
        <path d="M18 77 Q34 55 54 65 Q69 70 85 77" fill="none" stroke="var(--primary-blue)" />
        <circle cx="51" cy="39" r="18" fill="var(--sky)" stroke="var(--navy)" />
        <g className="mood-features"><circle cx="45" cy="37" r="1.9" fill="var(--navy)" /><circle cx="57" cy="37" r="1.9" fill="var(--navy)" /><path d="M44 46 H59" fill="none" stroke="var(--navy)" /></g>
      </>}
    </g>
  </svg>;
}
