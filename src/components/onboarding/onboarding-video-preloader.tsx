"use client";

import { preloadOnboardingVideos } from "@/lib/onboarding";
import { useEffect } from "react";

/** Starts fetching onboarding clips as soon as the landing page mounts. */
export function OnboardingVideoPreloader() {
  useEffect(() => {
    preloadOnboardingVideos();
  }, []);

  return null;
}
