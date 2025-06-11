"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, RefreshCw } from "lucide-react";
import useProgramStore from "@/lib/stores/program-store";
import { useWallet } from "@jup-ag/wallet-adapter";
import { toast } from "sonner";

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

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
            <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Connect Wallet to Continue</CardTitle>
          <CardDescription>
            You have a program configured. Connect your wallet to start
            interacting with it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {programDetails && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Configured Program</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Program ID:</span>
                  <code className="text-xs">{programDetails.programId}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cluster:</span>
                  <Badge variant="outline">{programDetails.cluster}</Badge>
                </div>
                {programDetails.name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{programDetails.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              className="w-full"
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
              variant="outline"
              onClick={handleResetProgram}
              className="w-full"
            >
              Configure Different Program
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
