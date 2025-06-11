"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet, RefreshCw, SlidersHorizontal } from "lucide-react";
import useProgramStore from "@/lib/stores/program-store";
import { useWallet } from "@jup-ag/wallet-adapter";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CopyButton } from "@/components/ui/copy-button";

export function ConnectWalletScreen() {
  const { programDetails, reset } = useProgramStore();
  const { wallet, connect, connecting } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleResetProgram = () => {
    reset();
  };

  const getClusterBadgeColor = (cluster: string) => {
    switch (cluster) {
      case "mainnet-beta":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400";
      case "devnet":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
      case "localnet":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
            <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
          <CardDescription>
            You have a program ready to use. Connect your wallet to start
            exploring.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {programDetails && (
            <>
              {/* Program Info Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {programDetails.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configured{" "}
                      {formatDistanceToNow(
                        new Date(programDetails.initializedAt),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={getClusterBadgeColor(programDetails.cluster)}
                  >
                    {programDetails.cluster}
                  </Badge>
                </div>

                <Separator />

                {/* Program Details */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        Program ID
                      </span>
                      <CopyButton
                        value={programDetails.programId}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                      />
                    </div>
                    <div className="font-mono text-sm bg-muted rounded p-2 break-all">
                      {programDetails.programId}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        RPC Endpoint
                      </span>
                      <CopyButton
                        value={programDetails.rpcUrl}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                      />
                    </div>
                    <div className="font-mono text-sm bg-muted rounded p-2 break-all">
                      {programDetails.rpcUrl}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              className="w-full"
              size="lg"
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleResetProgram}
              className="w-full text-sm"
              size="sm"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Configure Different Program
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
