"use client";

import React from "react";
import { useJsonStore } from "@/lib/store";
import useProgramStore from "@/lib/stores/program-store";
import { useRpcStore } from "@/lib/stores/rpc-store";
import { useAnchorWallet } from "@jup-ag/wallet-adapter";
import { toast } from "sonner";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ProgramDetails } from "@/components/dashboard/program-details";
import {
  ArrowLeft,
  Database,
  ExternalLink,
  FileJson,
  ServerIcon,
  Wallet,
} from "lucide-react";
import { Button } from "../ui/button";

export default function StepSummary({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete?: () => void;
}) {
  const { jsonData, isValid, reset: resetJsonStore } = useJsonStore();
  const { initialize, isInitialized, error, programDetails } =
    useProgramStore();

  console.log("error", error);
  console.log("isInitialized", isInitialized);

  const { getCurrentRpcUrl, getCurrentRpcDisplayName } = useRpcStore();
  const wallet = useAnchorWallet();

  const handleAddProgram = async () => {
    if (!jsonData.trim()) {
      toast.error("Empty JSON data", {
        description: "Please enter JSON data before adding a program.",
        duration: 3000,
      });
      return;
    }

    toast.loading("Initializing program...", { id: "add-program" });

    try {
      const idl = JSON.parse(jsonData);

      if (!wallet?.publicKey) {
        toast.error("Wallet not connected", {
          description: "Please connect your wallet before adding a program.",
          duration: 3000,
        });
        return;
      }

      // Get the RPC URL from the RPC store
      const rpcUrl = getCurrentRpcUrl();

      await initialize(idl, rpcUrl, wallet);

      toast.success("Program initialized successfully", {
        id: "add-program",
        description: "Your program has been initialized and is ready to use.",
        duration: 5000,
      });

      // Reset JSON store after successful initialization
      resetJsonStore();

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to initialize program:", error);
      toast.error("Failed to initialize program", {
        id: "add-program",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        duration: 4000,
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isInitialized && programDetails
            ? "Program Initialized"
            : "Review & Initialize"}
        </h2>
        <p className="text-muted-foreground">
          {isInitialized && programDetails
            ? "Your program has been successfully initialized"
            : "Review your settings and initialize your program"}
        </p>
      </div>

      {isInitialized && programDetails ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <div className="text-lg font-medium text-green-800 dark:text-green-400">
                  Program Initialized Successfully
                </div>
                <div className="text-sm text-green-700/70 dark:text-green-500/70">
                  Your program is now ready to use
                </div>
              </div>
            </div>
          </div>

          <ProgramDetails
            programDetails={programDetails}
            onReinitialize={() => {}}
          />

          <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
            <div className="border-b bg-muted/30 px-6 py-4">
              <h3 className="text-lg font-medium">Next Steps</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You can now explore your program's accounts, instructions, and
                more
              </p>
            </div>
            <div className="p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <AnimatedButton
                  variant="outline"
                  className="justify-start h-auto py-3 min-w-[150px]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mr-3">
                    <ServerIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">View Accounts</div>
                    <div className="text-xs text-muted-foreground">
                      Explore program accounts and their data
                    </div>
                  </div>
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  className="justify-start h-auto py-3 min-w-[150px]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-primary"
                    >
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Execute Instructions</div>
                    <div className="text-xs text-muted-foreground">
                      Call program instructions and view results
                    </div>
                  </div>
                </AnimatedButton>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <AnimatedButton
              onClick={onComplete}
              size="lg"
              className="min-w-[150px]"
            >
              Go to Dashboard
            </AnimatedButton>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* IDL Summary Card */}
            <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">IDL Summary</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <pre className="max-h-[200px] overflow-auto text-xs scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
                    {JSON.stringify(JSON.parse(jsonData), null, 2).slice(
                      0,
                      300
                    )}
                    ...
                  </pre>
                </div>
              </div>
            </div>

            {/* Connection Summary Card */}
            <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Connection</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <ServerIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        RPC Endpoint
                      </div>
                      <div className="font-medium">
                        {getCurrentRpcDisplayName()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Wallet
                      </div>
                      <div className="font-medium font-mono">
                        {wallet?.publicKey
                          ? `${wallet.publicKey
                              .toString()
                              .slice(0, 8)}...${wallet.publicKey
                              .toString()
                              .slice(-8)}`
                          : "Not connected"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <AnimatedButton
              variant="outline"
              onClick={onBack}
              direction="backward"
              className="min-w-[100px]"
            >
              Back
            </AnimatedButton>
            <Button
              onClick={handleAddProgram}
              disabled={!isValid || !jsonData.trim() || !wallet?.publicKey}
              size="lg"
              className="gap-2"
            >
              <Database className="h-5 w-5" />
              Initialize Program
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
