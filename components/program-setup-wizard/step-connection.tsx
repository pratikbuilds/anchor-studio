"use client";

import React, { useState } from "react";
import {
  useRpcStore,
  RPC_OPTIONS,
  type RpcOption,
} from "@/lib/stores/rpc-store";
import { useAnchorWallet } from "@jup-ag/wallet-adapter";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Database,
  ExternalLink,
  ServerIcon,
  Wallet,
} from "lucide-react";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";

export default function StepConnection({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const wallet = useAnchorWallet();
  const unifiedWalletContext = useUnifiedWalletContext();
  const {
    selectedRpc,
    setSelectedRpc,
    customRpcUrl,
    setCustomRpcUrl,
    getCurrentRpcUrl,
    getCurrentRpcDisplayName,
  } = useRpcStore();

  const [showCustomRpcInput, setShowCustomRpcInput] = useState(
    selectedRpc === "custom"
  );
  const [tempCustomRpcUrl, setTempCustomRpcUrl] = useState(customRpcUrl);

  const handleRpcChangeShadcn = (value: RpcOption | "custom") => {
    if (value === "custom") {
      setShowCustomRpcInput(true);
      setSelectedRpc("custom");
    } else {
      setShowCustomRpcInput(false);
      setSelectedRpc(value as RpcOption);
    }
  };

  const handleCustomRpcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCustomRpcUrl) {
      setCustomRpcUrl(tempCustomRpcUrl);
      setSelectedRpc("custom");
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Connection Settings
        </h2>
        <p className="text-muted-foreground">
          Configure the connection settings for your program.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* RPC Endpoint Card */}
        <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
          <div className="border-b bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2">
              <ServerIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">RPC Endpoint</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              The RPC endpoint used to connect to the Solana network
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {getCurrentRpcDisplayName()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getCurrentRpcUrl()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="rpc-select" className="text-sm font-medium">
                    Change RPC Endpoint
                  </label>
                </div>
                <Select
                  value={selectedRpc}
                  onValueChange={handleRpcChangeShadcn}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select RPC Endpoint" />
                  </SelectTrigger>
                  <SelectContent>
                    {RPC_OPTIONS.map((rpc) => (
                      <SelectItem key={rpc.value} value={rpc.value}>
                        {rpc.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom RPC URL</SelectItem>
                  </SelectContent>
                </Select>

                {selectedRpc === "mainnet-beta" ? (
                  <p className="text-xs text-amber-500 px-1 pt-1">
                    It is not recommended to use the default Mainnet RPC. Please
                    use a custom RPC for a better experience.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground px-1 pt-1">
                    You can use custom RPCs by selecting "Custom RPC URL" from
                    the list.
                  </p>
                )}

                {(showCustomRpcInput || selectedRpc === "custom") && (
                  <form
                    onSubmit={handleCustomRpcSubmit}
                    className="flex gap-2 mt-3 items-center"
                  >
                    <input
                      type="text"
                      value={tempCustomRpcUrl}
                      onChange={(e) => setTempCustomRpcUrl(e.target.value)}
                      placeholder="https://your-custom-rpc.com"
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-10"
                      disabled={!tempCustomRpcUrl}
                    >
                      Save
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
          <div className="border-b bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Wallet Connection</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect your wallet to interact with the program
            </p>
          </div>
          <div className="p-6">
            {wallet?.publicKey ? (
              <div className="flex flex-col gap-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
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
                      className="h-5 w-5 text-green-600 dark:text-green-400"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-green-800 dark:text-green-400">
                      Wallet Connected
                    </div>
                    <div className="text-xs font-mono text-green-700/70 dark:text-green-500/70">
                      {wallet.publicKey.toString().slice(0, 8)}...
                      {wallet.publicKey.toString().slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <Wallet className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-medium text-yellow-800 dark:text-yellow-400">
                      Wallet Not Connected
                    </div>
                    <div className="text-xs text-yellow-700/70 dark:text-yellow-500/70">
                      Please connect your wallet to continue
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      unifiedWalletContext.setShowModal(true);
                    }}
                    className="w-full border-yellow-200 bg-yellow-100/50 hover:bg-yellow-100 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <AnimatedButton
          variant="outline"
          onClick={onBack}
          direction="backward"
          className="min-w-[100px]"
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          onClick={onNext}
          disabled={!wallet?.publicKey}
          className="min-w-[100px]"
        >
          Continue
        </AnimatedButton>
      </div>
    </div>
  );
}
