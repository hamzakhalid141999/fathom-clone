"use client";

import { formatDuration } from "@/lib/format";
import { usePlayback } from "@/lib/playback-context";
import { cn } from "@/lib/utils";
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRef } from "react";

export function PlayerStub() {
  const {
    currentMs,
    durationMs,
    playing,
    rate,
    muted,
    toggle,
    skip,
    seek,
    cycleRate,
    toggleMuted,
  } = usePlayback();
  const trackRef = useRef<HTMLDivElement>(null);

  const progress = durationMs > 0 ? (currentMs / durationMs) * 100 : 0;

  function seekFromPointer(clientX: number) {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    seek(ratio * durationMs);
  }

  return (
    <div className="shrink-0 bg-bg-elevated">
      <div className="flex items-center justify-center gap-6 px-4 py-5">
        <button
          type="button"
          onClick={() => skip(-10_000)}
          aria-label="Rewind 10 seconds"
          className="relative text-text-muted transition hover:text-text"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold">
            10
          </span>
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="text-text transition hover:scale-105 hover:text-white"
        >
          {playing ? (
            <Pause className="h-7 w-7 fill-current" />
          ) : (
            <Play className="h-7 w-7 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(10_000)}
          aria-label="Forward 10 seconds"
          className="relative text-text-muted transition hover:text-text"
        >
          <RotateCw className="h-5 w-5" />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold">
            10
          </span>
        </button>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(durationMs / 1000)}
        aria-valuenow={Math.round(currentMs / 1000)}
        onClick={(e) => seekFromPointer(e.clientX)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") skip(5_000);
          if (e.key === "ArrowLeft") skip(-5_000);
        }}
        className="group relative h-1 cursor-pointer bg-[#2a2a30]"
      >
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent opacity-0 transition group-hover:opacity-100"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5 text-xs text-text-muted">
        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "Unmute" : "Mute"}
          className="transition hover:text-text"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <span className="font-mono">
          {formatDuration(currentMs)} / {formatDuration(durationMs)}
        </span>
        <button
          type="button"
          onClick={cycleRate}
          className={cn(
            "ml-auto rounded-md px-1.5 py-0.5 font-medium transition hover:bg-bg-hover hover:text-text",
            rate !== 1 && "text-accent"
          )}
        >
          {rate}x
        </button>
      </div>
    </div>
  );
}
