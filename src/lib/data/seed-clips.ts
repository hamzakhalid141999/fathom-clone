import { getMeetingById } from "@/lib/data/meetings";
import type { SharedClip } from "@/lib/types/clip";

type SeedSpec = {
  shareId: string;
  meetingId: string;
  segmentIds: string[];
  createdBy: string;
};

const SEEDS: SeedSpec[] = [
  {
    shareId: "northwind-slip",
    meetingId: "mtg_q3_pipeline_review",
    segmentIds: ["q3_t2", "q3_t3"],
    createdBy: "Maya Chen",
  },
  {
    shareId: "helix-bot-free",
    meetingId: "mtg_customer_discovery_helix",
    segmentIds: ["hx_t5"],
    createdBy: "Hamza Khalid",
  },
];

/** Example clips so the feature is never empty on first load. */
export function buildSeedClips(): SharedClip[] {
  const clips: SharedClip[] = [];

  for (const seed of SEEDS) {
    const meeting = getMeetingById(seed.meetingId);
    if (!meeting) continue;

    const segments = seed.segmentIds
      .map((id) => meeting.transcript.find((segment) => segment.id === id))
      .filter((segment): segment is NonNullable<typeof segment> => Boolean(segment));

    if (segments.length === 0) continue;

    const speakers = Array.from(new Set(segments.map((s) => s.speakerName)));

    clips.push({
      id: `clip_seed_${seed.shareId}`,
      shareId: seed.shareId,
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      meetingDate: meeting.startedAt,
      text: segments.map((s) => s.text).join(" "),
      speaker:
        speakers.length > 1
          ? `${speakers[0]} + ${speakers.length - 1} other${speakers.length > 2 ? "s" : ""}`
          : speakers[0],
      segmentIds: seed.segmentIds,
      startMs: segments[0].startMs,
      endMs: segments[segments.length - 1].endMs,
      createdAt: meeting.startedAt,
      createdBy: seed.createdBy,
    });
  }

  return clips;
}
