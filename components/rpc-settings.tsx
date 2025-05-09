"use client";

import * as React from "react";
import { Settings, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRpcStore, RPC_OPTIONS, type RpcOption } from "@/lib/store";

export function RpcSettings() {
  // Client-side only code
  const [mounted, setMounted] = React.useState(false);
  
  // Use Zustand store for state management
  const { 
    selectedRpc, 
    customRpcUrl, 
    dropdownOpen,
    setSelectedRpc, 
    setCustomRpcUrl, 
    setDropdownOpen,
    getCurrentRpcDisplayName
  } = useRpcStore();
  
  // Handle hydration mismatch by only rendering the full component after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Local state just for the input field
  const [inputCustomRpc, setInputCustomRpc] = React.useState<string>("");
  const customInputRef = React.useRef<HTMLInputElement>(null);
  const isCustomSelectionInProgress = React.useRef(false);

  // Initialize input field with stored custom URL
  React.useEffect(() => {
    if (customRpcUrl) {
      setInputCustomRpc(customRpcUrl);
    }
  }, [customRpcUrl]);

  // Auto-focus custom input when it becomes visible
  React.useEffect(() => {
    if (selectedRpc === 'custom' && dropdownOpen && customInputRef.current) {
      setTimeout(() => customInputRef.current?.focus(), 50);
    }
  }, [selectedRpc, dropdownOpen]);

  const handleRpcChange = (value: string) => {
    const newRpc = value as RpcOption;
    setSelectedRpc(newRpc);
    
    if (newRpc !== "custom") {
      const selectedOption = RPC_OPTIONS.find(opt => opt.value === newRpc);
      toast("RPC Endpoint Changed", {
        description: `Switched to ${selectedOption?.label}.`,
      });
      setDropdownOpen(false);
    }
  };

  const handleSaveCustomRpc = () => {
    if (inputCustomRpc.trim() === "") {
      toast.error("Custom RPC URL cannot be empty.");
      return;
    }
    
    try {
      new URL(inputCustomRpc);
    } catch (error) {
      toast.error("Please enter a valid Custom RPC URL.");
      return;
    }
    
    setCustomRpcUrl(inputCustomRpc);
    setSelectedRpc("custom");
    
    toast.success("Custom RPC Saved", {
      description: `Using custom RPC: ${inputCustomRpc}`,
    });
    
    setDropdownOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (isCustomSelectionInProgress.current && !open) {
      setDropdownOpen(true); // Override close if custom selection was in progress
      isCustomSelectionInProgress.current = false;
      return;
    }
    setDropdownOpen(open);
    isCustomSelectionInProgress.current = false;
  };

  // Initial render with a placeholder to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2 h-9"
      >
        <Settings className="h-5 w-5" />
        <span className="hidden md:inline text-sm font-medium">Select RPC</span>
        <span className="md:hidden text-sm">RPC</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </Button>
    );
  }

  // Full component after client-side hydration
  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 h-9"
        >
          <Settings className="h-5 w-5" />
          <span className="hidden md:inline text-sm font-medium">{getCurrentRpcDisplayName()}</span>
          <span className="md:hidden text-sm">RPC</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>RPC Endpoint</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup 
          value={selectedRpc === 'custom' ? '' : selectedRpc} 
          onValueChange={handleRpcChange}
        >
          {RPC_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value} className="cursor-pointer">
                {option.label}
              </DropdownMenuRadioItem>
            )
          )}
        </DropdownMenuRadioGroup>
        
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            isCustomSelectionInProgress.current = true;
            setDropdownOpen(true); // Explicitly keep the menu open
            
            if (selectedRpc !== 'custom') {
              setSelectedRpc('custom');
              setInputCustomRpc(customRpcUrl);
            }
            // Focus is handled by useEffect, which depends on dropdownOpen and selectedRpc
          }}
          className="cursor-pointer"
        >
          Custom
          {selectedRpc === 'custom' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>

        {selectedRpc === "custom" && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
                <Label htmlFor="custom-rpc-url" className="px-1 text-xs font-medium text-muted-foreground">
                    Custom RPC URL
                </Label>
                <Input
                    ref={customInputRef}
                    id="custom-rpc-url"
                    placeholder="https://your-custom-rpc.com"
                    value={inputCustomRpc}
                    onChange={(e) => setInputCustomRpc(e.target.value)}
                    className="h-9"
                />
                <Button onClick={handleSaveCustomRpc} className="w-full h-9" size="sm">
                    Save & Use Custom
                </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export a helper function to get the current RPC URL from the store
export const getRpcUrl = (): string => {
  // When used on the server side during SSR, return the default mainnet URL
  if (typeof window === 'undefined') {
    return RPC_OPTIONS.find(opt => opt.value === "mainnet-beta")!.url!;
  }
  
  // On the client side, use the store to get the current URL
  try {
    return useRpcStore.getState().getCurrentRpcUrl();
  } catch (error) {
    // Fallback to default if there's any issue with the store
    return RPC_OPTIONS.find(opt => opt.value === "mainnet-beta")!.url!;
  }
};
