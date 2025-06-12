import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * RPC endpoint options and types
 */
export type RpcOption = "mainnet-beta" | "devnet" | "localnet" | "custom";

export interface RpcEndpoint {
  value: RpcOption;
  label: string;
  url?: string;
}

/**
 * Available RPC endpoints
 */
export const RPC_OPTIONS: ReadonlyArray<RpcEndpoint> = [
  {
    value: "mainnet-beta",
    label: "Mainnet Beta",

    url: `https://mainnet.helius-rpc.com/?api-key=${
      process.env.NEXT_PUBLIC_HELIUS_API_KEY || ""
    }`,
  },
  { value: "devnet", label: "Devnet", url: "https://api.devnet.solana.com" },
  { value: "localnet", label: "localnet", url: "http://127.0.0.1:8899" },
] as const;

/**
 * RPC state interface
 */
export interface RpcState {
  // State
  readonly selectedRpc: RpcOption;
  readonly customRpcUrl: string;
  readonly dropdownOpen: boolean;

  // Actions
  setSelectedRpc: (rpc: RpcOption) => void;
  setCustomRpcUrl: (url: string) => void;
  setDropdownOpen: (isOpen: boolean) => void;

  // Computed getters
  getCurrentRpcUrl: () => string;
  getCurrentRpcDisplayName: () => string;
}

/**
 * RPC store with persistence
 */
export const useRpcStore = create<RpcState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedRpc: "localnet",
      customRpcUrl: "",
      dropdownOpen: false,

      // Actions
      setSelectedRpc: (rpc) => set({ selectedRpc: rpc }),
      setCustomRpcUrl: (url) => set({ customRpcUrl: url }),
      setDropdownOpen: (isOpen) => set({ dropdownOpen: isOpen }),

      // Computed values
      getCurrentRpcUrl: () => {
        const { selectedRpc, customRpcUrl } = get();
        if (selectedRpc === "custom" && customRpcUrl) {
          return customRpcUrl;
        }
        const selectedOption = RPC_OPTIONS.find(
          (opt) => opt.value === selectedRpc
        );
        return selectedOption?.url || RPC_OPTIONS[0].url!;
      },
      getCurrentRpcDisplayName: () => {
        const { selectedRpc, customRpcUrl } = get();
        if (selectedRpc === "custom") {
          return customRpcUrl ? "Custom" : "Select RPC";
        }
        return (
          RPC_OPTIONS.find((opt) => opt.value === selectedRpc)?.label ||
          "Select RPC"
        );
      },
    }),
    {
      name: "rpc-settings",
      skipHydration: true, // Skip hydration to prevent server/client mismatch
    }
  )
);
