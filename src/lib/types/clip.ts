/**
 * A shareable excerpt of a meeting transcript.
 *
 * Distinct from `Clip` in types/meeting.ts, which is a seeded highlight that
 * belongs to a meeting. A SharedClip is user-created and publicly viewable.
 */
export interface SharedClip {
  id: string;
  shareId: string;
  meetingId: string;
  meetingTitle: string;
  /** Copied from the meeting so the share page can stand alone. */
  meetingDate: string;
  text: string;
  speaker: string;
  segmentIds: string[];
  startMs: number;
  endMs: number;
  createdAt: string;
  createdBy: string;
}

export type NewSharedClip = Omit<SharedClip, "id" | "shareId" | "createdAt">;
