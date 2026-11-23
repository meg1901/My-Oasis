import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, X, Volume2, VolumeX, RotateCcw, Maximize, ChevronLeft, ChevronRight } from "lucide-react";
import type { CharacterAppearance } from "@/lib/rewind-character";
import type { MonthStats } from "@/lib/stats";
import { buildStoryMoments, REWIND_TOTAL_MS, type RewindHighlightInput } from "@/lib/rewind-story";
import { Button } from "@/components/ui/button";
import { startPad } from "@/lib/sound";
import { ClosingFilmScene, JournalFilmScene, OpeningFilmScene, ReflectionFilmScene } from "./rewind/JournalFilmScene";

export interface RewindData {
  name: string;
  month: string;
  stats: MonthStats;
  highlights: string[];
  moments?: RewindHighlightInput[];
  narrative: string;
  narrativeSource: "template";
  isDemo: boolean;
  avatar?: string | null;
  character?: CharacterAppearance;
}

export { REWIND_TOTAL_MS };

type FilmScene =
  | { key: string; kind: "opening" }
  | { key: string; kind: "moment"; momentIndex: number }
  | { key: string; kind: "reflection" }
  | { key: string; kind: "closing" };

export function RewindPlayer({ data, onClose }: { data: RewindData; onClose: () => void }) {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [music, setMusic] = useState(false);
  const [ended, setEnded] = useState(false);
  const stopMusic = useRef<(() => void) | null>(null);
  const surface = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const moments = useMemo(
    () => buildStoryMoments(data.moments ?? data.highlights.map((text, i) => ({ id: `highlight-${i}`, text, createdAt: new Date(2000, 0, i + 1).toISOString() }))),
    [data.highlights, data.moments],
  );
  const scenes = useMemo<FilmScene[]>(() => [
    { key: "opening", kind: "opening" },
    ...moments.map((moment, momentIndex) => ({ key: moment.id, kind: "moment" as const, momentIndex })),
    { key: "reflection", kind: "reflection" },
    { key: "closing", kind: "closing" },
  ], [moments]);
  const sceneDuration = REWIND_TOTAL_MS / scenes.length;
  const progress = Math.min(100, ((scene * sceneDuration + elapsed) / REWIND_TOTAL_MS) * 100);

  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      stopMusic.current?.();
    };
  }, []);

  useEffect(() => {
    if (paused || ended) return;
    const timer = setInterval(() => setElapsed((value) => Math.min(sceneDuration, value + 100)), 100);
    return () => clearInterval(timer);
  }, [paused, ended, sceneDuration, scene]);

  useEffect(() => {
    if (elapsed < sceneDuration) return;
    if (scene === scenes.length - 1) {
      setEnded(true);
      setPaused(true);
      stopMusic.current?.();
      stopMusic.current = null;
      setMusic(false);
    } else {
      setScene((value) => value + 1);
      setElapsed(0);
    }
  }, [elapsed, scene, sceneDuration, scenes.length]);

  useEffect(() => {
    if (!paused) return;
    stopMusic.current?.();
    stopMusic.current = null;
    setMusic(false);
  }, [paused]);

  const move = useCallback((delta: number) => {
    setScene((value) => Math.max(0, Math.min(scenes.length - 1, value + delta)));
    setElapsed(0);
    setEnded(false);
  }, [scenes.length]);

  const replay = useCallback(() => {
    setScene(0);
    setElapsed(0);
    setEnded(false);
    setPaused(false);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
      if (event.code === "Space") {
        event.preventDefault();
        if (ended) replay();
        else setPaused((value) => !value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ended, move, onClose, replay]);

  const toggleMusic = () => {
    if (music) {
      stopMusic.current?.();
      stopMusic.current = null;
      setMusic(false);
    } else {
      stopMusic.current = startPad();
      setMusic(true);
    }
  };

  const current = scenes[scene] ?? scenes[0];
  let visual;
  if (current?.kind === "opening") visual = <OpeningFilmScene name={data.name} month={data.month} avatar={data.avatar ?? "cloud"} appearance={data.isDemo ? "male" : data.character ?? "male"} />;
  else if (current?.kind === "moment") {
    const moment = moments[current.momentIndex];
    visual = moment ? <JournalFilmScene moment={moment} avatar={data.avatar ?? "cloud"} appearance={data.isDemo ? "male" : data.character ?? "male"} /> : null;
  } else if (current?.kind === "reflection") visual = <ReflectionFilmScene stats={data.stats} avatar={data.avatar ?? "cloud"} appearance={data.isDemo ? "male" : data.character ?? "male"} />;
  else visual = <ClosingFilmScene avatar={data.avatar ?? "cloud"} appearance={data.isDemo ? "male" : data.character ?? "male"} />;

  return createPortal(
    <motion.div
      ref={surface}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="OASIS Rewind animated film"
      className={`fixed inset-0 z-[60] flex h-dvh flex-col overflow-hidden bg-mist text-navy ${paused ? "rewind-paused" : ""}`}
    >
      <div className="relative z-30 bg-white/90 px-4 pt-4 shadow-sm backdrop-blur sm:px-8">
        <div className="flex gap-1.5" role="progressbar" aria-label="Film progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          {scenes.map((item, index) => (
            <div key={item.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy/15">
              <div className="h-full rounded-full bg-primary-blue" style={{ width: index < scene ? "100%" : index === scene ? `${(elapsed / sceneDuration) * 100}%` : "0%" }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold sm:text-sm">
            {data.isDemo ? "Ansh’s fictional month" : data.month} · Scene {scene + 1} of {scenes.length}
          </p>
          <Button variant="ghost" size="icon" aria-label="Close Rewind" onClick={onClose} className="text-navy hover:bg-sky/60"><X /></Button>
        </div>
      </div>

      <div className="relative grid min-h-0 flex-1 place-items-center overflow-y-auto px-3 py-4 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.key}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 45, scale: 1.035 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -35, scale: 0.99 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.65, ease: "easeOut" }}
            className="w-full max-w-6xl"
          >
            {visual}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-30 flex items-center justify-center gap-1 bg-white/90 px-2 pb-4 pt-3 shadow-sm backdrop-blur sm:gap-2">
        <Button variant="ghost" size="icon" aria-label="Previous scene" disabled={scene === 0} onClick={() => move(-1)} className="hover:bg-sky/60"><ChevronLeft /></Button>
        <Button variant="ghost" size="icon" aria-label={paused ? "Play" : "Pause"} onClick={() => (ended ? replay() : setPaused((value) => !value))} className="bg-sky hover:bg-primary-blue/40">{paused ? <Play /> : <Pause />}</Button>
        <Button variant="ghost" size="icon" aria-label="Replay" onClick={replay} className="hover:bg-sky/60"><RotateCcw /></Button>
        <Button variant="ghost" size="icon" aria-label={music ? "Mute music" : "Play soft music"} onClick={toggleMusic} className="hover:bg-sky/60">{music ? <Volume2 /> : <VolumeX />}</Button>
        <Button variant="ghost" size="icon" aria-label="Full screen" onClick={() => { if (document.fullscreenElement) document.exitFullscreen(); else surface.current?.requestFullscreen().catch(() => {}); }} className="hover:bg-sky/60"><Maximize /></Button>
        <Button variant="ghost" size="icon" aria-label="Next scene" disabled={scene === scenes.length - 1} onClick={() => move(1)} className="hover:bg-sky/60"><ChevronRight /></Button>
      </div>
    </motion.div>,
    document.body,
  );
}
