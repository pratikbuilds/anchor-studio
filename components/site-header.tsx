import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import dynamic from "next/dynamic";
import WalletBtn from "./wallet-btn";
import { RpcSettings } from "./rpc-settings";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";

function ThemeToggleLoading() {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      aria-label="Loading theme toggle"
    >
      <div className="size-5 animate-pulse bg-muted rounded" />
      <span className="sr-only">Loading theme toggle</span>
    </Button>
  );
}

function ThemeToggleError() {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      className="text-red-500 hover:text-red-500"
      aria-label="Failed to load theme toggle"
    >
      <div className="size-5 bg-red-500/20 rounded" />
      <span className="sr-only">Failed to load theme toggle</span>
    </Button>
  );
}

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => <ThemeToggleLoading />,
  }
);

export function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>
      <div className="flex items-center gap-2 px-4">
        <div className="flex items-center gap-1">
          <RpcSettings />
          <ErrorBoundary FallbackComponent={ThemeToggleError}>
            <ThemeToggle />
          </ErrorBoundary>
        </div>
        <WalletBtn />
      </div>
    </header>
  );
}
