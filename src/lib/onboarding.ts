const ONBOARDING_DONE_KEY = "fathom.onboarding.done";

export const ONBOARDING_VIDEOS = [
  "/assets/onboarding/onboarding-1.mov",
  "/assets/onboarding/onboarding-2.mov",
] as const;

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(ONBOARDING_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingComplete(): void {
  try {
    window.sessionStorage.setItem(ONBOARDING_DONE_KEY, "1");
  } catch {
    // Private mode / blocked storage — onboarding may show again this session.
  }
}

/** Warm the browser cache so video steps start without a cold fetch. */
export function preloadOnboardingVideos(): void {
  if (typeof window === "undefined") return;

  for (const src of ONBOARDING_VIDEOS) {
    const existing = document.querySelector(
      `link[data-onboarding-preload="${src}"]`
    );
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = src;
      link.setAttribute("data-onboarding-preload", src);
      document.head.appendChild(link);
    }

    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = src;
    video.load();
  }
}
