"use client";

import { formatDurationMins, formatMeetingDate, formatTimestamp } from "@/lib/format";
import type { MeetingSearchResult } from "@/lib/search";
import { FileText, Type } from "lucide-react";
import Link from "next/link";

export function SearchResults({
  results,
  query,
}: {
  results: MeetingSearchResult[];
  query: string;
}) {
  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface px-6 py-16 text-center">
        <p className="text-sm font-medium text-text">No meetings match</p>
        <p className="mt-1 text-sm text-text-muted">
          Nothing found for “{query}” in titles or transcripts.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-text-muted">
        {results.length} meeting{results.length === 1 ? "" : "s"} match “{query}”
      </p>

      <ul className="flex flex-col gap-2">
        {results.map((result) => (
          <li key={result.meeting.id}>
            <Link
              href={
                result.segmentId
                  ? `/meetings/${result.meeting.id}?segment=${result.segmentId}&q=${encodeURIComponent(query)}`
                  : `/meetings/${result.meeting.id}`
              }
              className="block rounded-xl bg-bg-surface p-4 transition-colors hover:bg-[#1f1f24]"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-text-faint">
                  {result.matchedIn === "title" ? (
                    <Type className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">
                    <Marked text={result.meeting.title} query={query} />
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                    <span>{formatMeetingDate(result.meeting.startedAt)}</span>
                    <span className="text-text-faint">•</span>
                    <span>{formatDurationMins(result.meeting.durationMs)}</span>
                    {result.speakerName ? (
                      <>
                        <span className="text-text-faint">•</span>
                        <span>{result.speakerName}</span>
                        <span className="font-mono text-text-faint">
                          {formatTimestamp(result.segmentStartMs ?? 0)}
                        </span>
                      </>
                    ) : null}
                    {result.transcriptMatchCount > 1 ? (
                      <>
                        <span className="text-text-faint">•</span>
                        <span>{result.transcriptMatchCount} transcript matches</span>
                      </>
                    ) : null}
                  </div>

                  {result.snippet ? (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-text-muted">
                      {result.snippet.prefix}
                      {result.snippet.match ? (
                        <mark className="rounded bg-accent/30 text-text">
                          {result.snippet.match}
                        </mark>
                      ) : null}
                      {result.snippet.suffix}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Marked({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (!query.trim() || index < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-accent/30 text-text">
        {text.slice(index, index + query.trim().length)}
      </mark>
      {text.slice(index + query.trim().length)}
    </>
  );
}
