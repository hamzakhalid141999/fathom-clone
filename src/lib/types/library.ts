export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export type MeetingType =
  | "Customer Call"
  | "Internal"
  | "Interview"
  | "Demo"
  | "Other";

export interface MeetingUiState {
  folderIds: string[];
  meetingType?: MeetingType;
  isPrivate: boolean;
  deleted: boolean;
}
