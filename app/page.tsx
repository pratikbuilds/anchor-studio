"use client";

import { useState, useEffect } from "react";
import useProgramStore from "@/lib/stores/program-store";
import { SiteHeader } from "@/components/site-header";
import { ProgramDetails } from "@/components/dashboard/program-details";
import { WelcomeScreen } from "@/components/dashboard/welcome-screen";
import { LoadingScreen } from "@/components/ui/loading-screen";
import ProgramSetupWizard from "@/components/program-setup-wizard";

export default function Page() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

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

  // Update wizard visibility when hydration is complete and state changes
  useEffect(() => {
    if (!isHydrated) return;
    setShowWizard(!isInitialized || !programDetails);
  }, [isHydrated, isInitialized, programDetails]);

  const resetProgramStore = () => {
    reset();
    setShowWizard(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
  };

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col">
          {!isHydrated ? (
            <LoadingScreen />
          ) : showWizard ? (
            <ProgramSetupWizard onComplete={handleWizardComplete} />
          ) : programDetails ? (
            <ProgramDetails
              programDetails={programDetails}
              onReinitialize={resetProgramStore}
            />
          ) : (
            <WelcomeScreen onInitialize={resetProgramStore} />
          )}
        </div>
      </div>
    </>
  );
}
