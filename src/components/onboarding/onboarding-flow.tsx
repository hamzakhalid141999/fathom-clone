"use client";

import { CaptureStep } from "@/components/onboarding/capture-step";
import { ConsentStep } from "@/components/onboarding/consent-step";
import { VideoStep } from "@/components/onboarding/video-step";
import { Starfield } from "@/components/marketing/starfield";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STEPS = ["consent", "video-1", "capture", "video-2"] as const;
type Step = (typeof STEPS)[number];

const EASE = [0.22, 1, 0.36, 1] as const;

const variants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? 28 : -28,
    scale: 0.96,
    filter: "blur(8px)",
  }),
  center: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? -22 : 22,
    scale: 0.97,
    filter: "blur(8px)",
  }),
};

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("consent");
  const [direction, setDirection] = useState(1);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    router.prefetch("/meetings");
  }, [router]);

  function go(next: Step) {
    setDirection(STEPS.indexOf(next) > STEPS.indexOf(step) ? 1 : -1);
    setStep(next);
  }

  /** Fades the screen out before handing off to the app. */
  function finish() {
    setDirection(1);
    setLeaving(true);
    window.setTimeout(() => router.push("/meetings"), 460);
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black px-6 py-12">
      <Starfield />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00c0fb]/[0.07] blur-[120px]"
      />

      <div className="relative z-10 flex w-full items-center justify-center">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {leaving ? null : (
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
              className="flex w-full justify-center"
            >
              {step === "consent" ? (
                <ConsentStep onNext={() => go("video-1")} />
              ) : null}

              {step === "video-1" ? (
                <VideoStep
                  src="/assets/onboarding/onboarding-1.mp4"
                  onDone={() => go("capture")}
                  onBack={() => go("consent")}
                />
              ) : null}

              {step === "capture" ? (
                <CaptureStep
                  onNext={() => go("video-2")}
                  onBack={() => go("video-1")}
                />
              ) : null}

              {step === "video-2" ? (
                <VideoStep
                  src="/assets/onboarding/onboarding-2.mp4"
                  onDone={finish}
                  onBack={() => go("capture")}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cross-fade in from the landing page, and out into the app. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: leaving ? 1 : 0 }}
        transition={{ duration: leaving ? 0.42 : 0.55, ease: "easeInOut" }}
        className="pointer-events-none fixed inset-0 z-50 bg-black"
      />
    </div>
  );
}
