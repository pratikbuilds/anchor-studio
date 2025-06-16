"use client";

import React, { useState, useEffect } from "react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { useJsonStore } from "@/lib/store";
import useProgramStore from "@/lib/stores/program-store";
import { useRpcStore } from "@/lib/stores/rpc-store";
import { useAnchorWallet } from "@jup-ag/wallet-adapter";
import { FileJson, Wallet, Database } from "lucide-react";
import StepUploadIdl from "./step-upload-idl";
import StepConnection from "./step-connection";
import StepSummary from "./step-summary";

const steps = [
  { step: 1, title: "IDL Input", icon: <FileJson className="h-5 w-5" /> },
  { step: 2, title: "Connection", icon: <Wallet className="h-5 w-5" /> },
  { step: 3, title: "Summary", icon: <Database className="h-5 w-5" /> },
];

export default function ProgramSetupWizard({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const { reset: resetJsonStore, jsonData, isValid } = useJsonStore();
  const { isInitialized, programDetails, error } = useProgramStore();
  const { getCurrentRpcUrl } = useRpcStore();
  const wallet = useAnchorWallet();

  // Reset JSON store when component mounts
  useEffect(() => {
    resetJsonStore();
  }, [resetJsonStore]);

  const goToStep = (step: number) => {
    // Validate step transitions
    if (step === 2 && (!jsonData || !isValid)) {
      return; // Can't go to step 2 without valid JSON data
    }
    if (step === 3 && !wallet?.publicKey) {
      return; // Can't go to step 3 without wallet connection
    }
    setCurrentStep(step);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-6">
      <div className="mb-4">
        <Stepper value={currentStep} className="items-start gap-4">
          {steps.map(({ step, title, icon }) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;
            const isClickable =
              step === 1 ||
              (step === 2 && jsonData && isValid) ||
              (step === 3 && wallet?.publicKey);

            return (
              <StepperItem key={step} step={step} className="flex-1">
                <StepperTrigger
                  className="w-full flex-col items-start gap-2 rounded data-[active]:font-medium data-[active]:text-foreground"
                  onClick={() => isClickable && goToStep(step)}
                  disabled={!isClickable}
                >
                  <StepperIndicator
                    asChild
                    className={`h-1.5 w-full transition-colors ${
                      isActive || isCompleted ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <span className="sr-only">{step}</span>
                  </StepperIndicator>
                  <div className="space-y-0.5 flex items-center gap-2 justify-center mt-2">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                          : isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {icon}
                    </span>
                    <StepperTitle
                      className={`transition-colors ${
                        isActive
                          ? "text-primary font-medium"
                          : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {title}
                    </StepperTitle>
                  </div>
                </StepperTrigger>
              </StepperItem>
            );
          })}
        </Stepper>
      </div>

      <div className="flex-1 flex overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
        {currentStep === 1 && <StepUploadIdl onNext={() => goToStep(2)} />}
        {currentStep === 2 && (
          <StepConnection
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        )}
        {currentStep === 3 && (
          <StepSummary onBack={() => goToStep(2)} onComplete={onComplete} />
        )}
      </div>
    </div>
  );
}
