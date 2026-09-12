"use client";

import { OnboardingPanel } from "@/components/onboarding/onboarding-panel";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Mic, Monitor, Scan } from "lucide-react";
import { useState } from "react";

const PERMISSIONS = [
  {
    id: "microphone",
    icon: Mic,
    title: "Microphone",
    description: "To capture your words",
  },
  {
    id: "accessibility",
    icon: Scan,
    title: "Accessibility",
    description: "For automatic meeting detection",
  },
  {
    id: "screen",
    icon: Monitor,
    title: "Screen & System Audio",
    description: "To hear other participants",
  },
] as const;

export function ConsentStep({ onNext }: { onNext: () => void }) {
  const [granted, setGranted] = useState<Record<string, boolean>>({});
  const allGranted = PERMISSIONS.every((permission) => granted[permission.id]);

  return (
    <OnboardingPanel>
      <motion.div
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
      >
        <Row>
          <h1 className="mt-5 text-[19px] font-semibold text-white">Welcome!</h1>
          <p className="mt-1 text-[13px] text-[#9a9a9a]">
            Enable permissions to capture your meeting
          </p>
        </Row>

        <div className="mt-5 flex flex-col gap-3">
          {PERMISSIONS.map((permission) => {
            const isGranted = Boolean(granted[permission.id]);
            const Icon = permission.icon;

            return (
              <Row key={permission.id}>
                <div className="flex items-center gap-3 rounded-xl border border-[#242424] bg-[#151515] px-4 py-3.5">
                  <Icon className="h-4 w-4 shrink-0 text-[#c8c8c8]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-white">
                      {permission.title}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-[#8f8f8f]">
                      {permission.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGranted((prev) => ({ ...prev, [permission.id]: true }))
                    }
                    disabled={isGranted}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                      isGranted
                        ? "bg-[#0d2a33] text-[#4ad0f5]"
                        : "bg-[#00c0fb] text-[#04121c] hover:bg-[#3fd0ff]"
                    )}
                  >
                    {isGranted ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Enabled
                      </>
                    ) : (
                      "Enable"
                    )}
                  </button>
                </div>
              </Row>
            );
          })}
        </div>

        <Row>
          <div className="mt-6 flex items-center justify-end gap-3">
            {!allGranted ? (
              <p className="text-[12px] text-[#7a7a7a]">
                Enable all permissions to continue
              </p>
            ) : null}
            <button
              type="button"
              onClick={onNext}
              disabled={!allGranted}
              className={cn(
                "rounded-full px-5 py-2 text-[13.5px] font-semibold transition-colors",
                allGranted
                  ? "bg-[#00c0fb] text-[#04121c] hover:bg-[#3fd0ff]"
                  : "cursor-not-allowed bg-[#1c1c1c] text-[#5a5a5a]"
              )}
            >
              Next
            </button>
          </div>
        </Row>
      </motion.div>
    </OnboardingPanel>
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
