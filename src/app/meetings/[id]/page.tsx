import { AppShell } from "@/components/layout/app-shell";
import { MeetingDetail } from "@/components/meeting-detail/meeting-detail";
import { getMeetingById, meetings } from "@/lib/data/meetings";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return meetings.map((meeting) => ({ id: meeting.id }));
}

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meeting = getMeetingById(id);
  if (!meeting) notFound();

  return (
    <AppShell showAskPanel={false} scrollMain={false} showChrome={false}>
      {/* MeetingDetail reads search params, so it needs its own boundary. */}
      <Suspense fallback={null}>
        <MeetingDetail meeting={meeting} />
      </Suspense>
    </AppShell>
  );
}
