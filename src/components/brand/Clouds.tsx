import { cn } from "@/lib/utils";

function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 80" className={className} style={style} aria-hidden>
      <path d="M30 70 C10 70 6 50 22 44 C20 26 44 18 56 30 C64 10 98 8 106 30 C118 20 144 24 146 42 C170 38 186 56 172 70 Z" fill="var(--white)" />
    </svg>
  );
}

/** Slowly drifting clouds behind content. */
export function Clouds({ className, density = 5 }: { className?: string; density?: number }) {
  const clouds = [
    { top: "6%", w: 220, dur: 80, delay: -10, op: 0.9 },
    { top: "18%", w: 140, dur: 110, delay: -60, op: 0.7 },
    { top: "34%", w: 260, dur: 140, delay: -30, op: 0.6 },
    { top: "52%", w: 180, dur: 95, delay: -75, op: 0.5 },
    { top: "70%", w: 240, dur: 130, delay: -100, op: 0.45 },
    { top: "84%", w: 160, dur: 120, delay: -20, op: 0.4 },
  ].slice(0, density);
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {clouds.map((c, i) => (
        <Cloud
          key={i}
          className="absolute left-0 animate-drift"
          style={{ top: c.top, width: c.w, opacity: c.op, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
        />
      ))}
    </div>
  );
}

export function Stars({ count = 40, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const x = (i * 37.3) % 100;
        const y = (i * 61.7) % 100;
        const s = 1 + ((i * 13) % 3);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-background animate-twinkle"
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${(i % 7) * 0.4}s` }}
          />
        );
      })}
    </div>
  );
}
