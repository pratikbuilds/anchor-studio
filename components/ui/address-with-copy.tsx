"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { toast } from "sonner";

interface AddressWithCopyProps {
  address: string;
  truncate?: boolean;
  truncateLength?: number;
  className?: string;
  iconClassName?: string;
  monospace?: boolean;
  label?: string;
}

/**
 * A component to display an address with a copy button
 */
export function AddressWithCopy({
  address,
  truncate = true,
  truncateLength = 4,
  className,
  iconClassName,
  monospace = true,
  label,
}: AddressWithCopyProps) {
  const [copied, setCopied] = useState(false);

  const displayAddress = truncate
    ? `${address.slice(0, truncateLength)}...${address.slice(-truncateLength)}`
    : address;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className="text-sm font-medium text-muted-foreground mr-2">
          {label}:
        </span>
      )}
      <span
        className={cn(
          "text-sm",
          monospace && "font-mono",
          "overflow-hidden text-ellipsis"
        )}
        title={address}
      >
        {displayAddress}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-6 w-6", iconClassName)}
        onClick={copyToClipboard}
        title="Copy address"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
