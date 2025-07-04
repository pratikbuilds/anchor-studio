"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ProgramDetails as ProgramDetailsType } from "@/lib/stores/program-store";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Globe,
  Database,
  Code,
  ServerIcon,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProgramDetailsProps {
  programDetails: ProgramDetailsType;
  onReinitialize: () => void;
}

export function ProgramDetails({
  programDetails,
  onReinitialize,
}: ProgramDetailsProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRpc, setCopiedRpc] = useState(false);
  const [isReinitializing, setIsReinitializing] = useState(false);
  const [showIdl, setShowIdl] = useState(false);
  const [idlCopied, setIdlCopied] = useState(false);
  const idlJson = programDetails.serializedIdl
    ? JSON.stringify(JSON.parse(programDetails.serializedIdl), null, 2)
    : "";

  const copyToClipboard = async (
    text: string,
    setter: (value: boolean) => void
  ) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleReinitialize = async () => {
    setIsReinitializing(true);
    try {
      await onReinitialize();
    } finally {
      setIsReinitializing(false);
    }
  };
  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Program Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 border border-primary/20">
            <Code className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {programDetails.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                {programDetails.cluster}
              </span>
              <div className="hidden sm:block w-px h-4 bg-muted"></div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>Initialized</span>
                <span
                  className="font-mono"
                  title={new Date(
                    programDetails.initializedAt
                  ).toLocaleString()}
                >
                  {formatDistanceToNow(new Date(programDetails.initializedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={handleReinitialize}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto flex-shrink-0"
          disabled={isReinitializing}
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isReinitializing && "animate-spin")}
          />
          {isReinitializing ? "Reinitializing..." : "Reinitialize"}
        </Button>
      </div>

      {/* Main content - Two important cards side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Program ID Card */}
        <div className="bg-card border rounded-md p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Globe className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium">Program ID</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs flex-shrink-0"
              onClick={() =>
                copyToClipboard(programDetails.programId, setCopiedId)
              }
            >
              {copiedId ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="font-mono text-xs sm:text-sm bg-muted rounded-md p-2 sm:p-2.5 overflow-x-auto whitespace-nowrap">
            {programDetails.programId}
          </div>
          <div className="mt-6">
            <button
              className="text-xs font-medium underline text-primary hover:text-primary/80 transition-colors"
              onClick={() => setShowIdl((v) => !v)}
            >
              {showIdl ? "Hide IDL" : "View Complete IDL"}
            </button>
            {showIdl && (
              <div className="mt-3 relative">
                <button
                  className="absolute top-2 right-2 z-10 text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 border border-border"
                  onClick={async () => {
                    await navigator.clipboard.writeText(idlJson);
                    setIdlCopied(true);
                    setTimeout(() => setIdlCopied(false), 2000);
                  }}
                >
                  {idlCopied ? "Copied" : "Copy"}
                </button>
                <pre className="bg-muted rounded p-4 text-xs font-mono overflow-x-auto max-h-96 border border-border">
                  {idlJson}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* RPC Endpoint Card */}
        <div className="bg-card border rounded-md p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ServerIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium">RPC Endpoint</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs flex-shrink-0"
              onClick={() =>
                copyToClipboard(programDetails.rpcUrl, setCopiedRpc)
              }
            >
              {copiedRpc ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div className="font-mono text-xs sm:text-sm bg-muted rounded-md p-2 sm:p-2.5 overflow-x-auto whitespace-nowrap">
            {programDetails.rpcUrl}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <Link href="/accounts" className="block">
          <Button
            variant="secondary"
            className="h-auto w-full justify-between py-3 px-3 sm:px-4"
            asChild
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium truncate">Accounts</div>
                  <div className="text-xs text-muted-foreground truncate">
                    View and manage program accounts
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 ml-2 opacity-70 flex-shrink-0" />
            </div>
          </Button>
        </Link>
        <Link href="/ix" className="block">
          <Button
            variant="secondary"
            className="h-auto w-full justify-between py-3 px-3 sm:px-4"
            asChild
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium truncate">Instructions</div>
                  <div className="text-xs text-muted-foreground truncate">
                    View and execute program instructions
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 ml-2 opacity-70 flex-shrink-0" />
            </div>
          </Button>
        </Link>
        <Link href="/tx" className="block">
          <Button
            variant="secondary"
            className="h-auto w-full justify-between py-3 px-3 sm:px-4"
            asChild
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-md bg-primary/10 flex-shrink-0">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium truncate">Transactions</div>
                  <div className="text-xs text-muted-foreground truncate">
                    View recent transactions
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 ml-2 opacity-70 flex-shrink-0" />
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}
