"use client";

import { hasCompletedOnboarding } from "@/lib/onboarding";
import Link from "next/link";
import { useEffect, useState, type ComponentProps } from "react";

/** Routes to meetings once onboarding is done for this browser session. */
export function GetStartedLink({
  href = "/onboarding",
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href?: string }) {
  const [destination, setDestination] = useState(href);

  useEffect(() => {
    if (hasCompletedOnboarding()) setDestination("/meetings");
  }, []);

  return <Link href={destination} {...props} />;
}
