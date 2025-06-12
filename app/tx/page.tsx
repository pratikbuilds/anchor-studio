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
    isError,
  } = useAccountSignatures({
    address: programId || "",
    enabled: !!programId,
  });

  console.log("signatures", signatures);

  // Transform the API data to match our TxItem interface
  const transactions =
    signatures?.map((sig) => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: sig.blockTime,
      err: sig.err,
      memo: sig.memo,
      status: sig.err ? ("Error" as const) : ("Success" as const),
    })) || [];

  console.log("transactions", transactions);

  if (!programId) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <p className="text-center text-muted-foreground">
            Please initialize a program first to view transactions.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md">
            <h3 className="font-medium text-destructive mb-2">
              Failed to load transactions
            </h3>
            <p className="text-sm text-muted-foreground">
              {error?.message ||
                "An error occurred while fetching transaction data."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-2">
            View and search through transaction history for this program
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by signature, slot, or status..."
              className="pl-9 h-11 w-full bg-background border-muted shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full">
          <TransactionTable data={transactions} filter={query} />
        </div>
      </div>
    </div>
  );
}
