"use client";

import { getMeetingsSorted } from "@/lib/data/meetings";
import { useLibrary } from "@/lib/library-context";
import { searchMeetings } from "@/lib/search";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";
import {
  Gift,
  HelpCircle,
  NotepadText,
  Search,
  Settings,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export function TopNav() {
  const router = useRouter();
  const { isDeleted } = useLibrary();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const query = useDebouncedValue(term, 200);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchMeetings(
      getMeetingsSorted().filter((meeting) => !isDeleted(meeting.id)),
      query
    );
  }, [query, isDeleted]);

  const titleMatches = results.filter((result) => result.matchedIn === "title");
  const showDropdown = open && term.trim().length > 0;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function goToSearch(value = term) {
    const trimmed = value.trim();
    setOpen(false);
    router.push(trimmed ? `/meetings?q=${encodeURIComponent(trimmed)}` : "/meetings");
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-bg bg-bg-elevated px-4">
      <Link href="/meetings" className="flex shrink-0 items-center gap-2">
        <span className="text-[15px] font-semibold tracking-[0.14em] text-text">
          FATHOM
        </span>
        <Image
          src="/assets/logo/logo.svg"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
          priority
        />
      </Link>

      <div ref={wrapRef} className="relative mx-auto w-full max-w-xl">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            goToSearch();
          }}
          className="flex w-full items-center"
        >
          <label className="relative flex w-full items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-text-faint" />
            <input
              type="search"
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search Call Recordings"
              className={cn(
                "h-9 w-full border border-transparent bg-bg-input pl-9 pr-9 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-border focus:bg-bg-surface",
                showDropdown ? "rounded-t-lg rounded-b-none" : "rounded-lg"
              )}
              autoComplete="off"
            />
            {term ? (
              <button
                type="button"
                onClick={() => {
                  setTerm("");
                  setOpen(false);
                }}
                aria-label="Clear search"
                className="absolute right-2 rounded-md p-1 text-text-faint transition hover:text-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
        </form>

        {showDropdown ? (
          <div className="absolute inset-x-0 top-full z-[120] overflow-hidden rounded-b-xl border border-t-0 border-border bg-[#1c1c1f] shadow-2xl shadow-black/50">
            <div className="px-4 pb-2 pt-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-text-faint">
                Matching Calls
              </p>
            </div>

            {titleMatches.length > 0 || results.length > 0 ? (
              <div>
                {titleMatches.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => goToSearch()}
                    className="flex w-full items-center gap-2.5 border-b border-border-subtle px-4 py-2.5 text-left transition-colors hover:bg-bg-hover"
                  >
                    <NotepadText className="h-4 w-4 shrink-0 text-text-muted" />
                    <span className="text-sm text-text-muted">
                      Calls titled{" "}
                      <span className="font-semibold text-text">{term.trim()}</span>
                    </span>
                  </button>
                ) : null}

                {results.slice(0, 6).map((result) => (
                  <Link
                    key={result.meeting.id}
                    href={
                      result.segmentId
                        ? `/meetings/${result.meeting.id}?segment=${result.segmentId}&q=${encodeURIComponent(query.trim())}`
                        : `/meetings/${result.meeting.id}`
                    }
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 border-b border-border-subtle px-4 py-2.5 transition-colors last:border-b-0 hover:bg-bg-hover"
                  >
                    <NotepadText className="h-4 w-4 shrink-0 text-text-muted" />
                    <span className="min-w-0 truncate text-sm text-text">
                      <HighlightedTitle
                        title={result.meeting.title}
                        query={query.trim()}
                      />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="border-t border-border-subtle px-4 py-3 text-sm text-text-muted">
                No meetings match “{term.trim()}”
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1 text-text-muted">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-bg-hover hover:text-text"
        >
          <Gift className="h-4 w-4" />
          <span className="hidden lg:inline">Refer</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-bg-hover hover:text-text"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden lg:inline">Settings</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-bg-hover hover:text-text"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden xl:inline">Help & Feedback</span>
        </button>
        <div className="ml-1 inline-flex items-center gap-1 rounded-full bg-bg-surface px-2 py-1 text-sm text-points">
          <Star className="h-3.5 w-3.5 fill-points text-points" />
          <span className="font-medium">25</span>
        </div>
        <div
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-bg-hover text-sm font-medium text-text"
          aria-label="Account"
        >
          H
        </div>
      </div>
    </header>
  );
}

function HighlightedTitle({ title, query }: { title: string; query: string }) {
  if (!query) return <>{title}</>;
  const index = title.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, index)}
      <span className="font-semibold text-text">
        {title.slice(index, index + query.length)}
      </span>
      {title.slice(index + query.length)}
    </>
  );
}
