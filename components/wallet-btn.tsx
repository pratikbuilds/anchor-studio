import React from "react";
import { useWallet } from "@jup-ag/wallet-adapter";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

function WalletBtn() {
  const { connected, disconnect, connect, connecting, publicKey } = useWallet();

  return connected ? (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-xs sm:text-sm"
      onClick={disconnect}
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">{publicKey?.toBase58()}</span>
      <span className="sm:hidden">Connected</span>
    </Button>
  ) : (
    <Button
      variant="default"
      size="sm"
      className="gap-2 text-xs sm:text-sm"
      disabled={connecting}
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </Button>
  );
}

export default WalletBtn;
