"use client";

import { ClipsProvider } from "@/lib/clips-context";
import { LibraryProvider } from "@/lib/library-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LibraryProvider>
      <ClipsProvider>{children}</ClipsProvider>
    </LibraryProvider>
  );
}
