"use client";

import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function VideoStep({
  src,
  startPlayback,
  onDone,
  onBack,
}: {
  src: string;
  /** False until the full-screen blackout has faded away. */
  startPlayback: boolean;
  /** Fired when the clip ends or the user skips. */
  onDone: () => void;
  onBack: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setProgress(0);
    setPaused(true);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !startPlayback) return;
    const play = video.play();
    if (play) play.catch(() => setPaused(true));
  }, [startPlayback]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  return (
    <div className="relative w-full max-w-[900px] overflow-hidden rounded-2xl bg-black shadow-[0_40px_120px_rgba(0,0,0,0.75)]">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        onEnded={onDone}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onClick={togglePlay}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (video.duration) setProgress(video.currentTime / video.duration);
        }}
        className="block h-auto w-full cursor-pointer"
      />

      {paused && startPlayback ? (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black transition hover:bg-white"
        >
          <Play className="ml-0.5 h-7 w-7 fill-current" />
        </button>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/75 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-7">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-white/12 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-white"
        >
          Skip
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
        <div
          className="h-full bg-[#00c0fb] transition-[width] duration-200 ease-linear"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
