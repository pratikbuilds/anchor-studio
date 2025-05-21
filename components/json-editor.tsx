"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useJsonStore } from "@/lib/store";

interface JsonEditorProps {
  onChange?: (value: string, isValid: boolean) => void;
}

export function JsonEditor({ onChange }: JsonEditorProps) {
  const { jsonData, isValid, setJsonData, setIsValid } = useJsonStore();
  const [code, setCode] = useState(jsonData);
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize from store
  useEffect(() => {
    if (jsonData !== code) {
      setCode(jsonData);
    }
  }, [jsonData]);

  // Validate JSON and update store
  useEffect(() => {
    try {
      if (code.trim()) {
        JSON.parse(code);
        setIsValid(true);
        setErrorMessage("");
      } else {
        // Empty is considered valid
        setIsValid(true);
        setErrorMessage("");
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
    }

    // Update store
    setJsonData(code);

    // Call onChange if provided
    if (onChange) {
      onChange(code, isValid);
    }
  }, [code, onChange, setIsValid, setJsonData]);

  const formatJson = () => {
    try {
      if (code.trim()) {
        const formatted = JSON.stringify(JSON.parse(code), null, 2);
        setCode(formatted);
      }
    } catch (error) {
      // Keep the current code if it's invalid
    }
  };

  // Handle tab key to insert spaces instead of changing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces at cursor position
      const newValue =
        textarea.value.substring(0, start) +
        "  " +
        textarea.value.substring(end);

      // Update state
      setCode(newValue);

      // Move cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-md border bg-background shadow-sm">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[700px] w-full resize-none rounded-md border-0 bg-transparent p-4 font-mono text-sm shadow-none focus-visible:outline-none focus-visible:ring-0"
          style={{
            fontFamily: "monospace",
            lineHeight: "1.5",
            tabSize: 2,
          }}
          placeholder="Enter JSON here..."
          spellCheck="false"
        />
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={formatJson}
            className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
            title="Format JSON"
            disabled={!code.trim()}
          >
            Format
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {code.trim() === "" ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Enter JSON or upload a file</span>
          </div>
        ) : isValid ? (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span>Valid JSON</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage || "Invalid JSON"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
