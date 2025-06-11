"use client";

import { useEffect, useRef } from "react";
import { useAnchorWallet } from "@jup-ag/wallet-adapter";
import useProgramStore from "@/lib/stores/program-store";

export function ProgramInitializer() {
  const wallet = useAnchorWallet();
  const { reset, reinitialize, programDetails, program, isInitialized } =
    useProgramStore();
  console.log("programDetails", programDetails);
  console.log("program", program);
  console.log("isInitialized", isInitialized);
  const isReinitializingRef = useRef(false);

  useEffect(() => {
    // Only auto-reinitialize if we have a wallet AND program details but no program object
    if (
      wallet &&
      programDetails &&
      (!program || !isInitialized) &&
      !isReinitializingRef.current
    ) {
      console.log(
        "[ProgramInitializer] Auto-reinitializing program with wallet"
      );
      isReinitializingRef.current = true;

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
        })
        .finally(() => {
          isReinitializingRef.current = false;
        });
    }
  }, [wallet, programDetails, program, isInitialized, reinitialize]);

  return null;
}
