"use client";

import {
  useProgramStore,
  type ProgramDetails as ProgramDetailsType,
} from "@/lib/stores/program-store";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { CopyButton } from "@/components/ui/copy-button";
import {
  InfoIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  DatabaseIcon,
  ClockIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProgramDetails() {
  const { isInitialized, error, programDetails } = useProgramStore();

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <XCircleIcon className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base font-medium text-destructive">
              Program Initialization Failed
            </CardTitle>
          </div>
          <CardDescription className="text-destructive/90">
            {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isInitialized || !programDetails) {
    return null;
  }

  const getClusterBadgeColor = (cluster: string) => {
    switch (cluster) {
      case "mainnet-beta":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "devnet":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "localnet":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getCommitmentBadgeColor = (commitment: string) => {
    switch (commitment) {
      case "finalized":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "confirmed":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "processed":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-medium">
              Program Initialized
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={getClusterBadgeColor(programDetails.cluster)}
          >
            {programDetails.cluster}
          </Badge>
        </div>
        <CardDescription>{programDetails.name}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <LinkIcon className="h-4 w-4" />
              <span>Program ID</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="truncate">{programDetails.programId}</span>
              <CopyButton
                value={programDetails.programId}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DatabaseIcon className="h-4 w-4" />
              <span>RPC Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="truncate text-xs">{programDetails.rpcUrl}</span>
              <CopyButton
                value={programDetails.rpcUrl}
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={getCommitmentBadgeColor(
                        programDetails.commitment
                      )}
                    >
                      {programDetails.commitment}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Commitment level for transactions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ClockIcon className="h-4 w-4" />
            <span>
              Initialized{" "}
              {formatDistanceToNow(programDetails.initializedAt, {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
