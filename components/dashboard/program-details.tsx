"use client";

import { ProgramDetails as ProgramDetailsType } from "@/lib/stores/program-store";

interface ProgramDetailsProps {
  programDetails: ProgramDetailsType;
  onReinitialize: () => void;
}

export function ProgramDetails({
  programDetails,
  onReinitialize,
}: ProgramDetailsProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Program</h1>
          <p className="text-muted-foreground mt-1">
            Manage and interact with your Anchor program
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onReinitialize}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Reinitialize Program
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/40 bg-gradient-to-b from-card/80 to-card shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border/20">
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {programDetails.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Solana Program</p>
          </div>
          <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {programDetails.cluster}
          </div>
        </div>

        <div className="p-6 grid gap-4 bg-card/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1 p-3 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-xs font-medium text-muted-foreground">
                INITIALIZED
              </span>
              <span className="text-sm font-medium">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(programDetails.initializedAt))}
              </span>
            </div>

            <div className="flex flex-col space-y-1 p-3 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-xs font-medium text-muted-foreground">
                NETWORK
              </span>
              <span className="text-sm font-medium capitalize">
                {programDetails.cluster}
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-1 p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                PROGRAM ID
              </span>
              <button
                className="text-xs text-primary hover:text-primary/80"
                onClick={() =>
                  navigator.clipboard.writeText(programDetails.programId)
                }
              >
                Copy
              </button>
            </div>
            <span className="text-sm font-mono truncate">
              {programDetails.programId}
            </span>
          </div>

          <div className="flex flex-col space-y-1 p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                RPC ENDPOINT
              </span>
              <button
                className="text-xs text-primary hover:text-primary/80"
                onClick={() =>
                  navigator.clipboard.writeText(programDetails.rpcUrl)
                }
              >
                Copy
              </button>
            </div>
            <span className="text-sm font-mono truncate">
              {programDetails.rpcUrl}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4 bg-gradient-to-b from-transparent to-muted/10">
          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors py-3 font-medium"
            onClick={() => (window.location.href = "/accounts")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 14v1" />
              <path d="M9 19v2" />
              <path d="M9 3v2" />
              <path d="M9 9v1" />
              <path d="M15 14v1" />
              <path d="M15 19v2" />
              <path d="M15 3v2" />
              <path d="M15 9v1" />
            </svg>
            Accounts
          </button>
          <button
            className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors py-3 font-medium"
            onClick={() => (window.location.href = "/instructions")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m16 18 2-2-2-2" />
              <path d="m8 6-2 2 2 2" />
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m6 8 12 8" />
            </svg>
            Instructions
          </button>
        </div>
      </div>
    </div>
  );
}
