"use client";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
