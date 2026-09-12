"use client";

import { formatTimestamp, initials } from "@/lib/format";
import { usePlayback } from "@/lib/playback-context";
import type { TranscriptComment } from "@/lib/types/meeting";
import { motion } from "framer-motion";
import { ArrowUp, Play, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Inline "Leave a comment" composer shown when hovering a transcript line. */
export function CommentComposer({
  onSubmit,
  onDismiss,
}: {
  onSubmit: (text: string) => void;
  onDismiss: () => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="flex w-[270px] items-center gap-2 rounded-xl border border-border bg-[#1a1a1e] px-3 py-2"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <UserCircle2 className="h-4 w-4 shrink-0 text-text-faint" />
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") onDismiss();
        }}
        placeholder="Leave a comment"
        className="min-w-0 flex-1 bg-transparent text-sm text-text placeholder:text-text-faint outline-none"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Post comment"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-bg transition hover:bg-accent-strong"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

/** Popover listing existing comments for a line, with a reply box. */
export function CommentThread({
  comments,
  onReply,
  onDismiss,
}: {
  comments: TranscriptComment[];
  onReply: (text: string) => void;
  onDismiss?: () => void;
}) {
  const { seek, play } = usePlayback();
  const [reply, setReply] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="w-[270px] rounded-xl border border-border bg-bg-elevated px-3 py-2.5"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id}>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-bg-hover text-[8px] font-semibold text-text">
                {initials(comment.author)}
              </span>
              <span className="font-medium text-text">{comment.author}</span>
              <span className="text-text-faint">·</span>
              <button
                type="button"
                onClick={() => {
                  seek(comment.timestampMs);
                  play();
                }}
                className="inline-flex items-center gap-0.5 font-mono text-accent transition hover:text-accent-strong"
              >
                <Play className="h-2.5 w-2.5 fill-current" />
                {formatTimestamp(comment.timestampMs)}
              </button>
              <span className="text-text-faint">· now</span>
            </div>
            <p className="mt-1 select-text text-sm text-text-muted">{comment.text}</p>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && reply.trim()) {
            e.preventDefault();
            onReply(reply.trim());
            setReply("");
          }
          if (e.key === "Escape") onDismiss?.();
        }}
        placeholder="Reply..."
        className="mt-3 w-full border-t border-border-subtle bg-transparent pt-2 text-sm text-text placeholder:text-text-faint outline-none"
      />
    </motion.div>
  );
}
