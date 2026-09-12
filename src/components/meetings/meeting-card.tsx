"use client";

import { MeetingCardMenu } from "@/components/meetings/meeting-card-menu";
import { folderPathLabel } from "@/lib/folder-label";
import { formatDurationMins } from "@/lib/format";
import { useLibrary } from "@/lib/library-context";
import type { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Folder, MoreVertical, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const menuButtonId = useId();
  const {
    getMeetingUi,
    getFoldersForMeeting,
    togglePrivate,
    isDeleted,
    setMeetingTitle,
  } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(meeting.title);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const ui = getMeetingUi(meeting.id);
  const folders = getFoldersForMeeting(meeting.id);
  const active = menuOpen;
  const displayTitle = ui.customTitle?.trim() || meeting.title;

  useEffect(() => {
    if (!editingTitle) setTitleDraft(displayTitle);
  }, [displayTitle, editingTitle]);

  useEffect(() => {
    if (!editingTitle) return;
    const input = titleInputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [editingTitle]);

  if (isDeleted(meeting.id)) return null;

  function commitTitle() {
    const next = titleDraft.trim() || meeting.title;
    setMeetingTitle(meeting.id, next === meeting.title ? "" : next);
    setEditingTitle(false);
  }

  function cancelTitleEdit() {
    setTitleDraft(displayTitle);
    setEditingTitle(false);
  }

  return (
    <article
      className={cn(
        "group relative w-full origin-center overflow-visible",
        "transition-transform duration-300 ease-out will-change-transform",
        "hover:z-40 hover:scale-[1.08]",
        (active || editingTitle) && "z-40 scale-[1.08]"
      )}
    >
      <div
        role="link"
        tabIndex={0}
        onClick={() => {
          if (!menuOpen && !editingTitle) router.push(`/meetings/${meeting.id}`);
        }}
        onKeyDown={(e) => {
          if (
            (e.key === "Enter" || e.key === " ") &&
            !menuOpen &&
            !editingTitle
          ) {
            e.preventDefault();
            router.push(`/meetings/${meeting.id}`);
          }
        }}
        className={cn(
          "block cursor-pointer rounded-xl outline-none transition-[background-color,box-shadow] duration-200",
          "bg-transparent group-hover:bg-[#1a1a1e] group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
          (active || editingTitle) &&
            "bg-[#1a1a1e] shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-[15px] bg-[#2a1a18]">
          <Image
            src="/assets/placeholders/audio_only.png"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="rounded-[15px] object-cover"
          />

          <button
            type="button"
            aria-label={ui.isPrivate ? "Private recording" : "Visible recording"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              togglePrivate(meeting.id);
            }}
            className={cn(
              "absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-md transition",
              ui.isPrivate
                ? "bg-[#f5c542] text-black"
                : "bg-black/70 text-white opacity-0 group-hover:opacity-100"
            )}
          >
            {ui.isPrivate ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>

          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatDurationMins(meeting.durationMs)}
          </span>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/25 group-hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-[52px] items-start gap-2 px-1 py-2.5",
            "transition-[padding] duration-200 ease-out",
            "group-hover:px-4 group-hover:py-3",
            (active || editingTitle) && "px-4 py-3"
          )}
        >
          <div className="min-w-0 flex-1 pt-0.5">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTitle();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelTitleEdit();
                  }
                }}
                aria-label="Edit meeting title"
                className="w-full rounded-md border border-accent bg-bg-input px-2 py-0.5 text-sm font-medium text-white outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTitleDraft(displayTitle);
                  setEditingTitle(true);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                  "max-w-full truncate text-left text-sm font-medium text-text transition-colors duration-200",
                  "hover:text-white hover:underline hover:decoration-dotted hover:decoration-white/50 hover:underline-offset-4",
                  "group-hover:text-white",
                  active && "text-white"
                )}
              >
                {displayTitle}
              </button>
            )}
            {folders.length > 0 ? (
              <Link
                href={`/folders/${folders[0].id}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-1.5 inline-flex max-w-full items-center gap-1.5 text-[12px] text-accent hover:text-accent-strong"
              >
                <Folder className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{folderPathLabel(folders)}</span>
              </Link>
            ) : null}
            {ui.meetingType ? (
              <p className="mt-1 text-[11px] text-text-faint">{ui.meetingType}</p>
            ) : null}
          </div>

          {/* Menu is absolutely positioned to this button wrapper. */}
          <div className="relative shrink-0">
            <button
              ref={menuButtonRef}
              id={menuButtonId}
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
                "rounded-md p-1 text-text-muted transition-opacity duration-200 ease-out hover:text-text",
                "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                active && "opacity-100 pointer-events-auto bg-bg-elevated text-white"
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen ? (
              <div
                className="absolute left-full top-0 z-[100] ml-1"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
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
    </article>
  );
}
