"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AskFathomPanel } from "@/components/layout/ask-fathom-panel";
import { FolderMeetingRow } from "@/components/folders/folder-meeting-row";
import { getMeetingById } from "@/lib/data/meetings";
import { formatShortDate, meetingDayLabel } from "@/lib/format";
import { useLibrary } from "@/lib/library-context";
import type { Meeting } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Eye, Folder, Link2, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function FolderPage() {
  const params = useParams<{ id: string }>();
  return (
    <AppShell showAskPanel={false} scrollMain={false}>
      <FolderContent folderId={params.id} />
    </AppShell>
  );
}

function FolderContent({ folderId }: { folderId: string }) {
  const router = useRouter();
  const {
    getFolderById,
    getMeetingsInFolder,
    deleteFolder,
    setFolderVisibility,
    hydrated,
  } = useLibrary();

  const folder = getFolderById(folderId);
  const meetingIds = getMeetingsInFolder(folderId);

  const groups = useMemo(() => {
    const meetings = meetingIds
      .map((id) => getMeetingById(id))
      .filter((meeting): meeting is Meeting => Boolean(meeting))
      .sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );

    const byDay = new Map<string, Meeting[]>();
    for (const meeting of meetings) {
      const label = meetingDayLabel(meeting.startedAt);
      byDay.set(label, [...(byDay.get(label) ?? []), meeting]);
    }
    return Array.from(byDay, ([label, items]) => ({ label, items }));
  }, [meetingIds]);

  if (!folder && !hydrated) {
    return (
      <div className="px-6 py-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-bg-surface" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-24 text-center">
        <Folder className="mx-auto mb-3 h-8 w-8 text-text-faint" />
        <p className="text-sm font-medium text-text">Folder not found</p>
        <p className="mt-1 text-sm text-text-muted">
          This folder may have been deleted.
        </p>
        <Link
          href="/folders"
          className="mt-4 inline-block text-sm text-accent hover:text-accent-strong"
        >
          Back to Folders
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-start justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-accent text-accent">
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text">
              {folder.name}
            </h1>
            <p className="mt-0.5 text-xs text-text-muted">
              {meetingIds.length} Call{meetingIds.length === 1 ? "" : "s"} · Last
              Updated {formatShortDate(folder.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <VisibilityMenu
            visibility={folder.visibility}
            onSelect={(next) => setFolderVisibility(folder.id, next)}
          />
          <ShareFolderButton />
          <button
            type="button"
            onClick={() => {
              deleteFolder(folder.id);
              router.replace("/folders");
            }}
            className="rounded-lg bg-bg-surface px-3 py-1.5 text-sm text-text transition hover:bg-bg-hover"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="relative z-20 min-w-0 flex-1 overflow-y-auto px-6 pb-10 border-t border-border pt-4">
          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-bg-surface px-6 py-16 text-center">
              <p className="text-sm font-medium text-text">This folder is empty</p>
              <p className="mt-1 text-sm text-text-muted">
                Add calls from the meeting card menu on My Calls.
              </p>
              <Link
                href="/meetings"
                className="mt-4 inline-block text-sm text-accent hover:text-accent-strong"
              >
                Go to My Calls
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map((group) => (
                <section key={group.label}>
                  <h2 className="mb-2 text-sm font-semibold text-text">
                    {group.label}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {group.items.map((meeting) => (
                      <FolderMeetingRow
                        key={meeting.id}
                        meeting={meeting}
                        folderId={folder.id}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <AskFathomPanel />
      </div>
    </div>
  );
}

function VisibilityMenu({
  visibility,
  onSelect,
}: {
  visibility: "private" | "team";
  onSelect: (next: "private" | "team") => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const options = [
    {
      value: "private" as const,
      label: "No Team Visibility",
      description: "Only you can open this folder",
      icon: <Eye className="h-3.5 w-3.5" />,
    },
    {
      value: "team" as const,
      label: "Team Can View",
      description: "Anyone on your team can open this folder",
      icon: <Users className="h-3.5 w-3.5" />,
    },
  ];
  const current = options.find((option) => option.value === visibility) ?? options[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-bg-surface px-3 py-1.5 text-sm text-text-muted transition hover:bg-bg-hover hover:text-text"
      >
        {current.icon}
        {current.label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[268px] rounded-xl border border-border bg-[#1a1a1e] py-1.5 shadow-2xl shadow-black/50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
              className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-bg-hover"
            >
              <span className="mt-0.5 text-text-muted">{option.icon}</span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    option.value === visibility ? "text-accent" : "text-text"
                  )}
                >
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-text-muted">
                  {option.description}
                </span>
              </span>
              {option.value === visibility ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ShareFolderButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg bg-bg-surface px-3 py-1.5 text-sm text-accent transition hover:bg-bg-hover"
    >
      {copied ? "Link Copied" : "Share"}
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
    </button>
  );
}
