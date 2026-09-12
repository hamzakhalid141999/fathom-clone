"use client";

import { cn } from "@/lib/utils";
import { useLibrary } from "@/lib/library-context";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs: { href: string; label: string; disabled?: boolean; badge?: string }[] = [
  { href: "/meetings", label: "My Calls" },
  { href: "#", label: "Team Calls", disabled: true },
  { href: "/folders", label: "Folders" },
  { href: "#", label: "Playlists", disabled: true },
  { href: "#", label: "Trackers", disabled: true, badge: "NEW" },
  { href: "#", label: "Deals", disabled: true },
  { href: "#", label: "Coaching", disabled: true },
];

export function SubNav() {
  const pathname = usePathname();
  const { folders } = useLibrary();

  return (
    <nav className="flex h-11 shrink-0 items-center gap-6 border-b border-border-subtle bg-bg-elevated px-6">
      {tabs.map((tab) => {
        const active =
          tab.href === "/meetings"
            ? pathname === "/meetings" || pathname.startsWith("/meetings/")
            : tab.href !== "#" && pathname.startsWith(tab.href);

        const className = cn(
          "relative h-full inline-flex items-center gap-1.5 text-sm transition-colors",
          active ? "text-accent font-medium" : "text-text-muted hover:text-text",
          tab.disabled && "cursor-default opacity-60 hover:text-text-muted"
        );

        const label = (
          <>
            {tab.label}
            {tab.href === "/folders" && folders.length > 0 ? (
              <span className="rounded-full bg-bg-hover px-1.5 py-0.5 text-[10px] text-text-muted">
                {folders.length}
              </span>
            ) : null}
            {tab.badge ? (
              <span className="rounded-sm bg-[#f5c542]/15 px-1 py-0.5 text-[9px] font-semibold tracking-wide text-[#f5c542]">
                {tab.badge}
              </span>
            ) : null}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </>
        );

        if (tab.disabled) {
          return (
            <span key={tab.label} className={className}>
              {label}
            </span>
          );
        }

        return (
          <Link key={tab.label} href={tab.href} className={className}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
