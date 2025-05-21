"use client";

import { useState } from "react";
import { useJsonStore } from "@/lib/store";
import { useProgramStore } from "@/lib/stores/program-store";
import { useRpcStore } from "@/lib/stores/rpc-store";
import { useAnchorWallet } from "@jup-ag/wallet-adapter";
import { toast } from "sonner";
import { JsonEditor } from "@/components/json-editor";
import { ProgramDetails } from "@/components/program-details";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UploadIcon,
  CodeIcon,
  ServerIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FileJson,
  Wallet,
  Database,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ProgramSetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"upload" | "editor">("editor");

  const { jsonData, isValid, setJsonData } = useJsonStore();
  const { initialize, isInitialized, error, programDetails } =
    useProgramStore();
  const { getCurrentRpcUrl, getCurrentRpcDisplayName } = useRpcStore();
  const wallet = useAnchorWallet();

  const steps: Step[] = [
    {
      title: "IDL Input",
      description: "Upload or paste your program IDL",
      icon: <FileJson className="h-6 w-6" />,
    },
    {
      title: "Connection",
      description: "Configure RPC and wallet",
      icon: <Wallet className="h-6 w-6" />,
    },
    {
      title: "Summary",
      description: "Review and initialize",
      icon: <Database className="h-6 w-6" />,
    },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "File too large. Please upload a JSON file smaller than 5MB.",
        {
          description: "Large files may cause performance issues.",
          duration: 5000,
        }
      );
      return;
    }

    // Check file type
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      toast.error("Invalid file type. Please upload a JSON file.", {
        description: "Only .json files are supported.",
        duration: 3000,
      });
      return;
    }

    const reader = new FileReader();
    toast.loading("Uploading JSON file...", { id: "upload-json" });

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Validate JSON before setting
        JSON.parse(content);
        setJsonData(content);
        setActiveTab("editor");
        toast.success("JSON file uploaded successfully", {
          id: "upload-json",
          description: `File: ${file.name}`,
          duration: 3000,
        });
      } catch (error) {
        toast.error("Invalid JSON file", {
          id: "upload-json",
          description: "The file contains invalid JSON syntax.",
          duration: 4000,
        });
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file", {
        id: "upload-json",
        description: "There was an error reading the file. Please try again.",
        duration: 4000,
      });
    };

    reader.readAsText(file);
  };

  const handleAddProgram = async () => {
    if (!jsonData.trim()) {
      toast.error("Empty JSON data", {
        description: "Please enter JSON data before adding a program.",
        duration: 3000,
      });
      return;
    }

    toast.loading("Initializing program...", { id: "add-program" });

    try {
      const idl = JSON.parse(jsonData);

      if (!wallet?.publicKey) {
        toast.error("Wallet not connected", {
          description: "Please connect your wallet before adding a program.",
          duration: 3000,
        });
        return;
      }

      // Get the RPC URL from the RPC store
      const rpcUrl = getCurrentRpcUrl();

      const initializedProgram = await initialize(idl, rpcUrl, wallet);

      toast.success("Program initialized successfully", {
        id: "add-program",
        description: "The program is now ready to use.",
        duration: 3000,
      });

      // Move to the next step after successful initialization
      setCurrentStep(2);
    } catch (error) {
      console.error("Failed to initialize program:", error);
      toast.error("Failed to initialize program", {
        id: "add-program",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        duration: 4000,
      });
    }
  };

  // Trigger file input click to open file dialog
  const triggerFileInput = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const fileInput = document.getElementById(
      "json-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex h-full w-full flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Program IDL
              </h2>
              <p className="text-muted-foreground">
                Provide your Anchor program IDL by uploading a JSON file or
                using the editor
              </p>
            </div>

            {/* Tab selector */}
            <div className="flex mb-4">
              <div className="inline-flex h-10 items-center justify-center gap-1 rounded-md bg-muted p-1">
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === "editor"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setActiveTab("editor")}
                >
                  <CodeIcon className="mr-2 h-4 w-4" />
                  JSON Editor
                </button>
                <button
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    activeTab === "upload"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setActiveTab("upload")}
                >
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload File
                </button>
              </div>
            </div>

            {/* Content area - takes remaining height */}
            <div className="flex-1 min-h-0 w-full">
              {activeTab === "editor" ? (
                <div className="flex flex-col h-full w-full rounded-lg border bg-card/50 shadow-sm">
                  <div className="flex-1 min-h-0 w-full">
                    <JsonEditor />
                  </div>
                  <div className="flex items-center justify-end border-t bg-muted/30 px-4 py-2">
                    <div className="text-xs text-muted-foreground">
                      Tip: Use the Format button to beautify your JSON
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card/50 shadow-sm h-full">
                  <div className="border-b bg-muted/30 px-6 py-4">
                    <h3 className="text-lg font-medium">
                      Upload IDL JSON File
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your Anchor program IDL JSON file to initialize
                      your program
                    </p>
                  </div>
                  <div className="p-6 flex-1">
                    <div
                      className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-primary/20 bg-primary/5 p-12 transition-colors hover:border-primary/30 hover:bg-primary/10 cursor-pointer"
                      onClick={(e) =>
                        triggerFileInput(
                          e as unknown as React.MouseEvent<HTMLButtonElement>
                        )
                      }
                    >
                      <input
                        type="file"
                        id="json-upload"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="mb-4 rounded-full bg-primary/10 p-3">
                        <FileJson className="h-8 w-8 text-primary" />
                      </div>
                      <div className="mb-2 text-xl font-medium">
                        Drop your file here or browse
                      </div>
                      <div className="mb-6 text-sm text-muted-foreground">
                        Support for .json files only, up to 5MB
                      </div>
                      <Button
                        onClick={triggerFileInput}
                        variant="outline"
                        className="gap-2"
                      >
                        <UploadIcon className="h-4 w-4" />
                        Select JSON File
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Connection Settings
              </h2>
              <p className="text-muted-foreground">
                Configure the connection settings for your program
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* RPC Endpoint Card */}
              <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
                <div className="border-b bg-muted/30 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ServerIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">RPC Endpoint</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The RPC endpoint used to connect to the Solana network
                  </p>
                </div>
                <div className="p-6">
                  <div className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {getCurrentRpcDisplayName()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getCurrentRpcUrl()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      You can change the RPC endpoint in the settings menu
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Card */}
              <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
                <div className="border-b bg-muted/30 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Wallet Connection</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect your wallet to interact with the program
                  </p>
                </div>
                <div className="p-6">
                  {wallet?.publicKey ? (
                    <div className="flex flex-col gap-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-400">
                            Wallet Connected
                          </div>
                          <div className="text-xs font-mono text-green-700/70 dark:text-green-500/70">
                            {wallet.publicKey.toString().slice(0, 8)}...
                            {wallet.publicKey.toString().slice(-8)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                          <Wallet className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <div className="font-medium text-yellow-800 dark:text-yellow-400">
                            Wallet Not Connected
                          </div>
                          <div className="text-xs text-yellow-700/70 dark:text-yellow-500/70">
                            Please connect your wallet to continue
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                {isInitialized && programDetails
                  ? "Program Initialized"
                  : "Review & Initialize"}
              </h2>
              <p className="text-muted-foreground">
                {isInitialized && programDetails
                  ? "Your program has been successfully initialized"
                  : "Review your settings and initialize your program"}
              </p>
            </div>

            {isInitialized && programDetails ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-lg font-medium text-green-800 dark:text-green-400">
                        Program Initialized Successfully
                      </div>
                      <div className="text-sm text-green-700/70 dark:text-green-500/70">
                        Your program is now ready to use
                      </div>
                    </div>
                  </div>
                </div>

                <ProgramDetails />

                <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
                  <div className="border-b bg-muted/30 px-6 py-4">
                    <h3 className="text-lg font-medium">Next Steps</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You can now explore your program's accounts, instructions,
                      and more
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Button
                        variant="outline"
                        className="justify-start h-auto py-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mr-3">
                          <ServerIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">View Accounts</div>
                          <div className="text-xs text-muted-foreground">
                            Explore program accounts and their data
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-auto py-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mr-3">
                          <CodeIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">
                            Execute Instructions
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Call program instructions and view results
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50 shadow-sm dark:border-red-900/30 dark:bg-red-900/10">
                <div className="border-b border-red-200 bg-red-100/30 px-6 py-4 dark:border-red-900/20 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <h3 className="text-lg font-medium">
                      Initialization Failed
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                    {error.message}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Go Back to Editor
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* IDL Summary Card */}
                  <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
                    <div className="border-b bg-muted/30 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">IDL Summary</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="rounded-lg border bg-muted/20 p-4">
                        <pre className="max-h-[200px] overflow-auto text-xs scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
                          {JSON.stringify(JSON.parse(jsonData), null, 2).slice(
                            0,
                            300
                          )}
                          ...
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Connection Summary Card */}
                  <div className="overflow-hidden rounded-lg border bg-card/50 shadow-sm">
                    <div className="border-b bg-muted/30 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Connection</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <ServerIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              RPC Endpoint
                            </div>
                            <div className="font-medium">
                              {getCurrentRpcDisplayName()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Wallet className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Wallet
                            </div>
                            <div className="font-medium font-mono">
                              {wallet?.publicKey
                                ? `${wallet.publicKey
                                    .toString()
                                    .slice(0, 8)}...${wallet.publicKey
                                    .toString()
                                    .slice(-8)}`
                                : "Not connected"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleAddProgram}
                    disabled={
                      !isValid || !jsonData.trim() || !wallet?.publicKey
                    }
                    size="lg"
                    className="w-full max-w-md gap-2"
                  >
                    <Database className="h-5 w-5" />
                    Initialize Program
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-5xl flex-col p-6">
      {/* Custom Stepper */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;

            return (
              <div
                key={index}
                className="relative flex flex-1 flex-col items-center"
              >
                {/* Connector Line */}
                {index > 0 && (
                  <div
                    className={cn(
                      "absolute left-0 top-5 h-[2px] w-full -translate-x-1/2",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2",
                    isActive && "border-primary bg-primary/10 text-primary",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    !isActive &&
                      !isCompleted &&
                      "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Text */}
                <div className="mt-3 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isActive && "text-primary",
                      !isActive && !isCompleted && "text-muted-foreground/70"
                    )}
                  >
                    {step.title}
                  </div>
                  <div
                    className={cn(
                      "mt-1 text-xs",
                      isActive
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
        {renderStepContent()}
      </div>

      <div className="mt-6 flex justify-between">
        {currentStep > 0 && currentStep < 2 && (
          <Button variant="outline" onClick={prevStep} size="lg">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {currentStep === 0 && (
          <Button
            onClick={nextStep}
            disabled={!isValid || !jsonData.trim()}
            className="ml-auto"
            size="lg"
            variant="default"
          >
            Next
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        )}

        {currentStep === 1 && (
          <Button
            onClick={nextStep}
            disabled={!wallet?.publicKey}
            className="ml-auto"
            size="lg"
            variant="default"
          >
            Next
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
