import type { Meeting } from "@/lib/types/meeting";

export type SearchSnippet = {
  prefix: string;
  match: string;
  suffix: string;
};

export type MeetingSearchResult = {
  meeting: Meeting;
  matchedIn: "title" | "transcript";
  snippet: SearchSnippet | null;
  /** Set when the hit came from the transcript, so the detail page can jump to it. */
  segmentId?: string;
  segmentStartMs?: number;
  speakerName?: string;
  transcriptMatchCount: number;
};

const CHARS_BEFORE = 55;
const CHARS_AFTER = 110;

function buildSnippet(text: string, index: number, length: number): SearchSnippet {
  const start = Math.max(0, index - CHARS_BEFORE);
  const end = Math.min(text.length, index + length + CHARS_AFTER);
  return {
    prefix: `${start > 0 ? "…" : ""}${text.slice(start, index)}`,
    match: text.slice(index, index + length),
    suffix: `${text.slice(index + length, end)}${end < text.length ? "…" : ""}`,
  };
}

/**
 * Case-insensitive search over meeting titles and full transcript text.
 * Title matches sort ahead of transcript-only matches; within each the caller's
 * order (newest first) is preserved.
 */
export function searchMeetings(
  meetings: Meeting[],
  rawQuery: string
): MeetingSearchResult[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const titleHits: MeetingSearchResult[] = [];
  const transcriptHits: MeetingSearchResult[] = [];

  for (const meeting of meetings) {
    const titleIndex = meeting.title.toLowerCase().indexOf(query);

    let firstSegment: { segment: Meeting["transcript"][number]; index: number } | null =
      null;
    let transcriptMatchCount = 0;

    for (const segment of meeting.transcript) {
      const index = segment.text.toLowerCase().indexOf(query);
      if (index < 0) continue;
      transcriptMatchCount += 1;
      if (!firstSegment) firstSegment = { segment, index };
    }

    if (titleIndex < 0 && !firstSegment) continue;

    const result: MeetingSearchResult = {
      meeting,
      matchedIn: titleIndex >= 0 ? "title" : "transcript",
      snippet: firstSegment
        ? buildSnippet(firstSegment.segment.text, firstSegment.index, query.length)
        : buildSnippet(meeting.summary.headline, 0, 0),
      segmentId: firstSegment?.segment.id,
      segmentStartMs: firstSegment?.segment.startMs,
      speakerName: firstSegment?.segment.speakerName,
      transcriptMatchCount,
    };

    if (titleIndex >= 0) titleHits.push(result);
    else transcriptHits.push(result);
  }

  return [...titleHits, ...transcriptHits];
}
