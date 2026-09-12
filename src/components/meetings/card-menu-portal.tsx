"use client";

import { MeetingCardMenu } from "@/components/meetings/meeting-card-menu";
import { useEffect, useState } from "react";

const MENU_WIDTH = 300;

/** Renders the card menu in a fixed layer so it is never clipped by the card. */
export function CardMenuPortal({
  meetingId,
  menuButtonRef,
  onClose,
  folderId,
}: {
  meetingId: string;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  folderId?: string;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    function place() {
      const btn = menuButtonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const left = Math.max(
        8,
        Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)
      );
      setPos({ top: rect.bottom + 8, left });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [menuButtonRef]);

  if (!pos) return null;

  return (
    <div
      className="fixed z-[100]"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <MeetingCardMenu
        meetingId={meetingId}
        open
        onClose={onClose}
        ignoreCloseRef={menuButtonRef}
        folderId={folderId}
      />
    </div>
  );
}
