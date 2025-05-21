"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { JsonEditor } from "@/components/json-editor";
import { useJsonStore } from "@/lib/store";
import { useAnchorWallet, useWallet } from "@jup-ag/wallet-adapter";
import { useProgramStore } from "@/lib/stores/program-store";
import { useRpcStore } from "@/lib/stores/rpc-store";
import { shallow } from "zustand/shallow";

export default function Page() {
  const { jsonData, isValid, setJsonData } = useJsonStore();

  const { initialize, isInitialized } = useProgramStore();
  const program = useProgramStore((state) => state.program);
  const { getCurrentRpcUrl } = useRpcStore();
  const wallet = useAnchorWallet();
  console.log("isInitialized", isInitialized);
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
      console.log("rpcUrl", rpcUrl);
      // Create a proper wallet object with required methods

      const initializedProgram = await initialize(idl, rpcUrl, wallet);
      const currentProgram = useProgramStore.getState().program;

      toast.success("Program initialized successfully", {
        id: "add-program",
        description: "The program is now ready to use.",
        duration: 3000,
      });

      console.log("Program initialized:", currentProgram);
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

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="p-4 md:p-6">
            <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                  JSON Editor
                </h2>
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <input
                      type="file"
                      id="json-upload"
                      accept=".json"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={handleFileUpload}
                    />
                    <button
                      className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 relative overflow-hidden group"
                      onClick={triggerFileInput}
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform group-hover:translate-y-[-2px]"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload JSON
                      </span>
                    </button>
                  </div>
                  <button
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group"
                    onClick={handleAddProgram}
                    disabled={
                      !isValid || !jsonData.trim() || !wallet?.publicKey
                    }
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform group-hover:scale-110"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Add Program
                    </span>
                  </button>
                </div>
              </div>
              <div className="relative mt-2 w-full">
                <JsonEditor />
              </div>
              <div className="flex justify-end">
                <div className="text-sm text-muted-foreground">
                  Tip: Use the Format button to beautify your JSON
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
