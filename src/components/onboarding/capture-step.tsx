"use client";

import { OnboardingPanel } from "@/components/onboarding/onboarding-panel";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignJustify,
  ArrowLeft,
  Check,
  ChevronDown,
  Headphones,
  MonitorPlay,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CaptureMode = "video" | "audio" | "transcript";

const MODES = [
  {
    id: "video" as const,
    icon: MonitorPlay,
    title: "Video & Audio",
    description: "Capture video, audio & screen sharing",
  },
  { id: "audio" as const, icon: Headphones, title: "Audio" },
  { id: "transcript" as const, icon: AlignJustify, title: "Transcript Only" },
];

const BOT_OPTIONS = [
  { value: "never", label: "Never send a bot", hint: "(audio-only on some platforms)" },
  { value: "always", label: "Always send a bot", hint: "(video on every platform)" },
];

export function CaptureStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<CaptureMode>("video");
  const [botOption, setBotOption] = useState(BOT_OPTIONS[0]);

  return (
    <OnboardingPanel>
      <motion.div
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
      >
        <Row>
          <h1 className="mt-5 text-[19px] font-semibold text-white">
            Select what to capture
          </h1>
          <p className="mt-1 text-[13px] text-[#9a9a9a]">
            You can change this before any meeting
          </p>
        </Row>

        <div className="mt-5 flex flex-col gap-3">
          {MODES.map((option) => {
            const selected = mode === option.id;
            const Icon = option.icon;

            return (
              <Row key={option.id}>
                {/* A div, not a button: the bot dropdown below nests real buttons. */}
                <div
                  role="radio"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => setMode(option.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setMode(option.id);
                    }
                  }}
                  className={cn(
                    "w-full cursor-pointer border px-4 py-3.5 text-left outline-none transition-colors",
                    selected && option.id === "video"
                      ? "rounded-t-xl border-[#00c0fb] bg-[#091c22]"
                      : selected
                        ? "rounded-xl border-[#00c0fb] bg-[#091c22]"
                        : "rounded-xl border-[#242424] bg-[#151515] hover:border-[#3a3a3a]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-[#c8c8c8]" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[14.5px] font-semibold text-white">
                          {option.title}
                        </span>
                        <span className="rounded bg-[#083543] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#4ad0f5]">
                          BOT-FREE
                        </span>
                      </span>
                      {option.description ? (
                        <span className="text-[12.5px] text-[#8f8f8f]">
                          {option.description}
                        </span>
                      ) : null}
                    </div>

                    {selected ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00c0fb]">
                        <Check className="h-3 w-3 text-[#04121c]" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-[#4a4a4a]" />
                    )}
                  </div>

                </div>
                {selected && option.id === "video" ? (
                  <div className="-mt-px rounded-b-xl border border-t-0 border-[#00c0fb] bg-[#091c22] px-4 pb-3.5 pt-3">
                    <p className="text-[12.5px] text-[#9a9a9a]">
                      <span className="underline decoration-dotted underline-offset-2">
                        Some platforms
                      </span>{" "}
                      need a bot to capture video
                    </p>
                    <BotSelect value={botOption} onChange={setBotOption} />
                  </div>
                ) : null}
              </Row>
            );
          })}
        </div>

        <Row>
          <p className="mt-5 flex items-center gap-2 text-[12.5px] text-[#8f8f8f]">
            <Check className="h-3.5 w-3.5" />
            All Fathom features included in every mode
          </p>
        </Row>

        <Row>
          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1c1c1c] text-[#c8c8c8] transition-colors hover:bg-[#262626] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-[#00c0fb] px-5 py-2 text-[13.5px] font-semibold text-[#04121c] transition-colors hover:bg-[#3fd0ff]"
            >
              Next
            </button>
          </div>
        </Row>
      </motion.div>
    </OnboardingPanel>
  );
}

function BotSelect({
  value,
  onChange,
}: {
  value: (typeof BOT_OPTIONS)[number];
  onChange: (next: (typeof BOT_OPTIONS)[number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative mt-2.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex w-full items-center gap-1.5 rounded-lg border border-[#12455a] bg-[#0a2d39] px-3 py-2 text-left"
      >
        <span className="text-[12.5px] font-semibold text-white">{value.label}</span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#8fa9b3]">
          {value.hint}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#8fa9b3]" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg border border-[#12455a] bg-[#0b2330]"
          >
            {BOT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange(option);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-1.5 px-3 py-2 text-left transition-colors hover:bg-[#123b49]"
              >
                <span
                  className={cn(
                    "text-[12.5px] font-semibold",
                    option.value === value.value ? "text-[#4ad0f5]" : "text-white"
                  )}
                >
                  {option.label}
                </span>
                <span className="truncate text-[12.5px] text-[#8fa9b3]">
                  {option.hint}
                </span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        shown: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
