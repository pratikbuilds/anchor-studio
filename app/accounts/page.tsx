"use client";

import { useProgramStore } from "@/lib/stores/program-store";
import { useEffect, useState } from "react";

export default function AccountsPage() {
  const programStoreState = useProgramStore((state) => state);

  // useEffect(() => {
  //   console.log(
  //     "[AccountsPage] Mounted. Current program store state:",
  //     programStoreState
  //   );
  //   console.log("[AccountsPage] Program instance:", programStoreState.program);
  //   console.log(
  //     "[AccountsPage] Program accounts:",
  //     programStoreState.program?.account
  //   );
  // }, [programStoreState]);

  const { program, isInitialized, error } = programStoreState;
  const [accountData, setAccountData] = useState<Record<string, any> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error initializing program: {error.message}
      </div>
    );
  }

  if (!isInitialized || !program) {
    return (
      <div className="p-4">
        Program is not initialized. Please initialize it from the main page.
      </div>
    );
  }

  const accountNames = program.idl.accounts?.map((acc) => acc.name) || [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Program Accounts</h1>
      {isLoading ? (
        <div className="p-4 text-gray-600">Loading account data...</div>
      ) : fetchError ? (
        <div className="p-4 text-red-500">Error: {fetchError}</div>
      ) : accountData ? (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Account: {accountNames[0]}</h2>
          <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
            {JSON.stringify(accountData, null, 2)}
          </pre>
        </div>
      ) : accountNames.length > 0 ? (
        <ul className="space-y-2">
          {accountNames.map((name) => (
            <li key={name} className="p-3 border rounded-md hover:bg-gray-50">
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No accounts defined in the IDL or program not fully loaded.</p>
      )}
    </div>
  );
}
