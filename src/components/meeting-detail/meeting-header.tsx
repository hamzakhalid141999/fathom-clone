"use client";

import { SharePopover } from "@/components/meeting-detail/share-popover";
import { MeetingCardMenu } from "@/components/meetings/meeting-card-menu";
import { meetingDayLabel } from "@/lib/format";
import { useLibrary } from "@/lib/library-context";
import type { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, MoreVertical, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function MeetingHeader({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const { isDeleted, getMeetingUi } = useLibrary();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVariant, setMenuVariant] = useState<"card" | "detail">("detail");
  const [copied, setCopied] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const folderButtonRef = useRef<HTMLButtonElement>(null);
  const deleted = isDeleted(meeting.id);
  const displayTitle =
    getMeetingUi(meeting.id).customTitle?.trim() || meeting.title;

  useEffect(() => {
    if (deleted) router.push("/meetings");
  }, [deleted, router]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <header className="px-6 pb-3 pt-4 bg-[#111111]">
      <div className="flex items-center justify-between">
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

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-[28px] font-semibold tracking-tight text-text">
            {displayTitle}
          </h1>
          <div className="relative mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
              <Calendar className="h-3.5 w-3.5" />
              {meetingDayLabel(meeting.startedAt)}
            </span>
            <button
              ref={folderButtonRef}
              type="button"
              onClick={() => {
                setMenuVariant("card");
                setMenuOpen((open) => !(open && menuVariant === "card"));
              }}
              aria-label="Add to folder"
              className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-text-muted transition hover:border-accent hover:text-accent"
            >
              <Plus className="h-3 w-3" />
            </button>
            {menuOpen && menuVariant === "card" ? (
              <div className="absolute left-0 top-[calc(100%+8px)] z-50">
                <MeetingCardMenu
                  meetingId={meeting.id}
                  open
                  onClose={() => setMenuOpen(false)}
                  ignoreCloseRef={folderButtonRef}
                  variant="card"
                  beak="top"
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 pt-1">
          <SharePopover
            meetingId={meeting.id}
            onCopyLink={copyLink}
            linkCopied={copied}
          />
          <div className="relative">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Meeting actions"
              aria-expanded={menuOpen && menuVariant === "detail"}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setMenuVariant("detail");
                setMenuOpen((open) => !(open && menuVariant === "detail"));
              }}
              className={cn(
                "rounded-md p-1.5 text-text-muted transition hover:bg-bg-hover hover:text-text",
                menuOpen && menuVariant === "detail" && "bg-bg-hover text-text"
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && menuVariant === "detail" ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50">
                <MeetingCardMenu
                  meetingId={meeting.id}
                  open
                  onClose={() => setMenuOpen(false)}
                  ignoreCloseRef={menuButtonRef}
                  variant="detail"
                  beak="top"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
