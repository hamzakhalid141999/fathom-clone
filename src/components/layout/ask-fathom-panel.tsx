"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

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
  const [collapsed, setCollapsed] = useState(false);
  const suggestions = scope === "call" ? callSuggestions : accountSuggestions;
  const scopeLabel = scope === "call" ? "This Call" : "My Calls";

  if (embedded) {
    return (
      <aside
        className={cn(
          "flex min-h-0 flex-col border-t border-border-subtle bg-bg",
          collapsed ? "shrink-0" : "flex-1"
        )}
      >
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border-subtle px-4">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-text">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            ASK FATHOM
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-md p-1 text-text-faint transition hover:bg-bg-hover hover:text-text"
            aria-label={collapsed ? "Expand Ask Fathom" : "Collapse Ask Fathom"}
          >
            {collapsed ? (
              <PanelRightOpen className="h-4 w-4" />
            ) : (
              <PanelRightClose className="h-4 w-4" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {!collapsed ? (
            <motion.div
              key="embedded-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <PanelBody
                scope={scope}
                suggestions={suggestions}
                scopeLabel={scopeLabel}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </aside>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 48 : 320 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 hidden h-full shrink-0 overflow-hidden border-l border-border-subtle bg-bg xl:flex"
    >
      {collapsed ? (
        <div className="flex h-full w-12 flex-col items-center gap-3 py-3">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="rounded-md p-1.5 text-text-faint transition hover:bg-bg-hover hover:text-text"
            aria-label="Expand Ask Fathom"
            title="Expand Ask Fathom"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="rounded-md p-1.5 text-accent transition hover:bg-bg-hover"
            aria-label="Ask Fathom"
            title="Ask Fathom"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex h-full w-[320px] flex-col">
          <div className="flex h-11 shrink-0 items-center justify-between border-b px-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-text">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              ASK FATHOM
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded-md p-1 text-text-faint transition hover:bg-bg-hover hover:text-text"
              aria-label="Collapse Ask Fathom"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>

          <PanelBody
            scope={scope}
            suggestions={suggestions}
            scopeLabel={scopeLabel}
          />
        </div>
      )}
    </motion.aside>
  );
}

function PanelBody({
  scope,
  suggestions,
  scopeLabel,
}: {
  scope: "account" | "call";
  suggestions: string[];
  scopeLabel: string;
}) {
  return (
    <>
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
              className="max-w-[95%] text-white rounded-[7px] rounded-br-md bg-bg border border-bg-elevated px-3 py-2 text-left text-[13px] transition hover:bg-bg-hover hover:text-text"
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
            className="w-full resize-none border-none bg-transparent px-1 py-1 text-sm text-text placeholder:text-text-faint outline-none"
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
    </>
  );
}
