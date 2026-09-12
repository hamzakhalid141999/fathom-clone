"use client";

import { Gift, HelpCircle, Search, Settings, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TopNav() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-subtle bg-bg-elevated px-4">
      <Link href="/meetings" className="flex items-center gap-2 shrink-0">
        <span className="text-[15px] font-semibold tracking-[0.14em] text-text">
          FATHOM
        </span>
        <Image
          src="/assets/logo/logo.svg"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
          priority
        />
      </Link>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = term.trim();
          router.push(trimmed ? `/meetings?q=${encodeURIComponent(trimmed)}` : "/meetings");
        }}
        className="mx-auto flex w-full max-w-xl items-center"
      >
        <label className="relative flex w-full items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-text-faint" />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search Call Recordings"
            className="h-9 w-full rounded-lg border border-transparent bg-bg-input pl-9 pr-3 text-sm text-text placeholder:text-text-faint outline-none transition focus:border-border focus:bg-bg-surface"
          />
        </label>
      </form>

      <div className="flex shrink-0 items-center gap-1 text-text-muted">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-bg-hover hover:text-text"
        >
          <Gift className="h-4 w-4" />
          <span className="hidden lg:inline">Refer</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-bg-hover hover:text-text"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden lg:inline">Settings</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm hover:bg-bg-hover hover:text-text"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden xl:inline">Help & Feedback</span>
        </button>
        <div className="ml-1 inline-flex items-center gap-1 rounded-full bg-bg-surface px-2 py-1 text-sm text-points">
          <Star className="h-3.5 w-3.5 fill-points text-points" />
          <span className="font-medium">25</span>
        </div>
        <div
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-bg-hover text-sm font-medium text-text"
          aria-label="Account"
        >
          H
        </div>
      </div>
    </header>
  );
}
