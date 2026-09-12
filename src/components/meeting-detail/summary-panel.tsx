"use client";

import { getSummaryTemplates } from "@/lib/data/summary-templates";
import { usePlayback } from "@/lib/playback-context";
import type { Meeting, SummaryBullet, SummaryTemplate } from "@/lib/types/meeting";
import { cn, hasTextSelection } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Copy,
  LayoutTemplate,
  Play,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export function SummaryPanel({ meeting }: { meeting: Meeting }) {
  const templates = useMemo(() => getSummaryTemplates(meeting), [meeting]);
  const [templateId, setTemplateId] = useState(templates[0]?.id);
  const template =
    templates.find((t) => t.id === templateId) ?? templates[0];

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <TemplateSwitcher
          templates={templates}
          active={template}
          onSelect={setTemplateId}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-bg-elevated px-2.5 py-1.5 text-xs text-text-muted transition hover:bg-bg-hover hover:text-text"
          >
            <Send className="h-3.5 w-3.5" />
            Send to...
          </button>
          <CopySummaryButton template={template} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-6 space-y-7"
        >
          {template.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-base font-semibold text-text">
                {section.heading}
              </h3>
              {section.paragraph ? (
                <p className="mt-2 select-text text-sm leading-relaxed text-text-muted">
                  {section.paragraph}
                </p>
              ) : null}
              {section.bullets?.length ? (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((bullet, index) => (
                    <SummaryBulletRow key={index} bullet={bullet} />
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SummaryBulletRow({
  bullet,
  depth = 0,
}: {
  bullet: SummaryBullet;
  depth?: number;
}) {
  const { seek, play } = usePlayback();
  const jumpable = typeof bullet.timestampMs === "number";

  function jump() {
    if (!jumpable || hasTextSelection()) return;
    seek(bullet.timestampMs as number);
    play();
  }

  return (
    <li className={cn(depth > 0 && "ml-5")}>
      <div
        role={jumpable ? "button" : undefined}
        tabIndex={jumpable ? 0 : undefined}
        onClick={jump}
        onKeyDown={(e) => {
          if (jumpable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            jump();
          }
        }}
        className={cn(
          "group -mx-3 flex items-start gap-2 rounded-lg px-3 py-2 outline-none transition-colors",
          jumpable && "cursor-pointer hover:bg-black"
        )}
      >
        <span
          className={cn(
            "mt-[9px] h-1 w-1 shrink-0 rounded-full bg-text-faint transition-colors",
            jumpable && "group-hover:bg-accent"
          )}
        />
        <p
          className={cn(
            "min-w-0 flex-1 select-text text-sm leading-relaxed text-text-muted transition-colors",
            jumpable && "group-hover:text-accent"
          )}
        >
          {bullet.label ? (
            <span
              className={cn(
                "font-semibold text-text transition-colors",
                jumpable && "group-hover:text-accent"
              )}
            >
              {bullet.label}:{" "}
            </span>
          ) : null}
          {bullet.text}
        </p>
        {jumpable ? (
          <Play
            aria-hidden
            className="mt-1 h-3.5 w-3.5 shrink-0 fill-current text-accent opacity-0 transition-opacity group-hover:opacity-100"
          />
        ) : null}
      </div>

      {bullet.children?.length ? (
        <ul className="mt-2 space-y-2">
          {bullet.children.map((child, index) => (
            <SummaryBulletRow key={index} bullet={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function TemplateSwitcher({
  templates,
  active,
  onSelect,
}: {
  templates: SummaryTemplate[];
  active: SummaryTemplate;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-lg font-semibold text-text transition hover:text-white"
      >
        <LayoutTemplate className="h-4 w-4 text-accent" />
        {active.name}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-text-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 w-[280px] overflow-hidden rounded-xl border border-border bg-[#1a1a1e] py-1 shadow-2xl shadow-black/50"
          >
            {templates.map((template) => {
              const isActive = template.id === active.id;
              return (
                <li key={template.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      onSelect(template.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition hover:bg-bg-hover"
                  >
                    <span className="mt-0.5 w-4 shrink-0">
                      {isActive ? (
                        <Check className="h-4 w-4 text-accent" />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          isActive ? "text-accent" : "text-text"
                        )}
                      >
                        {template.name}
                      </span>
                      {template.description ? (
                        <span className="mt-0.5 block text-xs text-text-muted">
                          {template.description}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CopySummaryButton({ template }: { template: SummaryTemplate }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const lines: string[] = [template.name, ""];
    for (const section of template.sections) {
      lines.push(section.heading);
      if (section.paragraph) lines.push(section.paragraph);
      for (const bullet of section.bullets ?? []) {
        lines.push(`- ${bullet.label ? `${bullet.label}: ` : ""}${bullet.text}`);
        for (const child of bullet.children ?? []) {
          lines.push(`  - ${child.label ? `${child.label}: ` : ""}${child.text}`);
        }
      }
      lines.push("");
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy summary"
      className="rounded-lg bg-bg-elevated p-1.5 text-text-muted transition hover:bg-bg-hover hover:text-text"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
