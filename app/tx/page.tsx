"use client";

import { useState } from "react";
import { TransactionTable, TxItem } from "@/components/transaction-table";
import { Input } from "@/components/ui/input";
import { SearchIcon, Loader2 } from "lucide-react";
import useProgramStore from "@/lib/stores/program-store";
import useAccountSignatures from "@/hooks/use-account-signatures";

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const programId = useProgramStore((state) => state.programDetails?.programId);
  
  const { 
    data: signatures, 
    isLoading, 
    error,
    isError 
  } = useAccountSignatures({
    address: programId || "",
    enabled: !!programId,
  });

  // Transform the API data to match our TxItem interface
  const transactions = signatures?.map(sig => ({
    signature: sig.signature,
    slot: sig.slot,
    blockTime: sig.blockTime,
    err: sig.err,
    memo: sig.memo,
    status: sig.err ? 'Error' as const : 'Success' as const,
  })) || [];

  if (!programId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-6">
        <p className="text-center text-muted-foreground">
          Please initialize a program first to view transactions.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md">
          <h3 className="font-medium text-destructive mb-2">Failed to load transactions</h3>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'An error occurred while fetching transaction data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center gap-6 w-full">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and search through transaction history for this program
          </p>
        </div>
        
        <div className="relative w-full max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by signature, slot, or status..."
            className="pl-9 h-11 w-full bg-background border-muted shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="w-full">
          <TransactionTable 
            data={transactions} 
            filter={query} 
          />
        </div>
      </div>
    </div>
  );
}
