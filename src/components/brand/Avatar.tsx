import { Oasi } from "./Oasi";
export const AVATARS = [
  { id: "cloud", label: "Smiling cloud" },
  { id: "sun", label: "Happy sun" },
  { id: "cactus", label: "Friendly cactus" },
  { id: "bear", label: "Blue bear" },
  { id: "penguin", label: "Tiny penguin" },
  { id: "moon", label: "Smiling moon" },
  { id: "turtle", label: "Baby turtle" },
  { id: "star", label: "Cute star" },
] as const;
export function Avatar({ kind = "cloud", size = 72 }: { kind?: string; size?: number }) {
  if (kind === "cloud") return <Oasi size={size} float={false} />;
  return (
    <svg
      className="size-auto shrink-0"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={AVATARS.find((a) => a.id === kind)?.label ?? "Avatar"}
    >
      <circle cx="50" cy="50" r="48" fill="var(--mist)" />
      <g stroke="var(--navy)" strokeWidth="2" strokeLinejoin="round">
        {kind === "sun" && (
          <>
            <g stroke="var(--teal)" strokeWidth="4" strokeLinecap="round">
              <path d="M50 12v9m0 58v9M12 50h9m58 0h9M23 23l7 7m40 40 7 7M23 77l7-7m40-40 7-7" />
            </g>
            <circle cx="50" cy="50" r="27" fill="var(--primary-blue)" />
          </>
        )}
        {kind === "cactus" && (
          <>
            <path
              d="M40 81V32a10 10 0 0 1 20 0v49M40 54H28a8 8 0 0 1-8-8V34h10v10h10M60 60h12a8 8 0 0 0 8-8V40H70v10H60"
              fill="var(--primary-blue)"
            />
            <path d="M35 80h30l-4 12H39z" fill="var(--sky)" />
          </>
        )}
        {kind === "bear" && (
          <>
            <circle cx="28" cy="28" r="12" fill="var(--sky)" />
            <circle cx="72" cy="28" r="12" fill="var(--sky)" />
            <ellipse cx="50" cy="53" rx="31" ry="32" fill="var(--sky)" />
            <ellipse cx="50" cy="63" rx="14" ry="11" fill="var(--offwhite)" />
          </>
        )}
        {kind === "penguin" && (
          <>
            <ellipse cx="50" cy="53" rx="28" ry="36" fill="var(--navy)" />
            <ellipse cx="50" cy="56" rx="22" ry="28" fill="var(--offwhite)" />
            <path d="M23 78h19l-4 10H21zm35 0h19l2 10H62z" fill="var(--primary-blue)" />
            <path d="m44 53 6 7 6-7z" fill="var(--teal)" />
          </>
        )}
        {kind === "moon" && (
          <path d="M65 16C29 10 8 56 37 78c24 19 48 1 50-16C49 81 29 39 65 16Z" fill="var(--sky)" />
        )}
        {kind === "turtle" && (
          <>
            <ellipse cx="50" cy="62" rx="28" ry="20" fill="var(--primary-blue)" />
            <circle cx="50" cy="35" r="19" fill="var(--sky)" />
            <path
              d="M24 57 12 64l14 9M76 57l12 7-14 9M31 77l-7 11h14m31-11 7 11H62"
              fill="var(--sky)"
            />
            <path d="m50 47 16 14-8 18H42l-8-18z" fill="var(--teal)" />
          </>
        )}
        {kind === "star" && (
          <path d="m50 10 13 25 28 5-20 21 3 29-24-13-24 13 3-29L9 40l28-5z" fill="var(--primary-blue)" />
        )}
      </g>
      <g fill="var(--navy)">
        <circle cx={kind === "cactus" ? 46 : 40} cy={kind === "turtle" ? 33 : 46} r="3" />
        <circle cx={kind === "cactus" ? 54 : 60} cy={kind === "turtle" ? 33 : 46} r="3" />
      </g>
      {kind !== "penguin" && (
        <path
          d={
            kind === "turtle"
              ? "M44 40q6 7 12 0"
              : kind === "cactus"
                ? "M46 57q4 5 8 0"
                : "M44 59q6 8 12 0"
          }
          stroke="var(--navy)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}
