"use client";

import { useEffect } from "react";
import { useAnchorWallet } from "@jup-ag/wallet-adapter";
import useProgramStore from "@/lib/stores/program-store";

export function ProgramInitializer() {
  const wallet = useAnchorWallet();
  const { reinitialize, programDetails, program, isReinitializing } =
    useProgramStore();

  useEffect(() => {
    // Only auto-reinitialize if we have a wallet AND program details,
    // but no program object, and we are not already reinitializing.
    if (wallet && programDetails && !program && !isReinitializing) {
      console.log(
        "[ProgramInitializer] Auto-reinitializing program with wallet"
      );
      reinitialize(wallet)
        .then(() => {
          console.log(
            "[ProgramInitializer] Program auto-reinitialized successfully"
          );
        })
        .catch((error) => {
          console.error(
            "[ProgramInitializer] Auto-reinitialization failed:",
            error
          );
        });
    }
  }, [wallet, programDetails, program, isReinitializing, reinitialize]);

  return null;
}
