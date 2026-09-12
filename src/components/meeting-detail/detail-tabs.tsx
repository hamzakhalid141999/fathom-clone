"use client";

import { cn } from "@/lib/utils";
import { FileText, ListChecks, Sparkles } from "lucide-react";

export type DetailTab = "summary" | "action-items" | "transcript";

const tabs: { id: DetailTab; label: string; icon: typeof Sparkles }[] = [
  { id: "summary", label: "Summary", icon: Sparkles },
  { id: "action-items", label: "Action Items", icon: ListChecks },
  { id: "transcript", label: "Transcript", icon: FileText },
];

export function DetailTabs({
  active,
  onChange,
  actionItemCount,
}: {
  active: DetailTab;
  onChange: (tab: DetailTab) => void;
  actionItemCount: number;
}) {
  return (
    <div
      role="tablist"
      className="flex shrink-0 items-center gap-6 border-b border-border-subtle px-6"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative -mb-px inline-flex items-center gap-2 py-3 text-sm transition-colors",
              isActive ? "font-medium text-accent" : "text-text-muted hover:text-text"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {tab.id === "action-items" && actionItemCount > 0 ? (
              <span className="rounded-full bg-bg-hover px-1.5 py-0.5 text-[10px] text-text-muted">
                {actionItemCount}
              </span>
            ) : null}
            {isActive ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
