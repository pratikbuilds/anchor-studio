"use client";

import { useState, useEffect } from "react";
import useProgramStore from "@/lib/stores/program-store";
import { ProgramDetails } from "@/components/dashboard/program-details";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ConnectWalletScreen } from "@/components/connect-wallet-screen";
import ProgramSetupWizard from "@/components/program-setup-wizard";

export default function Page() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Get the current program state
  const { isInitialized, programDetails, reset, program } = useProgramStore();

  // Handle store hydration
  useEffect(() => {
    const unsubscribe = useProgramStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Set hydrated immediately if store is already hydrated
    if (useProgramStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const resetProgramStore = () => {
    reset();
  };

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  // Three distinct states:
  // 1. No program details at all -> Setup wizard
  if (!programDetails) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col p-3 sm:p-4 lg:p-6">
          <ProgramSetupWizard onComplete={() => {}} />
        </div>
      </div>
    );
  }

  // 2. Have program details but no program object -> Connect wallet screen
  if (!program || !isInitialized) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col p-3 sm:p-4 lg:p-6">
          <ConnectWalletScreen />
        </div>
      </div>
    );
  }

  // 3. Have both program details AND program object -> Dashboard
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <ProgramDetails
          programDetails={programDetails}
          onReinitialize={resetProgramStore}
        />
      </div>
    </div>
  );
}
