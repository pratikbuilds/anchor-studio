"use client";
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import { Cluster } from "@solana/web3.js";

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env: (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) || "devnet",
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
