"use client";

import React, { useState, useRef, useCallback } from "react";
import { useJsonStore } from "@/lib/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JsonEditor } from "@/components/json-editor";
import { ArrowRight, CodeIcon, FileJson, UploadIcon } from "lucide-react";

export default function StepUploadIdl({ onNext }: { onNext: () => void }) {
  const [activeTab, setActiveTab] = useState<"upload" | "editor">("editor");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isValid, setJsonData } = useJsonStore();

  const processJsonFile = useCallback(
    (file: File) => {
      if (!file) return;

      if (!file.name.endsWith(".json") && file.type !== "application/json") {
        toast.error("Invalid file type. Please upload a JSON file.", {
          description: "Only .json files are supported.",
          duration: 3000,
        });
        return;
      }

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

      const reader = new FileReader();
      toast.loading("Uploading JSON file...", { id: "upload-json" });

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);

          console.log("Uploaded JSON data:", jsonData);

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
            description:
              error instanceof Error
                ? error.message
                : "The file contains invalid JSON syntax.",
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
    },
    [setJsonData]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        processJsonFile(file);
      }
      if (event.target) {
        event.target.value = "";
      }
    },
    [processJsonFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        processJsonFile(file);
      }
    },
    [processJsonFile]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const openFileDialog = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Program IDL</h2>
        <p className="text-muted-foreground">
          Provide your Anchor program IDL by uploading a JSON file or using the
          editor
        </p>
      </div>
      {/* Tab selector */}
      <div className="flex mb-4">
        <div className="inline-flex h-10 items-center justify-center gap-1 rounded-md bg-muted p-1">
          <button
            onClick={() => setActiveTab("editor")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === "editor"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <CodeIcon className="mr-2 h-4 w-4" />
            JSON Editor
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === "upload"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload File
          </button>
        </div>
      </div>
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
              <h3 className="text-lg font-medium">Upload IDL JSON File</h3>
              <p className="text-sm text-muted-foreground">
                Upload your Anchor program IDL JSON file to initialize your
                program
              </p>
            </div>
            <div className="p-6 flex-1">
              <div
                className={`flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-12 transition-colors cursor-pointer ${
                  isDragOver
                    ? "border-primary/50 bg-primary/20"
                    : "border-primary/20 bg-primary/5 hover:border-primary/30 hover:bg-primary/10"
                }`}
                onClick={openFileDialog}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="json-upload"
                  accept=".json,application/json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
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
                <Button variant="outline" className="gap-2 pointer-events-none">
                  <UploadIcon className="h-4 w-4" />
                  Select JSON File
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onNext} disabled={!isValid} className="gap-2">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
