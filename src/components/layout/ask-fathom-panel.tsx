"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, ChevronDown, PanelRightClose, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const accountSuggestions = [
  "Surprise me with an insight",
  "Summarize my meetings from today",
  "Next steps on projects?",
];

const callSuggestions = [
  "Write a follow-up email",
  "Find any moments of friction or disagreement",
  "Biggest takeaways?",
];

export function AskFathomPanel({
  scope = "account",
  embedded = false,
}: {
  scope?: "account" | "call";
  embedded?: boolean;
}) {
  const suggestions = scope === "call" ? callSuggestions : accountSuggestions;
  const scopeLabel = scope === "call" ? "This Call" : "My Calls";

  return (
    <aside
      className={cn(
        "flex-col bg-bg-elevated",
        embedded
          ? "flex min-h-0 flex-1 border-t border-border-subtle"
          : "hidden w-[320px] shrink-0 border-l border-border-subtle xl:flex"
      )}
    >
      <div className="flex h-11 items-center justify-between border-b border-border-subtle px-4">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-text">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          ASK FATHOM
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-text-faint hover:bg-bg-hover hover:text-text"
          aria-label="Collapse Ask Fathom"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {scope === "account" ? (
          <div className="rounded-xl border border-[#3a3218] bg-[#1c190e] px-3 py-3 text-sm text-[#e8d48b]">
            <div className="mb-1 flex items-center gap-2 font-medium text-[#f5c542]">
              <Sparkles className="h-3.5 w-3.5" />
              Account-level Ask Fathom is here!
            </div>
            <p className="text-[13px] leading-relaxed text-[#c4b37a]">
              Ask across all your calls — summaries, next steps, and patterns.
            </p>
          </div>
        ) : null}

        <div className="mt-auto flex flex-col items-end gap-2">
          {suggestions.map((prompt, index) => (
            <motion.button
              key={prompt}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.25 }}
              className="max-w-[95%] rounded-2xl rounded-br-md bg-bg-surface px-3 py-2 text-left text-[13px] text-text-muted transition hover:bg-bg-hover hover:text-text"
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="border-t border-border-subtle p-3">
        <div className="rounded-xl border border-border bg-bg-input p-2">
          <textarea
            rows={2}
            placeholder="Ask anything..."
            className="w-full resize-none bg-transparent px-1 py-1 text-sm text-text placeholder:text-text-faint outline-none"
          />
          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-muted hover:bg-bg-hover hover:text-text"
            >
              {scopeLabel}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-bg transition hover:bg-accent-strong"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
