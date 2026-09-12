"use client";

import { MeetingCard } from "@/components/meetings/meeting-card";
import { meetingDayLabel } from "@/lib/format";
import { useLibrary } from "@/lib/library-context";
import type { Meeting } from "@/lib/types/meeting";
import { motion } from "framer-motion";
import { useMemo } from "react";

export function MeetingList({ meetings }: { meetings: Meeting[] }) {
  const { isDeleted } = useLibrary();

  const sections = useMemo(() => {
    const visible = meetings.filter((m) => !isDeleted(m.id));
    const map = new Map<string, Meeting[]>();

    for (const meeting of visible) {
      const label = meetingDayLabel(meeting.startedAt);
      const list = map.get(label) ?? [];
      list.push(meeting);
      map.set(label, list);
    }

    return Array.from(map.entries());
  }, [meetings, isDeleted]);

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-surface px-6 py-16 text-center text-sm text-text-muted">
        No call recordings
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {sections.map(([label, items]) => (
        <section key={label}>
          <h2 className="mb-3 text-sm font-medium text-text-muted">{label}</h2>
          <div className="grid grid-cols-1 gap-5 overflow-visible sm:grid-cols-2 xl:grid-cols-3">
            {items.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
                className="overflow-visible"
              >
                <MeetingCard meeting={meeting} />
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
