export type MeetingId = string;

export interface Participant {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatarColor?: string;
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  startMs: number;
  endMs: number;
  text: string;
}

export type ActionItemStatus = "open" | "done" | "cancelled";

export interface ActionItem {
  id: string;
  text: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  status: ActionItemStatus;
  sourceTimestampMs?: number;
}

export interface Clip {
  id: string;
  title: string;
  startMs: number;
  endMs: number;
  thumbnailLabel?: string;
  createdBy?: string;
}

export interface MeetingSummary {
  headline: string;
  bullets: string[];
  decisions?: string[];
  nextSteps?: string[];
}

export interface SummaryBullet {
  label?: string;
  text: string;
  timestampMs?: number;
  children?: SummaryBullet[];
}

export interface SummarySection {
  heading: string;
  paragraph?: string;
  subheading?: string;
  bullets?: SummaryBullet[];
}

export interface SummaryTemplate {
  id: string;
  name: string;
  description?: string;
  sections: SummarySection[];
}

export interface TranscriptComment {
  id: string;
  segmentId: string;
  author: string;
  text: string;
  createdAt: string;
  timestampMs: number;
}

export interface Meeting {
  id: MeetingId;
  title: string;
  startedAt: string;
  durationMs: number;
  platform: "zoom" | "meet" | "teams" | "other";
  participants: Participant[];
  summary: MeetingSummary;
  transcript: TranscriptSegment[];
  actionItems: ActionItem[];
  clips: Clip[];
  tags?: string[];
  recordingStubUrl?: string;
  summaryTemplates?: SummaryTemplate[];
}
