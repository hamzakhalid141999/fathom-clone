"use client";

import { CaptureStep } from "@/components/onboarding/capture-step";
import { ConsentStep } from "@/components/onboarding/consent-step";
import { VideoStep } from "@/components/onboarding/video-step";
import { Starfield } from "@/components/marketing/starfield";
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
  ONBOARDING_VIDEOS,
  preloadOnboardingVideos,
} from "@/lib/onboarding";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STEPS = ["consent", "video-1", "capture", "video-2"] as const;
type Step = (typeof STEPS)[number];

const VIDEO_STEPS = new Set<Step>(["video-1", "video-2"]);
const BLACKOUT_MS = 500;
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
  const [allowed, setAllowed] = useState(false);
  const [step, setStep] = useState<Step>("consent");
  const [direction, setDirection] = useState(1);
  const [leaving, setLeaving] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [awaitingReveal, setAwaitingReveal] = useState(false);

  useEffect(() => {
    if (hasCompletedOnboarding()) {
      router.replace("/meetings");
      return;
    }
    preloadOnboardingVideos();
    setAllowed(true);
    router.prefetch("/meetings");
  }, [router]);

  function go(next: Step) {
    const nextDirection = STEPS.indexOf(next) > STEPS.indexOf(step) ? 1 : -1;
    setDirection(nextDirection);

    if (VIDEO_STEPS.has(next) && nextDirection > 0) {
      setBlackout(true);
      setVideoReady(false);
      setAwaitingReveal(true);
      window.setTimeout(() => {
        setStep(next);
        setBlackout(false);
      }, BLACKOUT_MS);
      return;
    }

    setAwaitingReveal(false);
    setVideoReady(VIDEO_STEPS.has(next));
    setStep(next);
  }

  /** Fades the screen out before handing off to the app. */
  function finish() {
    markOnboardingComplete();
    setDirection(1);
    setLeaving(true);
    window.setTimeout(() => router.push("/meetings"), 460);
  }

  if (!allowed) {
    return <div className="min-h-dvh bg-black" />;
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black px-4 py-8 lg:px-6 lg:py-10">
      <Starfield />

      {/* Keep both clips in the HTTP/media cache while earlier steps are shown. */}
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden>
        {ONBOARDING_VIDEOS.map((src) => (
          <video key={src} src={src} preload="auto" muted playsInline />
        ))}
      </div>

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
                  src={ONBOARDING_VIDEOS[0]}
                  startPlayback={videoReady}
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
                  src={ONBOARDING_VIDEOS[1]}
                  startPlayback={videoReady}
                  onDone={finish}
                  onBack={() => go("capture")}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Landing fade-in, video blackout, and exit into the app. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: leaving || blackout ? 1 : 0 }}
        transition={{
          duration: leaving ? 0.42 : blackout ? 0.32 : 0.5,
          ease: "easeInOut",
        }}
        onAnimationComplete={() => {
          if (awaitingReveal && !leaving && !blackout && VIDEO_STEPS.has(step)) {
            setAwaitingReveal(false);
            setVideoReady(true);
          }
        }}
        className="pointer-events-none fixed inset-0 z-50 bg-black"
      />
    </div>
  );
}
