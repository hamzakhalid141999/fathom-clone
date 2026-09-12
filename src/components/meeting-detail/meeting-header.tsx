"use client";

import { MeetingCardMenu } from "@/components/meetings/meeting-card-menu";
import { formatDurationMins, initials, meetingDayLabel } from "@/lib/format";
import { useLibrary } from "@/lib/library-context";
import type { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  Eye,
  Folder,
  Link2,
  MoreVertical,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function MeetingHeader({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const { getFoldersForMeeting, isDeleted } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const folders = getFoldersForMeeting(meeting.id);
  const deleted = isDeleted(meeting.id);

  // Deleting from the header menu should return to the list rather than
  // leaving the user on a recording that no longer exists.
  useEffect(() => {
    if (deleted) router.push("/meetings");
  }, [deleted, router]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <header className="border-b border-border-subtle px-6 pb-4 pt-4">
      <div className="flex items-start justify-between gap-4">
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1 text-sm text-text-muted transition hover:text-text"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to My Meetings
        </Link>
        <Link
          href="/meetings"
          aria-label="Close meeting"
          className="rounded-md p-1 text-text-muted transition hover:bg-bg-hover hover:text-text"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-text">
            {meeting.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-2.5 py-1 text-xs text-text-muted">
              <Calendar className="h-3.5 w-3.5" />
              {meetingDayLabel(meeting.startedAt)}
            </span>
            <span className="text-xs text-text-faint">
              {formatDurationMins(meeting.durationMs)}
            </span>
            {folders.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                <Folder className="h-3.5 w-3.5" />
                {folders.map((f) => f.name).join(", ")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Add to folder"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-muted transition hover:border-accent hover:text-accent"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center -space-x-2">
              {meeting.participants.map((participant) => (
                <span
                  key={participant.id}
                  title={`${participant.name}${participant.role ? ` · ${participant.role}` : ""}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg text-[10px] font-semibold text-bg"
                  style={{ backgroundColor: participant.avatarColor ?? "#71717a" }}
                >
                  {initials(participant.name)}
                </span>
              ))}
            </div>
            <span className="text-xs text-text-muted">
              {meeting.participants.map((p) => p.name).join(", ")}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center overflow-hidden rounded-full bg-accent text-bg">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition hover:bg-accent-strong"
            >
              <Eye className="h-3.5 w-3.5" />
              Share
            </button>
            <span className="h-5 w-px bg-black/20" />
            <button
              type="button"
              onClick={copyLink}
              aria-label="Copy share link"
              className="px-2.5 py-1.5 transition hover:bg-accent-strong"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Meeting actions"
              aria-expanded={menuOpen}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                "rounded-md p-1.5 text-text-muted transition hover:bg-bg-hover hover:text-text",
                menuOpen && "bg-bg-hover text-text"
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50">
                <MeetingCardMenu
                  meetingId={meeting.id}
                  open
                  onClose={() => setMenuOpen(false)}
                  ignoreCloseRef={menuButtonRef}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {copied ? (
        <p className="mt-2 text-xs text-accent">Share link copied to clipboard</p>
      ) : null}
    </header>
  );
}
