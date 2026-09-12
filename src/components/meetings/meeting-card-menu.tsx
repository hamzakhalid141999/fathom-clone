"use client";

import { useLibrary } from "@/lib/library-context";
import type { MeetingType } from "@/lib/types/library";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  FolderMinus,
  FolderPlus,
  Link2,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MenuView = "main" | "folders" | "create-folder" | "meeting-type";

const MEETING_TYPES: MeetingType[] = [
  "Customer Call",
  "Internal",
  "Interview",
  "Demo",
  "Other",
];

export function MeetingCardMenu({
  meetingId,
  open,
  onClose,
  ignoreCloseRef,
  folderId,
}: {
  meetingId: string;
  open: boolean;
  onClose: () => void;
  ignoreCloseRef?: React.RefObject<HTMLElement | null>;
  /** Set when the menu is opened from inside a folder, which adds Remove from Folder. */
  folderId?: string;
}) {
  const {
    folders,
    addMeetingToFolder,
    removeMeetingFromFolder,
    createFolderAndAddMeeting,
    setMeetingType,
    deleteMeeting,
    getMeetingUi,
  } = useLibrary();

  const [view, setView] = useState<MenuView>("main");
  const [folderName, setFolderName] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const ui = getMeetingUi(meetingId);

  useEffect(() => {
    if (!open) {
      setView("main");
      setFolderName("");
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (view === "create-folder" && open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [view, open]);

  useEffect(() => {
    if (!open) return;

    // Defer so the opening click doesn't immediately close the menu
    let remove: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      function onPointerDown(event: MouseEvent) {
        const target = event.target as Node;
        if (menuRef.current?.contains(target)) return;
        if (ignoreCloseRef?.current?.contains(target)) return;
        onClose();
      }

      function onKey(event: KeyboardEvent) {
        if (event.key === "Escape") onClose();
      }

      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("keydown", onKey);
      remove = () => {
        document.removeEventListener("mousedown", onPointerDown);
        document.removeEventListener("keydown", onKey);
      };
    }, 0);

    return () => {
      window.clearTimeout(timer);
      remove?.();
    };
  }, [open, onClose, ignoreCloseRef]);

  async function copyShareLink() {
    const url = `${window.location.origin}/meetings/${meetingId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        onClose();
      }, 900);
    } catch {
      setCopied(false);
    }
  }

  function handleCreateFolder() {
    const name = folderName.trim();
    if (!name) return;
    createFolderAndAddMeeting(meetingId, name);
    onClose();
  }

  if (!open) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.96, x: -4 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.96, x: -4 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="relative w-[300px] rounded-xl border border-border bg-[#1a1a1e] py-1.5 shadow-2xl shadow-black/50"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* beak */}
      <span className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 border-l border-t border-border bg-[#1a1a1e]" />

      <AnimatePresence mode="wait" initial={false}>
        {view === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.14 }}
            className="flex flex-col"
          >
            {folderId ? (
              <MenuRow
                icon={<FolderMinus className="h-4 w-4" />}
                title="Remove from Folder"
                subtitle="Remove this call from this folder"
                danger
                onClick={() => {
                  removeMeetingFromFolder(meetingId, folderId);
                  onClose();
                }}
              />
            ) : null}
            <MenuRow
              icon={<FolderPlus className="h-4 w-4" />}
              title="Add to Folder"
              subtitle="Create or add to a collection of calls"
              onClick={() => setView("folders")}
            />
            <MenuRow
              icon={<Link2 className="h-4 w-4" />}
              title={copied ? "Link Copied" : "Copy Share Link"}
              subtitle="Anyone with the link can view"
              onClick={copyShareLink}
            />
            <MenuRow
              icon={<Phone className="h-4 w-4" />}
              title="Add Meeting Type"
              subtitle={
                ui.meetingType
                  ? `Current: ${ui.meetingType}`
                  : "Assign a meeting type to categorize this call"
              }
              onClick={() => setView("meeting-type")}
            />
            <MenuRow
              icon={<Trash2 className="h-4 w-4" />}
              title="Delete Recording"
              danger
              onClick={() => {
                deleteMeeting(meetingId);
                onClose();
              }}
            />
          </motion.div>
        )}

        {view === "folders" && (
          <motion.div
            key="folders"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.14 }}
            className="flex flex-col"
          >
            <button
              type="button"
              onClick={() => setView("main")}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-muted hover:bg-bg-hover hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="mx-2 border-t border-border-subtle" />
            <button
              type="button"
              onClick={() => setView("create-folder")}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-text hover:bg-bg-hover"
            >
              <Plus className="h-4 w-4 text-accent" />
              Create a new folder
            </button>
            {folders.length > 0 && (
              <>
                <div className="mx-2 border-t border-border-subtle" />
                <div className="max-h-40 overflow-y-auto py-1">
                  {folders.map((folder) => {
                    const inFolder = ui.folderIds.includes(folder.id);
                    return (
                      <button
                        key={folder.id}
                        type="button"
                        disabled={inFolder}
                        onClick={() => {
                          addMeetingToFolder(meetingId, folder.id);
                          onClose();
                        }}
                        className={cn(
                          "flex w-full items-center px-3 py-2 text-left text-sm hover:bg-bg-hover",
                          inFolder ? "text-text-faint" : "text-text"
                        )}
                      >
                        {folder.name}
                        {inFolder ? (
                          <span className="ml-auto text-xs text-text-faint">Added</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}

        {view === "create-folder" && (
          <motion.div
            key="create-folder"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.14 }}
            className="px-3 py-2"
          >
            <button
              type="button"
              onClick={() => setView("folders")}
              className="mb-2 flex items-center gap-2 text-sm text-text-muted hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <label className="block text-xs font-medium uppercase tracking-wide text-text-faint">
              Folder name
            </label>
            <input
              ref={inputRef}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateFolder();
                }
              }}
              placeholder="e.g. Enterprise deals"
              className="mt-2 w-full rounded-lg border border-border bg-bg-input px-3 py-2 text-sm text-text outline-none placeholder:text-text-faint focus:border-accent"
            />
            <p className="mt-2 text-xs text-text-faint">Press Enter to create and save</p>
          </motion.div>
        )}

        {view === "meeting-type" && (
          <motion.div
            key="meeting-type"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.14 }}
            className="flex flex-col"
          >
            <button
              type="button"
              onClick={() => setView("main")}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-muted hover:bg-bg-hover hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="mx-2 border-t border-border-subtle" />
            {MEETING_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setMeetingType(meetingId, type);
                  onClose();
                }}
                className={cn(
                  "px-3 py-2.5 text-left text-sm hover:bg-bg-hover",
                  ui.meetingType === type ? "text-accent" : "text-text"
                )}
              >
                {type}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MenuRow({
  icon,
  title,
  subtitle,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-bg-hover",
        danger ? "text-danger" : "text-text"
      )}
    >
      <span className={cn("mt-0.5", danger ? "text-danger" : "text-text-muted")}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        {subtitle ? (
          <span
            className={cn(
              "mt-0.5 block text-xs",
              danger ? "text-danger/80" : "text-text-muted"
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  );
}
