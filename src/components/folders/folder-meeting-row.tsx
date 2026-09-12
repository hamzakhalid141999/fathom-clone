"use client";

import { CardMenuPortal } from "@/components/meetings/card-menu-portal";
import { folderPathLabel } from "@/lib/folder-label";
import { formatDurationMins, formatShortDate } from "@/lib/format";
import { useLibrary } from "@/lib/library-context";
import type { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { Folder, MoreVertical, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function FolderMeetingRow({
  meeting,
  folderId,
}: {
  meeting: Meeting;
  folderId: string;
}) {
  const router = useRouter();
  const { getFoldersForMeeting } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const folders = getFoldersForMeeting(meeting.id);
  const owner = meeting.participants[0]?.name ?? "Unknown";

  return (
    <div className="relative">
      <div
        role="link"
        tabIndex={0}
        onClick={() => {
          if (!menuOpen) router.push(`/meetings/${meeting.id}`);
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !menuOpen) {
            e.preventDefault();
            router.push(`/meetings/${meeting.id}`);
          }
        }}
        className="flex cursor-pointer gap-4 rounded-xl bg-bg-surface p-3 outline-none transition-colors hover:bg-[#1f1f24]"
      >
        <div className="relative h-[98px] w-[172px] shrink-0 overflow-hidden rounded-lg bg-[#2a1a18]">
          <Image
            src="/assets/placeholders/audio_only.png"
            alt=""
            fill
            sizes="172px"
            className="object-cover"
          />
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatDurationMins(meeting.durationMs)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-text">
              {meeting.title}
            </p>
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Meeting actions"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((open) => !open);
              }}
              className={cn(
                "shrink-0 rounded-md p-1 transition-colors",
                menuOpen
                  ? "bg-accent text-white"
                  : "text-text-muted hover:bg-bg-hover hover:text-text"
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
            <span>{formatShortDate(meeting.startedAt)}</span>
            <span className="text-text-faint">•</span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {owner}
            </span>
          </div>

          {folders.length > 0 ? (
            <Link
              href={`/folders/${folders[0].id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 inline-flex max-w-full items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-accent"
            >
              <Folder className="h-3 w-3 shrink-0" />
              <span className="truncate">{folderPathLabel(folders)}</span>
            </Link>
          ) : null}

          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-text-muted">
            {meeting.summary.headline}
          </p>
        </div>
      </div>

      {menuOpen ? (
        <CardMenuPortal
          meetingId={meeting.id}
          menuButtonRef={menuButtonRef}
          onClose={() => setMenuOpen(false)}
          folderId={folderId}
        />
      ) : null}
    </div>
  );
}
