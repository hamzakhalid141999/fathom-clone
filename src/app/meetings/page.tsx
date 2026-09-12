import { AppShell } from "@/components/layout/app-shell";
import { MeetingsBrowser } from "@/components/meetings/meetings-browser";
import { getMeetingsSorted } from "@/lib/data/meetings";

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <MeetingsBrowser meetings={getMeetingsSorted()} initialQuery={q ?? ""} />
      </div>
    </AppShell>
  );
}
