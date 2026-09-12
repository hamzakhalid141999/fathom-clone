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
import { useState } from "react";

export function MeetingDetail({ meeting }: { meeting: Meeting }) {
  const [tab, setTab] = useState<DetailTab>("summary");
  const [comments, setComments] = useState<TranscriptComment[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      meeting.actionItems.map((item) => [item.id, item.status === "done"])
    )
  );

  function addComment(segmentId: string, text: string, timestampMs: number) {
    setComments((prev) => [
      ...prev,
      {
        id: `comment_${segmentId}_${prev.length + 1}`,
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
      <div className="flex h-full min-h-0">
        <div className="flex min-w-0 flex-1 flex-col">
          <MeetingHeader meeting={meeting} />
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
              />
            ) : null}
          </div>
        </div>

        <div className="hidden w-[360px] shrink-0 flex-col border-l border-border-subtle lg:flex">
          <PlayerStub />
          <AskFathomPanel scope="call" embedded />
        </div>
      </div>
    </PlaybackProvider>
  );
}
