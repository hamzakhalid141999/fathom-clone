"use client";

import {
  ClipToolbar,
  type ClipSelection,
} from "@/components/meeting-detail/clip-toolbar";
import {
  CommentComposer,
  CommentCountBadge,
  CommentThread,
} from "@/components/meeting-detail/transcript-comments";
import { formatTimestamp, initials } from "@/lib/format";
import { usePlayback } from "@/lib/playback-context";
import type { Meeting, TranscriptComment, TranscriptSegment } from "@/lib/types/meeting";
import { cn, hasTextSelection } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { Check, Copy, MessageSquarePlus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SpeakerGroup = {
  speakerId: string;
  speakerName: string;
  avatarColor?: string;
  startMs: number;
  segments: TranscriptSegment[];
};

function groupBySpeaker(segments: TranscriptSegment[], meeting: Meeting): SpeakerGroup[] {
  const groups: SpeakerGroup[] = [];

  for (const segment of segments) {
    const last = groups[groups.length - 1];
    if (last && last.speakerId === segment.speakerId) {
      last.segments.push(segment);
      continue;
    }
    groups.push({
      speakerId: segment.speakerId,
      speakerName: segment.speakerName,
      avatarColor: meeting.participants.find((p) => p.id === segment.speakerId)
        ?.avatarColor,
      startMs: segment.startMs,
      segments: [segment],
    });
  }

  return groups;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="rounded bg-accent/30 text-text">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function TranscriptPanel({
  meeting,
  comments,
  onAddComment,
}: {
  meeting: Meeting;
  comments: TranscriptComment[];
  onAddComment: (segmentId: string, text: string, timestampMs: number) => void;
}) {
  const { currentMs, seek, play } = usePlayback();
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [composerFor, setComposerFor] = useState<string | null>(null);
  const [threadFor, setThreadFor] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clipSelection, setClipSelection] = useState<ClipSelection | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // Once a clip is created the toolbar shows its success state, so clearing the
  // text selection must not tear it down.
  const [clipFrozen, setClipFrozen] = useState(false);
  const clipFrozenRef = useRef(false);
  clipFrozenRef.current = clipFrozen;

  /** Derives a clip candidate from the current DOM selection inside the transcript. */
  const readSelection = useCallback(() => {
    const container = bodyRef.current;
    const selection = window.getSelection();
    if (!container || !selection || selection.isCollapsed || selection.rangeCount === 0) {
      return null;
    }

    const text = selection.toString().trim();
    if (text.length < 2) return null;

    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return null;

    const covered = Array.from(
      container.querySelectorAll<HTMLElement>("[data-segment-id]")
    ).filter((node) => selection.containsNode(node, true));

    const segments = covered
      .map((node) =>
        meeting.transcript.find((segment) => segment.id === node.dataset.segmentId)
      )
      .filter((segment): segment is TranscriptSegment => Boolean(segment));

    if (segments.length === 0) return null;

    const rect = range.getBoundingClientRect();
    return {
      text,
      segments,
      anchor: { x: rect.left + rect.width / 2, y: rect.top - 10 },
    } satisfies ClipSelection;
  }, [meeting.transcript]);

  useEffect(() => {
    function onMouseUp() {
      if (clipFrozenRef.current) return;
      const next = readSelection();
      if (next) setClipSelection(next);
    }

    function onSelectionChange() {
      if (clipFrozenRef.current) return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) setClipSelection(null);
    }

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [readSelection]);

  const filtered = useMemo(() => {
    if (!query.trim()) return meeting.transcript;
    const q = query.toLowerCase();
    return meeting.transcript.filter(
      (segment) =>
        segment.text.toLowerCase().includes(q) ||
        segment.speakerName.toLowerCase().includes(q)
    );
  }, [meeting.transcript, query]);

  const groups = useMemo(() => groupBySpeaker(filtered, meeting), [filtered, meeting]);

  const activeSegmentId = useMemo(() => {
    const active = meeting.transcript.find(
      (segment) => currentMs >= segment.startMs && currentMs < segment.endMs
    );
    return active?.id ?? null;
  }, [meeting.transcript, currentMs]);

  async function copyTranscript() {
    const text = meeting.transcript
      .map(
        (segment) =>
          `${segment.speakerName} ${formatTimestamp(segment.startMs)}\n${segment.text}`
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-text">Transcript</h3>
        <div className="flex items-center gap-2">
          <label className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-8 w-56 rounded-lg border border-border bg-bg-input pl-8 pr-2.5 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-accent"
            />
          </label>
          <button
            type="button"
            onClick={copyTranscript}
            aria-label="Copy transcript"
            className="rounded-lg bg-bg-surface p-1.5 text-text-muted transition hover:bg-bg-hover hover:text-text"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="mt-8 text-sm text-text-muted">
          No transcript lines match “{query}”.
        </p>
      ) : (
        <div ref={bodyRef} className="mt-5 space-y-6">
          {groups.map((group) => (
            <div key={`${group.speakerId}-${group.startMs}`}>
              <div className="flex items-center gap-2">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-bg"
                  style={{ backgroundColor: group.avatarColor ?? "#71717a" }}
                >
                  {initials(group.speakerName)}
                </span>
                <span className="text-sm font-medium text-text">
                  {group.speakerName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    seek(group.startMs);
                    play();
                  }}
                  className="font-mono text-xs text-text-muted transition hover:text-accent"
                >
                  {formatTimestamp(group.startMs)}
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {group.segments.map((segment) => {
                  const segmentComments = comments.filter(
                    (comment) => comment.segmentId === segment.id
                  );
                  const isActive = segment.id === activeSegmentId;
                  const isHovered = hoveredId === segment.id;

                  return (
                    <div
                      key={segment.id}
                      className="relative"
                      onMouseEnter={() => setHoveredId(segment.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (hasTextSelection()) return;
                          seek(segment.startMs);
                          play();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            seek(segment.startMs);
                            play();
                          }
                        }}
                        className="-mx-3 flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 outline-none transition-colors hover:bg-bg-hover"
                      >
                        <p
                          data-segment-id={segment.id}
                          className={cn(
                            "min-w-0 flex-1 select-text text-sm leading-relaxed transition-colors",
                            isActive ? "text-accent" : "text-text-muted"
                          )}
                        >
                          {highlight(segment.text, query)}
                        </p>

                        <div
                          className="flex shrink-0 items-center gap-1.5 pt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {segmentComments.length > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setThreadFor((prev) =>
                                  prev === segment.id ? null : segment.id
                                )
                              }
                              aria-label="View comments"
                            >
                              <CommentCountBadge count={segmentComments.length} />
                            </button>
                          ) : null}

                          <button
                            type="button"
                            aria-label="Leave a comment"
                            onClick={() => {
                              setThreadFor(null);
                              setComposerFor((prev) =>
                                prev === segment.id ? null : segment.id
                              );
                            }}
                            className={cn(
                              "rounded-md p-0.5 text-text-faint transition hover:text-accent",
                              isHovered || composerFor === segment.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          >
                            <MessageSquarePlus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {composerFor === segment.id ? (
                          <div className="absolute right-8 top-0 z-40">
                            <CommentComposer
                              onSubmit={(text) => {
                                onAddComment(segment.id, text, segment.startMs);
                                setComposerFor(null);
                                setThreadFor(segment.id);
                              }}
                              onDismiss={() => setComposerFor(null)}
                            />
                          </div>
                        ) : null}

                        {threadFor === segment.id && segmentComments.length > 0 ? (
                          <div className="absolute right-8 top-0 z-40">
                            <CommentThread
                              comments={segmentComments}
                              onReply={(text) =>
                                onAddComment(segment.id, text, segment.startMs)
                              }
                            />
                          </div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {clipSelection ? (
          <ClipToolbar
            key="clip-toolbar"
            meeting={meeting}
            selection={clipSelection}
            onCreated={() => setClipFrozen(true)}
            onDismiss={() => {
              setClipFrozen(false);
              setClipSelection(null);
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
