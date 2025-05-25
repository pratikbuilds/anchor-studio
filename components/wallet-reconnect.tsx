"use client";

import { useWallet } from "@jup-ag/wallet-adapter";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";

interface WalletReconnectProps {
  programName?: string;
}

export function WalletReconnect({ programName }: WalletReconnectProps) {
  const { connecting } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-card rounded-xl border border-border/40 shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {programName
              ? `Reconnect to ${programName}`
              : "Wallet Disconnected"}
          </h2>
          <p className="text-muted-foreground">
            {programName
              ? `Please reconnect your wallet to continue working with ${programName}`
              : "Connect your wallet to get started"}
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={() => setShowModal(true)}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${
              connecting ? "opacity-75" : ""
            }`}
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
