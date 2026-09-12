"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const TICK_MS = 200;

type PlaybackContextValue = {
  currentMs: number;
  durationMs: number;
  playing: boolean;
  rate: number;
  muted: boolean;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  seek: (ms: number) => void;
  skip: (deltaMs: number) => void;
  cycleRate: () => void;
  toggleMuted: () => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

const RATES = [1, 1.25, 1.5, 2];

export function PlaybackProvider({
  durationMs,
  children,
}: {
  durationMs: number;
  children: ReactNode;
}) {
  const [currentMs, setCurrentMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  useEffect(() => {
    if (!playing) return;

    const interval = window.setInterval(() => {
      setCurrentMs((prev) => {
        const next = prev + TICK_MS * rateRef.current;
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [playing, durationMs]);

  const clamp = useCallback(
    (ms: number) => Math.min(Math.max(0, ms), durationMs),
    [durationMs]
  );

  const seek = useCallback((ms: number) => setCurrentMs(clamp(ms)), [clamp]);

  const value = useMemo<PlaybackContextValue>(
    () => ({
      currentMs,
      durationMs,
      playing,
      rate,
      muted,
      toggle: () => setPlaying((p) => !p),
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      seek,
      skip: (deltaMs: number) => setCurrentMs((prev) => clamp(prev + deltaMs)),
      cycleRate: () =>
        setRate((prev) => RATES[(RATES.indexOf(prev) + 1) % RATES.length]),
      toggleMuted: () => setMuted((m) => !m),
    }),
    [currentMs, durationMs, playing, rate, muted, seek, clamp]
  );

  return (
    <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlayback must be used within PlaybackProvider");
  return ctx;
}
