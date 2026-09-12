"use client";

import { AppShell } from "@/components/layout/app-shell";
import { formatShortDate } from "@/lib/format";
import { useLibrary } from "@/lib/library-context";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Eye, Folder, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function FoldersContent() {
  const router = useRouter();
  const { folders, getMeetingsInFolder } = useLibrary();
  const [descending, setDescending] = useState(true);

  const rows = useMemo(() => {
    return folders
      .map((folder) => ({
        folder,
        calls: getMeetingsInFolder(folder.id).length,
      }))
      .sort((a, b) => {
        const diff =
          new Date(a.folder.updatedAt).getTime() -
          new Date(b.folder.updatedAt).getTime();
        return descending ? -diff : diff;
      });
  }, [folders, getMeetingsInFolder, descending]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-text">Folders</h1>
        <span className="rounded-full bg-bg-hover px-2 py-0.5 text-xs font-medium text-text-muted">
          {folders.length}
        </span>
      </div>

      {folders.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-surface px-6 py-20 text-center">
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
        <table className="mt-5 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-subtle">
              <Th className="w-[45%]">Folder</Th>
              <Th className="w-[15%]">Calls</Th>
              <Th className="w-[20%]">
                <button
                  type="button"
                  onClick={() => setDescending((prev) => !prev)}
                  className="inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-text"
                >
                  Last Added At
                  {descending ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </button>
              </Th>
              <Th className="w-[20%]">Visibility</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ folder, calls }) => (
              <tr
                key={folder.id}
                onClick={() => router.push(`/folders/${folder.id}`)}
                className="cursor-pointer border-b border-border-subtle transition-colors hover:bg-bg-hover"
              >
                <td className="py-3 pr-3">
                  <span className="inline-flex items-center gap-2 text-sm text-accent">
                    <Folder className="h-4 w-4 shrink-0 fill-current" />
                    {folder.name}
                  </span>
                </td>
                <td className="py-3 pr-3 text-sm text-text-muted">{calls}</td>
                <td className="py-3 pr-3 text-sm text-text-muted">
                  {formatShortDate(folder.updatedAt)}
                </td>
                <td className="py-3 pr-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                    <Eye className="h-3.5 w-3.5" />
                    {folder.visibility === "team" ? "Shared with team" : "Not shared"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "pb-2 text-[11px] font-medium uppercase tracking-wide text-text-faint",
        className
      )}
    >
      {children}
    </th>
  );
}

export default function FoldersPage() {
  return (
    <AppShell>
      <FoldersContent />
    </AppShell>
  );
}
