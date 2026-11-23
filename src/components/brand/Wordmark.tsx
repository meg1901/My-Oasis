import { cn } from "@/lib/utils";

/** Lowercase "oasis" wordmark; the first "o" is a smiling face. */
export function Wordmark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("inline-flex items-center font-brand font-semibold leading-none tracking-normal text-navy", className)}
      style={{ fontSize: size }}
      aria-label="oasis"
    >
      <svg viewBox="0 0 40 40" width={size * 0.82} height={size * 0.82} aria-hidden className="mr-[0.03em] translate-y-[0.06em]">
        <circle cx="20" cy="20" r="15.5" fill="var(--sky)" stroke="currentColor" strokeWidth="5" />
        <g className="animate-blink">
          <circle cx="14.5" cy="18" r="2.3" fill="currentColor" />
          <circle cx="25.5" cy="18" r="2.3" fill="currentColor" />
        </g>
        <path d="M14 24 Q20 29.5 26 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="11" cy="23" r="2" fill="var(--primary-blue)" />
        <circle cx="29" cy="23" r="2" fill="var(--primary-blue)" />
      </svg>
      <span aria-hidden>asis</span>
    </span>
  );
}
