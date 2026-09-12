"use client";

import type { Folder, MeetingType, MeetingUiState } from "@/lib/types/library";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LibraryContextValue = {
  folders: Folder[];
  getMeetingUi: (meetingId: string) => MeetingUiState;
  addMeetingToFolder: (meetingId: string, folderId: string) => void;
  createFolderAndAddMeeting: (meetingId: string, name: string) => Folder;
  setMeetingType: (meetingId: string, meetingType: MeetingType) => void;
  togglePrivate: (meetingId: string) => void;
  deleteMeeting: (meetingId: string) => void;
  isDeleted: (meetingId: string) => boolean;
  getFoldersForMeeting: (meetingId: string) => Folder[];
  getMeetingsInFolder: (folderId: string) => string[];
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

const defaultUi: MeetingUiState = {
  folderIds: [],
  isPrivate: true,
  deleted: false,
};

function makeFolder(name: string): Folder {
  const trimmed = name.trim() || "Untitled folder";
  return {
    id: `folder_${trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}_${Date.now().toString(36)}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
  };
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [meetingUi, setMeetingUi] = useState<Record<string, MeetingUiState>>({});

  const getMeetingUi = useCallback(
    (meetingId: string): MeetingUiState => meetingUi[meetingId] ?? defaultUi,
    [meetingUi]
  );

  const addMeetingToFolder = useCallback((meetingId: string, folderId: string) => {
    setMeetingUi((prev) => {
      const current = prev[meetingId] ?? defaultUi;
      if (current.folderIds.includes(folderId)) return prev;
      return {
        ...prev,
        [meetingId]: {
          ...current,
          folderIds: [...current.folderIds, folderId],
        },
      };
    });
  }, []);

  const createFolderAndAddMeeting = useCallback(
    (meetingId: string, name: string) => {
      const trimmed = name.trim() || "Untitled folder";
      let folder = folders.find((f) => f.name.toLowerCase() === trimmed.toLowerCase());

      if (!folder) {
        folder = makeFolder(trimmed);
        setFolders((prev) => [...prev, folder as Folder]);
      }

      const folderId = folder.id;
      setMeetingUi((prev) => {
        const current = prev[meetingId] ?? defaultUi;
        if (current.folderIds.includes(folderId)) return prev;
        return {
          ...prev,
          [meetingId]: {
            ...current,
            folderIds: [...current.folderIds, folderId],
          },
        };
      });

      return folder;
    },
    [folders]
  );

  const setMeetingType = useCallback((meetingId: string, meetingType: MeetingType) => {
    setMeetingUi((prev) => ({
      ...prev,
      [meetingId]: { ...(prev[meetingId] ?? defaultUi), meetingType },
    }));
  }, []);

  const togglePrivate = useCallback((meetingId: string) => {
    setMeetingUi((prev) => {
      const current = prev[meetingId] ?? defaultUi;
      return {
        ...prev,
        [meetingId]: { ...current, isPrivate: !current.isPrivate },
      };
    });
  }, []);

  const deleteMeeting = useCallback((meetingId: string) => {
    setMeetingUi((prev) => ({
      ...prev,
      [meetingId]: { ...(prev[meetingId] ?? defaultUi), deleted: true },
    }));
  }, []);

  const isDeleted = useCallback(
    (meetingId: string) => Boolean(meetingUi[meetingId]?.deleted),
    [meetingUi]
  );

  const getFoldersForMeeting = useCallback(
    (meetingId: string) => {
      const ids = meetingUi[meetingId]?.folderIds ?? [];
      return folders.filter((folder) => ids.includes(folder.id));
    },
    [folders, meetingUi]
  );

  const getMeetingsInFolder = useCallback(
    (folderId: string) =>
      Object.entries(meetingUi)
        .filter(([, state]) => !state.deleted && state.folderIds.includes(folderId))
        .map(([id]) => id),
    [meetingUi]
  );

  const value = useMemo(
    () => ({
      folders,
      getMeetingUi,
      addMeetingToFolder,
      createFolderAndAddMeeting,
      setMeetingType,
      togglePrivate,
      deleteMeeting,
      isDeleted,
      getFoldersForMeeting,
      getMeetingsInFolder,
    }),
    [
      folders,
      getMeetingUi,
      addMeetingToFolder,
      createFolderAndAddMeeting,
      setMeetingType,
      togglePrivate,
      deleteMeeting,
      isDeleted,
      getFoldersForMeeting,
      getMeetingsInFolder,
    ]
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return ctx;
}
