"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** The small app-window chrome shared by the consent and capture steps. */
export function OnboardingPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[460px] rounded-2xl border border-[#232323] bg-[#0a0a0a] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.75)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold tracking-[0.14em] text-white">
            FATHOM
          </span>
          <Image
            src="/assets/hero/logo.svg"
            alt=""
            width={151}
            height={153}
            className="h-3.5 w-3.5"
          />
        </div>
        <Link
          href="/"
          aria-label="Close onboarding"
          className="rounded-md p-1 text-[#8a8a8a] transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>

      {children}
    </div>
  );
}
