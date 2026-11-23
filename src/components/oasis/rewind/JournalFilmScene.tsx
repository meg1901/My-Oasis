import type { CharacterAppearance } from "@/lib/rewind-character";
import type { ReactNode } from "react";
import { Oasi } from "@/components/brand/Oasi";
import type { MonthStats } from "@/lib/stats";
import type { RewindMoment } from "@/lib/rewind-story";
import { StudentCharacter } from "./StudentCharacter";

function SkyAndCampus({ children, campus = true }: { children?: ReactNode; campus?: boolean }) {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="1000" height="560" fill="var(--sky)" />
      <circle cx="830" cy="92" r="55" fill="var(--white)" opacity=".82" />
      <g className="film-cloud film-cloud-one" fill="var(--white)" opacity=".9">
        <path d="M40 142 C14 140 12 110 39 105 C37 77 75 68 91 91 C110 58 161 70 161 105 C195 98 213 134 185 145Z" />
      </g>
      <g className="film-cloud film-cloud-two" fill="var(--white)" opacity=".68">
        <path d="M600 110 C579 108 577 86 598 80 C599 57 629 52 641 70 C656 45 692 54 694 81 C721 75 735 103 712 112Z" />
      </g>
      {campus && (
        <g>
          <path d="M0 363 Q230 337 465 361 T1000 349 V560 H0Z" fill="var(--mist)" />
          <path d="M0 457 Q298 408 1000 460 V560 H0Z" fill="var(--white)" opacity=".75" />
          <g fill="var(--primary-blue)" opacity=".45">
            <path d="M36 337 V228 H242 V337Z" />
            <path d="M63 228 L139 181 L216 228Z" />
            <path d="M761 348 V246 H954 V348Z" />
            <path d="M785 246 L857 202 L930 246Z" />
          </g>
          <g fill="var(--white)" opacity=".85">
            {Array.from({ length: 5 }, (_, i) => <rect key={`wl-${i}`} x={60 + i * 34} y="253" width="19" height="31" rx="4" />)}
            {Array.from({ length: 5 }, (_, i) => <rect key={`wr-${i}`} x={786 + i * 32} y="269" width="18" height="30" rx="4" />)}
          </g>
          <g className="film-palms" stroke="var(--navy)" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".5">
            <path d="M284 356 Q279 288 291 242 M291 244 Q263 220 245 236 M291 244 Q319 216 340 234 M291 244 Q288 213 302 200" />
            <path d="M710 355 Q716 302 706 266 M706 267 Q682 244 664 258 M706 267 Q733 241 751 256 M706 267 Q707 240 720 229" />
          </g>
          <path d="M351 560 Q423 402 530 363 Q617 403 679 560Z" fill="var(--sky)" opacity=".75" />
        </g>
      )}
      {children}
    </svg>
  );
}

function Confetti({ count = 18 }: { count?: number }) {
  return (
    <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const x = 70 + ((i * 137) % 860);
        const y = 50 + ((i * 67) % 180);
        return (
          <rect
            key={i}
            className="film-confetti-piece"
            x={x}
            y={y}
            width={i % 3 === 0 ? 10 : 7}
            height={i % 3 === 0 ? 22 : 15}
            rx="3"
            fill={i % 3 === 0 ? "var(--white)" : i % 3 === 1 ? "var(--navy)" : "var(--primary-blue)"}
            style={{ animationDelay: `${(i % 7) * -0.35}s` }}
          />
        );
      })}
    </svg>
  );
}

function Desk({ assignment = false }: { assignment?: boolean }) {
  return (
    <svg className="absolute inset-0 z-20 size-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g className="film-desk">
        <rect x="248" y="367" width="514" height="28" rx="12" fill="var(--navy)" />
        <path d="M288 391 L269 548 M721 391 L742 548" stroke="var(--navy)" strokeWidth="20" strokeLinecap="round" />
        <g className="film-laptop">
          <path d="M404 242 H604 Q620 242 616 260 L595 356 H414 L392 260 Q388 242 404 242Z" fill="var(--white)" stroke="var(--navy)" strokeWidth="7" />
          <path d="M382 357 H626 L649 374 H365Z" fill="var(--primary-blue)" stroke="var(--navy)" strokeWidth="6" />
          <path className="film-code-line" d="M433 277 H525 M433 298 H567 M433 319 H502" stroke="var(--primary-blue)" strokeWidth="8" strokeLinecap="round" />
        </g>
        <g className="film-books">
          <rect x="656" y="320" width="95" height="20" rx="5" fill="var(--white)" stroke="var(--navy)" strokeWidth="4" />
          <rect x="668" y="296" width="83" height="22" rx="5" fill="var(--primary-blue)" stroke="var(--navy)" strokeWidth="4" />
          <rect x="654" y="272" width="96" height="22" rx="5" fill="var(--white)" stroke="var(--navy)" strokeWidth="4" />
        </g>
        <g className="film-coffee">
          <path d="M291 304 H350 L344 359 H298Z" fill="var(--white)" stroke="var(--navy)" strokeWidth="5" />
          <path d="M350 315 Q381 311 370 340 Q362 351 347 345" fill="none" stroke="var(--navy)" strokeWidth="6" />
          <path className="film-steam" d="M307 290 Q296 275 309 260 M329 290 Q342 275 329 257" fill="none" stroke="var(--white)" strokeWidth="6" strokeLinecap="round" />
        </g>
        {assignment && (
          <g className="film-complete-badge">
            <circle cx="687" cy="164" r="58" fill="var(--white)" stroke="var(--navy)" strokeWidth="5" />
            <path d="M658 165 L680 186 L718 139" fill="none" stroke="var(--olive)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
    </svg>
  );
}

function CareerBooths() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g className="film-booth film-booth-left">
        <rect x="52" y="187" width="269" height="196" rx="20" fill="var(--white)" stroke="var(--navy)" strokeWidth="5" />
        <path d="M40 187 H333 L310 137 H66Z" fill="var(--primary-blue)" stroke="var(--navy)" strokeWidth="5" />
        <text x="186" y="172" textAnchor="middle" fill="var(--navy)" fontSize="25" fontWeight="700">CAREER FAIR</text>
        <circle cx="105" cy="250" r="24" fill="var(--sky)" />
        <path d="M91 251 Q105 264 119 251" fill="none" stroke="var(--navy)" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="film-booth film-booth-right">
        <rect x="715" y="211" width="234" height="172" rx="20" fill="var(--white)" stroke="var(--navy)" strokeWidth="5" />
        <path d="M700 211 H963 L943 165 H720Z" fill="var(--primary-blue)" stroke="var(--navy)" strokeWidth="5" />
        <text x="832" y="198" textAnchor="middle" fill="var(--navy)" fontSize="24" fontWeight="700">HELLO!</text>
      </g>
    </svg>
  );
}

function GymEquipment() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path d="M0 420 H1000" stroke="var(--navy)" strokeWidth="9" opacity=".3" />
      <g className="film-gym-rack" fill="none" stroke="var(--navy)" strokeWidth="12" strokeLinecap="round" opacity=".55">
        <path d="M104 420 V180 H273 V420 M104 222 H273 M126 180 V151 H250 V180" />
        <path d="M753 420 V251 M910 420 V251 M735 266 H928" />
      </g>
      <g fill="var(--white)" stroke="var(--navy)" strokeWidth="5" opacity=".85">
        <circle cx="142" cy="344" r="35" /><circle cx="222" cy="344" r="35" />
        <circle cx="795" cy="354" r="29" /><circle cx="868" cy="354" r="29" />
      </g>
    </svg>
  );
}

function BreathingSky() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="1000" height="560" fill="var(--mist)" />
      <g className="film-breath-rings" fill="none" stroke="var(--primary-blue)" strokeWidth="5" opacity=".35">
        <circle cx="500" cy="303" r="127" /><circle cx="500" cy="303" r="174" /><circle cx="500" cy="303" r="224" />
      </g>
      <g className="film-cloud film-cloud-one" fill="var(--white)"><path d="M35 186 C5 180 13 142 44 145 C46 104 98 99 116 132 C149 90 209 118 199 159 C237 153 251 190 216 198Z" /></g>
      <g className="film-cloud film-cloud-two" fill="var(--white)"><path d="M690 145 C664 140 670 110 697 111 C704 78 743 79 755 106 C782 78 826 98 819 128 C850 125 861 154 834 161Z" /></g>
      <path d="M0 467 Q250 423 500 466 T1000 455 V560 H0Z" fill="var(--sky)" />
    </svg>
  );
}

function ReflectionBench() {
  return (
    <svg className="absolute inset-0 z-10 size-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g className="film-bench" stroke="var(--navy)" strokeWidth="8" strokeLinecap="round">
        <path d="M302 391 H698 M328 337 H672 V391 H328Z" fill="var(--white)" />
        <path d="M357 391 L337 505 M643 391 L663 505" />
      </g>
    </svg>
  );
}

function Caption({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mx-auto mt-3 max-w-3xl text-center text-navy">
      <p className="font-display text-xl font-semibold sm:text-2xl">{title}</p>
      {text && <blockquote className="mt-1 line-clamp-2 text-sm leading-snug sm:text-base">“{text}”</blockquote>}
    </div>
  );
}

const stageClass = "relative mx-auto aspect-[4/5] max-h-[62dvh] w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-sky shadow-soft sm:aspect-[16/8.5]";
const mainCharacterClass = "absolute bottom-[7%] left-[35%] z-10 w-[38%] sm:bottom-[5%] sm:left-[38%] sm:w-[25%]";

export function JournalFilmScene({ moment, avatar, appearance }: { moment: RewindMoment; avatar: string; appearance: CharacterAppearance }) {
  let visual: ReactNode;
  switch (moment.activity) {
    case "career":
      visual = <><SkyAndCampus campus={false} /><CareerBooths /><StudentCharacter avatar={avatar} appearance={appearance} action="waving" className="absolute bottom-[5%] left-[27%] z-10 w-[39%] sm:left-[34%] sm:w-[25%]" /><StudentCharacter avatar="moon" action="talking" backpack={false} friend mirrored className="absolute bottom-[5%] right-[7%] z-10 hidden w-[22%] sm:block" /></>;
      break;
    case "study":
      visual = <><SkyAndCampus campus={false} /><StudentCharacter avatar={avatar} appearance={appearance} action="typing" className="absolute bottom-[21%] left-[34%] z-10 w-[38%] sm:left-[38%] sm:w-[25%]" /><Desk /></>;
      break;
    case "assignment":
      visual = <><SkyAndCampus campus={false} /><StudentCharacter avatar={avatar} appearance={appearance} action="celebrating" className="absolute bottom-[21%] left-[34%] z-10 w-[38%] sm:left-[38%] sm:w-[25%]" /><Desk assignment /><Confetti count={12} /></>;
      break;
    case "gym":
      visual = <><SkyAndCampus campus={false} /><GymEquipment /><StudentCharacter avatar={avatar} appearance={appearance} action="exercising" className={mainCharacterClass} /></>;
      break;
    case "friends":
      visual = <><SkyAndCampus /><StudentCharacter avatar={avatar} appearance={appearance} action="talking" className="absolute bottom-[5%] left-[29%] z-10 w-[43%] sm:left-[37%] sm:w-[25%]" /><StudentCharacter avatar="bear" action="waving" backpack={false} friend className="absolute bottom-[5%] left-[3%] z-10 hidden w-[24%] sm:block" /><StudentCharacter avatar="penguin" action="smiling" backpack={false} friend mirrored className="absolute bottom-[5%] right-[3%] z-10 hidden w-[24%] sm:block" /></>;
      break;
    case "breathing":
      visual = <><BreathingSky /><StudentCharacter avatar={avatar} appearance={appearance} action="breathing" className="absolute bottom-[3%] left-[31%] z-10 w-[44%] sm:left-[37%] sm:w-[27%]" /></>;
      break;
    case "difficult":
      visual = <><SkyAndCampus /><svg className="absolute inset-0 z-10 size-full" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" aria-hidden><g className="film-storm-cloud" fill="var(--navy)" opacity=".38"><path d="M128 175 C64 170 60 107 117 100 C119 41 196 35 223 84 C268 22 355 60 342 121 C407 112 432 175 373 190Z" /><path d="M558 141 C510 137 511 91 552 84 C557 42 613 38 635 75 C671 30 735 58 728 104 C774 98 790 143 748 153Z" /></g></svg><StudentCharacter avatar={avatar} appearance={appearance} action="walking" className={mainCharacterClass} /></>;
      break;
    case "celebration":
      visual = <><SkyAndCampus /><Confetti /><StudentCharacter avatar={avatar} appearance={appearance} action="celebrating" className={mainCharacterClass} /></>;
      break;
    case "class":
      visual = <><SkyAndCampus /><StudentCharacter avatar={avatar} appearance={appearance} action="walking" className={mainCharacterClass} /></>;
      break;
    default:
      visual = <><SkyAndCampus /><ReflectionBench /><StudentCharacter avatar={avatar} appearance={appearance} action="reading" className="absolute bottom-[8%] left-[34%] z-20 w-[39%] sm:left-[38%] sm:w-[25%]" /></>;
  }
  return <div><div className={stageClass}>{visual}</div><Caption title={moment.caption} text={moment.text} /></div>;
}

export function OpeningFilmScene({ name, month, avatar, appearance }: { name: string; month: string; avatar: string; appearance: CharacterAppearance }) {
  return (
    <div>
      <div className={stageClass}>
        <SkyAndCampus />
        <Oasi size={130} mood="happy" className="absolute right-[8%] top-[37%] z-10 w-[24%] sm:top-[15%] sm:w-[14%]" />
        <StudentCharacter avatar={avatar} appearance={appearance} action="walking" className={mainCharacterClass} />
        <div className="absolute inset-x-5 top-[8%] z-20 text-center text-navy sm:left-[8%] sm:right-auto sm:top-[17%] sm:max-w-md sm:text-left">
          <p className="text-sm font-bold uppercase tracking-[0.2em]">{month}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-5xl">{name}, this was your month.</h2>
        </div>
      </div>
      <Caption title="A little film made from the moments you chose." />
    </div>
  );
}

export function ReflectionFilmScene({ stats, avatar, appearance }: { stats: MonthStats; avatar: string; appearance: CharacterAppearance }) {
  const reflection = stats.checkIns || stats.journalCount
    ? `You checked in ${stats.checkIns} time${stats.checkIns === 1 ? "" : "s"} and made room for ${stats.journalCount} journal ${stats.journalCount === 1 ? "entry" : "entries"}.`
    : "This was a quieter month in OASIS. There is always room to begin again.";
  return (
    <div>
      <div className={stageClass}>
        <BreathingSky />
        <ReflectionBench />
        <StudentCharacter avatar={avatar} appearance={appearance} action="reading" className="absolute bottom-[8%] left-[34%] z-20 w-[39%] sm:left-[38%] sm:w-[25%]" />
        <div className="absolute left-[5%] top-[8%] rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-navy sm:text-lg">{stats.daysCheckedIn} days noticed</div>
        <div className="absolute right-[5%] top-[15%] rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-navy sm:text-lg">{stats.smallWins} small wins</div>
      </div>
      <Caption title="You kept noticing what mattered." text={reflection} />
    </div>
  );
}

export function ClosingFilmScene({ avatar, appearance }: { avatar: string; appearance: CharacterAppearance }) {
  return (
    <div>
      <div className={stageClass}>
        <SkyAndCampus />
        <Confetti count={22} />
        <StudentCharacter avatar={avatar} appearance={appearance} action="celebrating" className={mainCharacterClass} />
        <Oasi size={120} mood="wow" className="absolute right-[8%] top-[19%] z-10 w-[24%] sm:w-[14%]" />
        <div className="absolute inset-x-5 top-[7%] z-20 text-center text-navy">
          <h2 className="font-display text-3xl font-semibold sm:text-5xl">Look how far you’ve come.</h2>
          <p className="mt-2 text-lg font-semibold sm:text-2xl">Every little moment mattered.</p>
        </div>
      </div>
      <Caption title="Your pause in the chaos." />
    </div>
  );
}
