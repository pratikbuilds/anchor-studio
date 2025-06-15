import React from "react";
import { useWallet } from "@jup-ag/wallet-adapter";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";
import { useUnifiedWalletContext } from "@jup-ag/wallet-adapter";

function WalletBtn() {
  const { connected, disconnect, connecting, publicKey } = useWallet();
  const { setShowModal } = useUnifiedWalletContext();

  return connected ? (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-xs sm:text-sm"
      onClick={disconnect}
    >
      <Wallet className="h-4 w-4" />
      <span
        className="hidden sm:inline max-w-[120px] truncate"
        title={publicKey?.toBase58()}
      >
        {publicKey?.toBase58()?.slice(0, 4) +
          "..." +
          publicKey?.toBase58()?.slice(-4)}
      </span>
      <span className="sm:hidden">Connected</span>
    </Button>
  ) : (
    <Button
      variant="default"
      size="sm"
      className="gap-2 text-xs sm:text-sm"
      disabled={connecting}
      onClick={() => setShowModal(true)}
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </Button>
  );
}

export default WalletBtn;
