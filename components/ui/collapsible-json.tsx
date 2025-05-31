"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";

interface CollapsibleJsonProps {
  title: string;
  description?: string;
  data: any;
  className?: string;
  defaultOpen?: boolean;
}

export function CollapsibleJson({
  title,
  description,
  data,
  className,
  defaultOpen = false,
}: CollapsibleJsonProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data || {}, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy JSON");
    }
  };

  return (
    <Card className={cn("border-0 shadow-md", className)}>
      <CardHeader className="bg-card/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyToClipboard}
              title="Copy JSON"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(!isOpen)}
              title={isOpen ? "Collapse" : "Expand"}
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-0 max-h-[500px] overflow-auto bg-muted/20">
          <pre className="text-xs font-mono whitespace-pre-wrap p-4">
            {json}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
