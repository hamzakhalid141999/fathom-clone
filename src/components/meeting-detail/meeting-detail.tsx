"use client";

import { AskFathomPanel } from "@/components/layout/ask-fathom-panel";
import { ActionItemsPanel } from "@/components/meeting-detail/action-items-panel";
import { DetailTabs, type DetailTab } from "@/components/meeting-detail/detail-tabs";
import { MeetingHeader } from "@/components/meeting-detail/meeting-header";
import { PlayerStub } from "@/components/meeting-detail/player-stub";
import { SummaryPanel } from "@/components/meeting-detail/summary-panel";
import { TranscriptPanel } from "@/components/meeting-detail/transcript-panel";
import { PlaybackProvider } from "@/lib/playback-context";
import type { Meeting, TranscriptComment } from "@/lib/types/meeting";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function commentsStorageKey(meetingId: string) {
  return `fathom.transcript-comments.v1.${meetingId}`;
}

export function MeetingDetail({ meeting }: { meeting: Meeting }) {
  // Arriving from search: ?segment= jumps to that line, ?q= highlights the term.
  const searchParams = useSearchParams();
  const focusSegmentId = searchParams.get("segment");
  const searchTerm = searchParams.get("q") ?? "";

  const [tab, setTab] = useState<DetailTab>(focusSegmentId ? "transcript" : "summary");
  const [comments, setComments] = useState<TranscriptComment[]>([]);
  const [commentsHydrated, setCommentsHydrated] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      meeting.actionItems.map((item) => [item.id, item.status === "done"])
    )
  );

  useEffect(() => {
    setCommentsHydrated(false);
    setComments([]);
    try {
      const raw = window.localStorage.getItem(commentsStorageKey(meeting.id));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setComments(parsed as TranscriptComment[]);
      }
    } catch {
      // Private mode / corrupt JSON — start empty.
    }
    setCommentsHydrated(true);
  }, [meeting.id]);

  useEffect(() => {
    if (!commentsHydrated) return;
    try {
      window.localStorage.setItem(
        commentsStorageKey(meeting.id),
        JSON.stringify(comments)
      );
    } catch {
      // Storage can be unavailable — comments stay in memory.
    }
  }, [comments, commentsHydrated, meeting.id]);

  function addComment(segmentId: string, text: string, timestampMs: number) {
    setComments((prev) => [
      ...prev,
      {
        id: `comment_${segmentId}_${Date.now()}_${prev.length + 1}`,
        segmentId,
        author: "Hamza Khalid",
        text,
        createdAt: new Date().toISOString(),
        timestampMs,
      },
    ]);
  }

  const openCount = meeting.actionItems.filter((item) => !completed[item.id]).length;

  return (
    <PlaybackProvider durationMs={meeting.durationMs}>
      <div className="flex h-full min-h-0 flex-col">
        <MeetingHeader meeting={meeting} />

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <DetailTabs active={tab} onChange={setTab} actionItemCount={openCount} />

            <div className="min-h-0 flex-1 overflow-y-auto">
              {tab === "summary" ? <SummaryPanel meeting={meeting} /> : null}
              {tab === "action-items" ? (
                <ActionItemsPanel
                  items={meeting.actionItems}
                  completed={completed}
                  onToggle={(id) =>
                    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }))
                  }
                />
              ) : null}
              {tab === "transcript" ? (
                <TranscriptPanel
                  meeting={meeting}
                  comments={comments}
                  onAddComment={addComment}
                  focusSegmentId={focusSegmentId}
                  highlightTerm={searchTerm}
                />
              ) : null}
            </div>
          </div>

          <div className="hidden w-[360px] shrink-0 flex-col border-l border-border-subtle lg:flex">
            <PlayerStub />
            <AskFathomPanel scope="call" embedded />
          </div>
        </div>
      </div>
    </PlaybackProvider>
  );
}
