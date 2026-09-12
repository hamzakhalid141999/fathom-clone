"use client";

import { AppShell } from "@/components/layout/app-shell";
import { getMeetingById } from "@/lib/data/meetings";
import { useLibrary } from "@/lib/library-context";
import { Folder, FolderOpen } from "lucide-react";
import Link from "next/link";

function FoldersContent() {
  const { folders, getMeetingsInFolder } = useLibrary();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-text">Folders</h1>
        <p className="mt-1 text-sm text-text-muted">
          Collections of calls you create from meeting cards
        </p>
      </div>

      {folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface px-6 py-20 text-center">
          <FolderOpen className="mb-3 h-8 w-8 text-text-faint" />
          <p className="text-sm font-medium text-text">No folders yet</p>
          <p className="mt-1 max-w-sm text-sm text-text-muted">
            Open a meeting card menu, choose Add to Folder, then Create a new folder.
          </p>
          <Link
            href="/meetings"
            className="mt-4 text-sm text-accent hover:text-accent-strong"
          >
            Back to My Calls
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {folders.map((folder) => {
            const meetingIds = getMeetingsInFolder(folder.id);
            const meetings = meetingIds
              .map((id) => getMeetingById(id))
              .filter(Boolean);

            return (
              <div
                key={folder.id}
                className="rounded-xl border border-border bg-bg-surface px-4 py-4"
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold text-text">{folder.name}</h2>
                  <span className="text-xs text-text-faint">
                    {meetings.length} call{meetings.length === 1 ? "" : "s"}
                  </span>
                </div>
                {meetings.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 border-t border-border-subtle pt-3">
                    {meetings.map((meeting) =>
                      meeting ? (
                        <li key={meeting.id}>
                          <Link
                            href={`/meetings/${meeting.id}`}
                            className="text-sm text-text-muted transition hover:text-accent"
                          >
                            {meeting.title}
                          </Link>
                        </li>
                      ) : null
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-text-faint">Empty folder</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FoldersPage() {
  return (
    <AppShell>
      <FoldersContent />
    </AppShell>
  );
}
