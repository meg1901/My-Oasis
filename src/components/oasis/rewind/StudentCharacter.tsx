import { cn } from "@/lib/utils";
import type { CharacterAppearance } from "@/lib/rewind-character";

export type StudentAction = "walking" | "typing" | "waving" | "smiling" | "reading" | "talking" | "celebrating" | "breathing" | "exercising";
const AVATAR_STYLES = ["cloud", "sun", "cactus", "bear", "penguin", "moon", "turtle", "star"];
interface StudentCharacterProps {
  avatar?: string | null;
  appearance?: CharacterAppearance;
  action?: StudentAction;
  size?: number;
  className?: string;
  mirrored?: boolean;
  backpack?: boolean;
  friend?: boolean;
}

/** Every moving joint is local to its parent: hands follow wrists, forearms follow elbows. */
function Arm({ side, action, skin, shirt }: { side: "left" | "right"; action: StudentAction; skin: string; shirt: string }) {
  const direction = side === "left" ? -1 : 1;
  const raised = action === "celebrating" || action === "exercising";
  const waving = side === "right" && (action === "waving" || action === "talking");
  const desk = action === "typing" || action === "reading";
  const elbow = raised ? [direction * 25, -28] : waving ? [22, -12] : desk ? [direction * 12, 35] : [direction * 12, 32];
  const wrist = raised ? [direction * 5, -32] : waving ? [-2, -42] : desk ? [-direction * 30, -7] : action === "breathing" ? [-direction * 22, 26] : [direction * 2, 32];
  const [ex = 0, ey = 0] = elbow;
  const [wx = 0, wy = 0] = wrist;
  return <g transform={`translate(${side === "left" ? 78 : 142} 141)`}>
    <g className={`student-arm-${side} student-joint`}>
      <path d={`M0 0 L${ex} ${ey}`} fill="none" stroke={skin} strokeWidth="17" strokeLinecap="round" />
      <path d={`M0 0 L${ex * .35} ${ey * .35}`} fill="none" stroke={shirt} strokeWidth="20" strokeLinecap="round" />
      <g transform={`translate(${ex} ${ey})`}>
        <g className={`student-forearm-${side} student-joint`}>
          <path d={`M0 0 L${wx} ${wy}`} fill="none" stroke={skin} strokeWidth="15" strokeLinecap="round" />
          <g transform={`translate(${wx} ${wy})`}>
            <circle r="8.5" fill={skin} />
            {action === "exercising" && <g stroke="var(--navy)" strokeWidth="5" strokeLinecap="round"><path d="M-17 0 H17" /><path d="M-17 -12 V12 M17 -12 V12" strokeWidth="9" /></g>}
          </g>
        </g>
      </g>
    </g>
  </g>;
}

function Leg({ side }: { side: "left" | "right" }) {
  return <g transform={`translate(${side === "left" ? 94 : 126} 205)`}>
    <g className={`student-leg-${side} student-joint`}>
      <path d="M0 0 V30" stroke="var(--navy)" strokeWidth="24" strokeLinecap="round" />
      <g transform="translate(0 30)">
        <g className={`student-knee-${side} student-joint`}>
          <path d="M0 0 V29" stroke="var(--navy)" strokeWidth="22" strokeLinecap="round" />
          <path d="M-12 23 H11 L18 37 Q0 44 -16 37Z" fill="var(--white)" stroke="var(--navy)" strokeWidth="3" strokeLinejoin="round" />
        </g>
      </g>
    </g>
  </g>;
}

export function StudentCharacter({ avatar = "cloud", appearance = "male", action = "smiling", size = 220, className, mirrored = false, backpack = true, friend = false }: StudentCharacterProps) {
  const styleIndex = Math.max(0, AVATAR_STYLES.indexOf(avatar ?? "cloud"));
  const skin = ["var(--skin-light)", "var(--skin-medium)", "var(--skin-deep)"][styleIndex % 3] ?? "var(--skin-light)";
  const shirt = friend ? "var(--sky)" : "var(--primary-blue)";
  const breathing = action === "breathing";
  return <svg viewBox="0 0 220 300" width={size} height={size * 300 / 220} className={cn("student-character h-auto shrink-0", `student-${action}`, className)} role="img" aria-label={friend ? "A fellow student" : `${appearance === "female" ? "Female" : "Male"} student character in your monthly story`}>
    <g transform={mirrored ? "translate(220 0) scale(-1 1)" : undefined}>
      <ellipse className="student-shadow" cx="110" cy="282" rx="57" ry="10" fill="var(--navy)" opacity=".12" />
      <g className="student-body">
        {backpack && !breathing && <g><path d="M55 139 Q40 146 43 197 L52 222 Q63 231 78 219 L82 151 Q73 135 55 139Z" fill="var(--navy)" /><path d="M49 185 Q60 178 75 184 L73 211 Q59 218 49 207Z" fill="var(--primary-blue)" /></g>}
        {breathing ? <g><path d="M102 214 Q67 214 52 248 Q73 263 111 243 M118 214 Q153 214 168 248 Q147 263 109 243" fill="var(--navy)" /><path d="M52 248 Q45 253 54 260 L81 259 M168 248 Q175 253 166 260 L139 259" fill="var(--white)" /></g> : <><Leg side="left" /><Leg side="right" /></>}
        {appearance === "female" && <path d="M69 81 Q57 140 72 158 Q86 148 86 122 H135 Q138 152 151 158 Q162 111 151 76Z" fill="var(--navy)" />}
        <path d="M72 130 Q110 113 148 130 L143 215 Q110 225 77 215Z" fill={shirt} stroke="var(--navy)" strokeWidth="3" />
        <path d="M88 145 Q110 156 132 145" fill="none" stroke="var(--white)" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        <Arm side="left" action={action} skin={skin} shirt={shirt} />
        <Arm side="right" action={action} skin={skin} shirt={shirt} />
        {action === "reading" && <g><path d="M72 174 Q92 165 110 178 Q128 165 148 174 L145 211 Q126 201 110 212 Q94 201 75 211Z" fill="var(--white)" stroke="var(--navy)" strokeWidth="3" /><path className="student-book-page" d="M110 178 V211 M81 185 Q94 179 103 185 M118 185 Q131 179 140 184" fill="none" stroke="var(--primary-blue)" strokeWidth="3" /></g>}
        <g transform="translate(110 123)"><g className="student-head student-joint">
          <rect x="-10" y="-11" width="20" height="24" rx="8" fill={skin} />
          <circle cx="-37" cy="-37" r="9" fill={skin} /><circle cx="37" cy="-37" r="9" fill={skin} />
          <ellipse cx="0" cy="-41" rx="40" ry="46" fill={skin} stroke="var(--navy)" strokeWidth="3" />
          <path d={appearance === "female" ? "M-41 -44 Q-46 -93 -1 -95 Q43 -97 42 -43 L29 -61 Q12 -65 2 -81 Q-9 -56 -41 -44Z" : styleIndex % 2 === 0 ? "M-40 -46 Q-44 -93 -1 -94 Q42 -95 41 -47 Q27 -64 17 -75 Q-8 -58 -40 -46Z" : "M-41 -46 Q-45 -89 -5 -94 Q41 -99 43 -48 L30 -64 L21 -78 L9 -66 L-5 -80 L-19 -64Z"} fill="var(--navy)" />
          <g fill="var(--navy)">{breathing || action === "reading" ? <g fill="none" stroke="var(--navy)" strokeWidth="4" strokeLinecap="round"><path d="M-26 -37 Q-18 -30 -10 -37 M10 -37 Q18 -30 26 -37" /></g> : <><ellipse cx="-18" cy="-39" rx="4.5" ry="6" /><ellipse cx="18" cy="-39" rx="4.5" ry="6" /><circle cx="-16.5" cy="-41" r="1.5" fill="var(--white)" /><circle cx="19.5" cy="-41" r="1.5" fill="var(--white)" /></>}</g>
          <path className="student-mouth" d="M-14 -20 Q0 -7 14 -20" fill="none" stroke="var(--navy)" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="-28" cy="-24" rx="7" ry="3.5" fill="var(--sky)" opacity=".75" /><ellipse cx="28" cy="-24" rx="7" ry="3.5" fill="var(--sky)" opacity=".75" />
        </g></g>
      </g>
    </g>
  </svg>;
}
