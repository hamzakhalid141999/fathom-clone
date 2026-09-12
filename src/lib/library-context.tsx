"use client";

import type {
  Folder,
  FolderVisibility,
  MeetingType,
  MeetingUiState,
} from "@/lib/types/library";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "fathom.library.v1";

type LibraryContextValue = {
  folders: Folder[];
  /** False until localStorage has been read, so pages can avoid a false "not found". */
  hydrated: boolean;
  getMeetingUi: (meetingId: string) => MeetingUiState;
  addMeetingToFolder: (meetingId: string, folderId: string) => void;
  removeMeetingFromFolder: (meetingId: string, folderId: string) => void;
  createFolderAndAddMeeting: (meetingId: string, name: string) => Folder;
  getFolderById: (folderId: string) => Folder | undefined;
  deleteFolder: (folderId: string) => void;
  setFolderVisibility: (folderId: string, visibility: FolderVisibility) => void;
  setMeetingType: (meetingId: string, meetingType: MeetingType) => void;
  setMeetingTitle: (meetingId: string, title: string) => void;
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
  const now = new Date().toISOString();
  return {
    id: `folder_${trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}_${Date.now().toString(36)}`,
    name: trimmed,
    createdAt: now,
    updatedAt: now,
    visibility: "private",
  };
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [meetingUi, setMeetingUi] = useState<Record<string, MeetingUiState>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.folders)) setFolders(parsed.folders);
        if (parsed?.meetingUi && typeof parsed.meetingUi === "object") {
          setMeetingUi(parsed.meetingUi);
        }
      }
    } catch {
      // Corrupt or unavailable storage just means we start empty.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders, meetingUi }));
    } catch {
      // Storage can be unavailable — state stays in memory for this session.
    }
  }, [hydrated, folders, meetingUi]);

  const getMeetingUi = useCallback(
    (meetingId: string): MeetingUiState => meetingUi[meetingId] ?? defaultUi,
    [meetingUi]
  );

  const touchFolder = useCallback((folderId: string) => {
    const now = new Date().toISOString();
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, updatedAt: now } : folder
      )
    );
  }, []);

  const addMeetingToFolder = useCallback(
    (meetingId: string, folderId: string) => {
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
      touchFolder(folderId);
    },
    [touchFolder]
  );

  const removeMeetingFromFolder = useCallback(
    (meetingId: string, folderId: string) => {
      setMeetingUi((prev) => {
        const current = prev[meetingId] ?? defaultUi;
        if (!current.folderIds.includes(folderId)) return prev;
        return {
          ...prev,
          [meetingId]: {
            ...current,
            folderIds: current.folderIds.filter((id) => id !== folderId),
          },
        };
      });
      touchFolder(folderId);
    },
    [touchFolder]
  );

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

  const getFolderById = useCallback(
    (folderId: string) => folders.find((folder) => folder.id === folderId),
    [folders]
  );

  const deleteFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    setMeetingUi((prev) => {
      const next: Record<string, MeetingUiState> = {};
      for (const [meetingId, state] of Object.entries(prev)) {
        next[meetingId] = state.folderIds.includes(folderId)
          ? { ...state, folderIds: state.folderIds.filter((id) => id !== folderId) }
          : state;
      }
      return next;
    });
  }, []);

  const setFolderVisibility = useCallback(
    (folderId: string, visibility: FolderVisibility) => {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId ? { ...folder, visibility } : folder
        )
      );
    },
    []
  );

  const setMeetingType = useCallback((meetingId: string, meetingType: MeetingType) => {
    setMeetingUi((prev) => ({
      ...prev,
      [meetingId]: { ...(prev[meetingId] ?? defaultUi), meetingType },
    }));
  }, []);

  const setMeetingTitle = useCallback((meetingId: string, title: string) => {
    const trimmed = title.trim();
    setMeetingUi((prev) => {
      const current = prev[meetingId] ?? defaultUi;
      if (!trimmed) {
        if (!current.customTitle) return prev;
        const next = { ...current };
        delete next.customTitle;
        return { ...prev, [meetingId]: next };
      }
      if (current.customTitle === trimmed) return prev;
      return {
        ...prev,
        [meetingId]: { ...current, customTitle: trimmed },
      };
    });
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
      hydrated,
      getMeetingUi,
      addMeetingToFolder,
      removeMeetingFromFolder,
      createFolderAndAddMeeting,
      getFolderById,
      deleteFolder,
      setFolderVisibility,
      setMeetingType,
      setMeetingTitle,
      togglePrivate,
      deleteMeeting,
      isDeleted,
      getFoldersForMeeting,
      getMeetingsInFolder,
    }),
    [
      folders,
      hydrated,
      getMeetingUi,
      addMeetingToFolder,
      removeMeetingFromFolder,
      createFolderAndAddMeeting,
      getFolderById,
      deleteFolder,
      setFolderVisibility,
      setMeetingType,
      setMeetingTitle,
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
