export type FolderVisibility = "private" | "team";

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  /** Last time a call was added, shown as "Last Added At" in the folders table. */
  updatedAt: string;
  visibility: FolderVisibility;
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
  /** Optional override for the seed meeting title. */
  customTitle?: string;
}
