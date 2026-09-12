"use client";

import { buildSeedClips } from "@/lib/data/seed-clips";
import type { NewSharedClip, SharedClip } from "@/lib/types/clip";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "fathom.clips.v1";

type ClipsContextValue = {
  clips: SharedClip[];
  /** False until localStorage has been read, so pages can avoid a false "not found". */
  hydrated: boolean;
  createClip: (input: NewSharedClip) => SharedClip;
  getClip: (shareId: string) => SharedClip | undefined;
  getClipsForMeeting: (meetingId: string) => SharedClip[];
  deleteClip: (id: string) => void;
  shareUrl: (clip: SharedClip) => string;
};

const ClipsContext = createContext<ClipsContextValue | null>(null);

function readStored(): SharedClip[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SharedClip[]) : null;
  } catch {
    return null;
  }
}

function writeStored(clips: SharedClip[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
  } catch {
    // Storage can be unavailable (private mode, quota) — clips stay in memory.
  }
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

/** Encodes a clip into a share URL hash so links open in browsers with empty storage. */
export function encodeClipPayload(clip: SharedClip) {
  return btoa(encodeURIComponent(JSON.stringify(clip)));
}

export function decodeClipPayload(payload: string): SharedClip | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(payload)));
    return parsed && parsed.shareId ? (parsed as SharedClip) : null;
  } catch {
    return null;
  }
}

export function ClipsProvider({ children }: { children: ReactNode }) {
  const [clips, setClips] = useState<SharedClip[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setClips(stored);
    } else {
      const seeds = buildSeedClips();
      setClips(seeds);
      writeStored(seeds);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      const stored = readStored();
      if (stored) setClips(stored);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: SharedClip[]) => {
    setClips(next);
    writeStored(next);
  }, []);

  const createClip = useCallback(
    (input: NewSharedClip) => {
      const suffix = Math.random().toString(36).slice(2, 7);
      const clip: SharedClip = {
        ...input,
        id: `clip_${Date.now().toString(36)}_${suffix}`,
        shareId: `${slug(input.meetingTitle) || "clip"}-${suffix}`,
        createdAt: new Date().toISOString(),
      };
      persist([clip, ...clips]);
      return clip;
    },
    [clips, persist]
  );

  const value = useMemo<ClipsContextValue>(
    () => ({
      clips,
      hydrated,
      createClip,
      getClip: (shareId) => clips.find((clip) => clip.shareId === shareId),
      getClipsForMeeting: (meetingId) =>
        clips.filter((clip) => clip.meetingId === meetingId),
      deleteClip: (id) => persist(clips.filter((clip) => clip.id !== id)),
      shareUrl: (clip) =>
        `${window.location.origin}/share/${clip.shareId}#d=${encodeClipPayload(clip)}`,
    }),
    [clips, hydrated, createClip, persist]
  );

  return <ClipsContext.Provider value={value}>{children}</ClipsContext.Provider>;
}

export function useClips() {
  const ctx = useContext(ClipsContext);
  if (!ctx) throw new Error("useClips must be used within ClipsProvider");
  return ctx;
}
