"use client";
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import { Cluster } from "@solana/web3.js";
import { useRpcStore } from "@/lib/stores/rpc-store";
import { useMemo } from "react";

// Map selectedRpc to a valid Cluster or undefined
function mapRpcToCluster(rpc: string, customRpcUrl?: string): Cluster {
  if (rpc === "mainnet-beta" || rpc === "devnet" || rpc === "testnet")
    return rpc as Cluster;
  if (rpc === "custom" && customRpcUrl) {
    if (/mainnet/i.test(customRpcUrl)) return "mainnet-beta";
    if (/devnet/i.test(customRpcUrl)) return "devnet";
    if (/testnet/i.test(customRpcUrl)) return "testnet";
  }
  // Default to devnet for localnet or any other value
  return "devnet";
}

const WalletProviderContent = ({ children }: { children: React.ReactNode }) => {
  const { selectedRpc, customRpcUrl } = useRpcStore();

  const env = useMemo(
    () => mapRpcToCluster(selectedRpc, customRpcUrl),
    [selectedRpc, customRpcUrl]
  );

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
