"use client";

import { formatTimestamp } from "@/lib/format";
import { useClips } from "@/lib/clips-context";
import type { SharedClip } from "@/lib/types/clip";
import type { Meeting, TranscriptSegment } from "@/lib/types/meeting";
import { motion } from "framer-motion";
import { Check, ExternalLink, Link2, Scissors, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type ClipSelection = {
  text: string;
  segments: TranscriptSegment[];
  /** Viewport coordinates of the selection, used to place the floating action. */
  anchor: { x: number; y: number };
};

function speakerLabel(segments: TranscriptSegment[]) {
  const speakers = Array.from(new Set(segments.map((s) => s.speakerName)));
  if (speakers.length <= 1) return speakers[0] ?? "Unknown speaker";
  return `${speakers[0]} + ${speakers.length - 1} other${speakers.length > 2 ? "s" : ""}`;
}

export function ClipToolbar({
  meeting,
  selection,
  onCreated,
  onDismiss,
}: {
  meeting: Meeting;
  selection: ClipSelection;
  /** Lets the parent keep this mounted once the success state is showing. */
  onCreated: () => void;
  onDismiss: () => void;
}) {
  const { createClip, shareUrl } = useClips();
  const [created, setCreated] = useState<SharedClip | null>(null);
  const [copied, setCopied] = useState(false);

  const first = selection.segments[0];
  const last = selection.segments[selection.segments.length - 1];
  const startMs = first?.startMs ?? 0;
  const endMs = last?.endMs ?? startMs;

  function create() {
    const clip = createClip({
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      meetingDate: meeting.startedAt,
      text: selection.text,
      speaker: speakerLabel(selection.segments),
      segmentIds: selection.segments.map((s) => s.id),
      startMs,
      endMs,
      createdBy: "Hamza Khalid",
    });
    setCreated(clip);
    onCreated();
    window.getSelection()?.removeAllRanges();
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(shareUrl(created));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  const left = Math.min(Math.max(selection.anchor.x, 150), window.innerWidth - 150);
  const top = Math.max(selection.anchor.y, 70);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{ left, top }}
      className="fixed z-[90] -translate-x-1/2 -translate-y-full"
      onMouseDown={(e) => e.preventDefault()}
    >
      {created ? (
        <div className="w-[300px] rounded-xl border border-border bg-[#1a1a1e] p-3 shadow-2xl shadow-black/60">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">Clip created</p>
              <p className="mt-0.5 font-mono text-xs text-text-muted">
                {formatTimestamp(created.startMs)} – {formatTimestamp(created.endMs)} ·{" "}
                {created.speaker}
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="rounded-md p-0.5 text-text-faint transition hover:text-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-bg transition hover:bg-accent-strong"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  Copy link
                </>
              )}
            </button>
            <Link
              href={`/share/${created.shareId}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-bg-surface px-2.5 py-1.5 text-xs text-text-muted transition hover:bg-bg-hover hover:text-text"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open clip
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={create}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-[#1a1a1e] px-3 py-2 shadow-2xl shadow-black/60 transition hover:border-accent"
        >
          <Scissors className="h-3.5 w-3.5 text-accent" />
          <span className="text-sm font-medium text-text">Create clip</span>
          <span className="font-mono text-xs text-text-muted">
            {formatTimestamp(startMs)} – {formatTimestamp(endMs)}
          </span>
        </button>
      )}
    </motion.div>
  );
}
