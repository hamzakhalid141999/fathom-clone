"use client";

import { decodeClipPayload, useClips } from "@/lib/clips-context";
import { getMeetingById } from "@/lib/data/meetings";
import { formatMeetingDate, formatTimestamp, initials } from "@/lib/format";
import type { SharedClip } from "@/lib/types/clip";
import type { TranscriptSegment } from "@/lib/types/meeting";
import { ArrowUpRight, Calendar, Clock, Scissors } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SharedClipPage() {
  const params = useParams<{ clipId: string }>();
  const shareId = params.clipId;
  const { getClip, hydrated } = useClips();
  const [fromLink, setFromLink] = useState<SharedClip | null>(null);

  // Links opened in a browser with empty storage still resolve, because the
  // clip payload travels in the URL hash.
  useEffect(() => {
    const match = window.location.hash.match(/(?:^#|&)d=([^&]+)/);
    if (match) setFromLink(decodeClipPayload(match[1]));
  }, []);

  const clip = getClip(shareId) ?? fromLink;

  const context = useMemo(() => {
    if (!clip) return null;
    const meeting = getMeetingById(clip.meetingId);
    if (!meeting) return null;

    const indices = clip.segmentIds
      .map((id) => meeting.transcript.findIndex((segment) => segment.id === id))
      .filter((index) => index >= 0);
    if (indices.length === 0) return null;

    const before = meeting.transcript[Math.min(...indices) - 1] as
      | TranscriptSegment
      | undefined;
    const after = meeting.transcript[Math.max(...indices) + 1] as
      | TranscriptSegment
      | undefined;
    return { before, after };
  }, [clip]);

  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <Link href="/meetings" className="flex items-center gap-2">
            <Image
              src="/assets/logo/logo.svg"
              alt="Fathom"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            <span className="text-sm font-semibold tracking-[0.18em] text-text">
              FATHOM
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-text-muted">
            <Scissors className="h-3 w-3 text-accent" />
            Shared clip
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        {!clip ? (
          hydrated ? (
            <div className="rounded-2xl border border-border bg-bg-surface px-6 py-10 text-center">
              <h1 className="text-lg font-semibold text-text">Clip not found</h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
                This clip may have been deleted, or the link was opened without its
                share data.
              </p>
              <Link
                href="/meetings"
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-bg transition hover:bg-accent-strong"
              >
                Browse meetings
              </Link>
            </div>
          ) : (
            <div className="h-64 animate-pulse rounded-2xl border border-border bg-bg-surface" />
          )
        ) : (
          <article>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              {clip.meetingTitle}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatMeetingDate(clip.meetingDate)}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <Clock className="h-3.5 w-3.5" />
                {formatTimestamp(clip.startMs)} – {formatTimestamp(clip.endMs)}
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-bg-surface p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-bg">
                  {initials(clip.speaker.split(" + ")[0])}
                </span>
                <span className="text-sm font-medium text-text">{clip.speaker}</span>
                <span className="font-mono text-xs text-text-faint">
                  {formatTimestamp(clip.startMs)}
                </span>
              </div>

              {context?.before ? (
                <p className="mt-5 border-l-2 border-border pl-4 text-sm leading-relaxed text-text-faint">
                  {context.before.text}
                </p>
              ) : null}

              <blockquote className="mt-2 border-l-2 border-accent pl-4 text-base leading-relaxed text-text">
                {clip.text}
              </blockquote>

              {context?.after ? (
                <p className="mt-2 border-l-2 border-border pl-4 text-sm leading-relaxed text-text-faint">
                  {context.after.text}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-text-faint">
              <span>
                Clipped by {clip.createdBy} · {formatMeetingDate(clip.createdAt)}
              </span>
              <Link
                href={`/meetings/${clip.meetingId}`}
                className="inline-flex items-center gap-1 text-text-muted transition hover:text-accent"
              >
                View full meeting
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
