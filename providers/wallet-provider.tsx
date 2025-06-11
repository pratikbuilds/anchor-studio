"use client";
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import { Cluster } from "@solana/web3.js";
import { useRpcStore } from "@/lib/stores/rpc-store";
import { useMemo } from "react";

const WalletProviderContent = ({ children }: { children: React.ReactNode }) => {
  const { selectedRpc } = useRpcStore();

  const env = useMemo(() => {
    return selectedRpc as Cluster;
  }, [selectedRpc]);

  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env,
        metadata: {
          name: "Anchor UI",
          description: "UI to interact with a Solana program",
          url: "https://idl-ui.vercel.app",
          iconUrls: ["https://idl-ui.vercel.app/favicon.ico"],
        },
        walletlistExplanation: {
          href: "https://station.jup.ag/docs/additional-topics/wallet-list",
        },
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return <WalletProviderContent>{children}</WalletProviderContent>;
};
