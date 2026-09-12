import { AppShell } from "@/components/layout/app-shell";
import { MeetingList } from "@/components/meetings/meeting-list";
import { getMeetingsSorted } from "@/lib/data/meetings";

export default function MeetingsPage() {
  const meetings = getMeetingsSorted();

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <MeetingList meetings={meetings} />
      </div>
    </AppShell>
  );
}
