import { AskFathomPanel } from "@/components/layout/ask-fathom-panel";
import { SubNav } from "@/components/layout/sub-nav";
import { TopNav } from "@/components/layout/top-nav";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  showAskPanel = true,
  scrollMain = true,
}: {
  children: React.ReactNode;
  showAskPanel?: boolean;
  /** Detail views manage their own internal scrolling. */
  scrollMain?: boolean;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-text">
      <TopNav />
      <SubNav />
      <div className="flex min-h-0 flex-1">
        <main
          className={cn(
            "min-w-0 flex-1",
            scrollMain ? "overflow-y-auto" : "overflow-hidden"
          )}
        >
          {children}
        </main>
        {showAskPanel ? <AskFathomPanel /> : null}
      </div>
    </div>
  );
}
