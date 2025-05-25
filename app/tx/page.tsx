"use client";

import { useState } from "react";
import { TransactionTable, TxItem } from "@/components/transaction-table";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

// TODO: Replace with fetched program transactions
const mockData: TxItem[] = [
  {
    signature: "4T92...abc",
    slot: 123456,
    blockTime: 1716613200,
    status: "Success",
  },
  {
    signature: "9H1z...xyz",
    slot: 123457,
    blockTime: 1716613300,
    status: "Error",
  },
];

export default function TransactionsPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search transactions by signature, slot, status..."
          className="pl-9 h-11 w-full bg-background border-muted shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="w-full max-w-6xl">
        <TransactionTable data={mockData} filter={query} />
      </div>
    </div>
  );
}
