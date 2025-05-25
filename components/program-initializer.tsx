"use client";

import { useEffect, useRef } from "react";
import { useAnchorWallet } from "@jup-ag/wallet-adapter";
import useProgramStore from "@/lib/stores/program-store";

export function ProgramInitializer() {
  const wallet = useAnchorWallet();
  const { reinitialize, programDetails, isInitialized } = useProgramStore();
  const hasInitializedRef = useRef(false);
  console.log("programDetails", programDetails);
  useEffect(() => {
    // Skip if no wallet, already initialized, or already attempted initialization
    if (!wallet || hasInitializedRef.current) return;
    console.log("reinitialize");
    // Only attempt reinitialization if we have program details but the program isn't initialized
    if (programDetails && isInitialized) {
      hasInitializedRef.current = true; // Prevent further reinitialization attempts
      reinitialize(wallet).catch((error) => {
        console.error("Failed to reinitialize program:", error);
        hasInitializedRef.current = false; // Reset on error to allow retry
      });
    }
  }, [wallet, programDetails, isInitialized, reinitialize]);

  return null;
}
