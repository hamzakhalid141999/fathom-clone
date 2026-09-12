"use client";

import { MeetingList } from "@/components/meetings/meeting-list";
import { SearchResults } from "@/components/meetings/search-results";
import { useLibrary } from "@/lib/library-context";
import { searchMeetings } from "@/lib/search";
import type { Meeting } from "@/lib/types/meeting";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function MeetingsBrowser({
  meetings,
  initialQuery = "",
}: {
  meetings: Meeting[];
  /** Comes from ?q= when the search started in the top nav. */
  initialQuery?: string;
}) {
  const { isDeleted } = useLibrary();
  const [input, setInput] = useState(initialQuery);
  const query = useDebouncedValue(input, 200);

  useEffect(() => {
    setInput(initialQuery);
  }, [initialQuery]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchMeetings(
      meetings.filter((meeting) => !isDeleted(meeting.id)),
      query
    );
  }, [meetings, query, isDeleted]);

  const searching = Boolean(query.trim());

  return (
    <div className="flex flex-col gap-5">
      <label className="relative flex w-full max-w-md items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-text-faint" />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setInput("");
          }}
          placeholder="Search titles and transcripts"
          aria-label="Search meetings"
          className="h-9 w-full rounded-lg border border-border bg-bg-input pl-9 pr-9 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-accent"
        />
        {input ? (
          <button
            type="button"
            onClick={() => setInput("")}
            aria-label="Clear search"
            className="absolute right-2 rounded-md p-1 text-text-faint transition hover:text-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </label>

      {searching ? (
        <SearchResults results={results} query={query.trim()} />
      ) : (
        <MeetingList meetings={meetings} />
      )}
    </div>
  );
}
