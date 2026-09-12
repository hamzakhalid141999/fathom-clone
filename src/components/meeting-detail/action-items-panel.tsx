"use client";

import { formatTimestamp } from "@/lib/format";
import { usePlayback } from "@/lib/playback-context";
import type { ActionItem } from "@/lib/types/meeting";
import { cn } from "@/lib/utils";
import { Check, ListChecks, Play } from "lucide-react";

export function ActionItemsPanel({
  items,
  completed,
  onToggle,
}: {
  items: ActionItem[];
  completed: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const { seek, play } = usePlayback();
  const doneCount = items.filter((item) => completed[item.id]).length;

  if (items.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-text-muted">
        No action items detected.
      </div>
    );
  }

  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-accent" />
        <h3 className="text-lg font-semibold text-text">Action Items</h3>
        <span className="text-xs text-text-faint">
          {doneCount}/{items.length} complete
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const isDone = Boolean(completed[item.id]);

          return (
            <li
              key={item.id}
              className="group flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-surface px-3 py-3 transition hover:border-border"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={isDone}
                onClick={() => onToggle(item.id)}
                className={cn(
                  "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition",
                  isDone
                    ? "border-success bg-success text-bg"
                    : "border-border-strong text-transparent hover:border-accent"
                )}
                style={{ height: 18, width: 18 }}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "select-text text-sm transition-colors",
                    isDone ? "text-text-faint line-through" : "text-text"
                  )}
                >
                  {item.text}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                  {item.assigneeName ? <span>{item.assigneeName}</span> : null}
                  {item.dueDate ? (
                    <>
                      <span className="text-text-faint">·</span>
                      <span>Due {item.dueDate}</span>
                    </>
                  ) : null}
                  {typeof item.sourceTimestampMs === "number" ? (
                    <>
                      <span className="text-text-faint">·</span>
                      <button
                        type="button"
                        onClick={() => {
                          seek(item.sourceTimestampMs as number);
                          play();
                        }}
                        className="inline-flex items-center gap-1 font-mono text-accent transition hover:text-accent-strong"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        {formatTimestamp(item.sourceTimestampMs)}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
