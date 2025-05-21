"use client";

import NoProgramFound from "@/components/no-program";
import { useAccountData } from "@/hooks/useAccountData";
import { useProgramStore } from "@/lib/stores/program-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export default function AccountsPage() {
  const programStoreState = useProgramStore((state) => state);
  const { program, isInitialized, error } = programStoreState;
  const [activeTab, setActiveTab] = useState(
    program?.idl?.accounts?.[0]?.name ?? ""
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
  const typedAccountName = accountNames[0] as keyof typeof program.account;
  const {
    data,
    isLoading: accountDataLoading,
    error: accountDataError,
  } = useAccountData(program, typedAccountName);
  console.log("data", data);
  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        <h2 className="text-xl font-semibold">Error Initializing Program</h2>
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-500">
          Please check your program ID and network settings on the main page.
        </p>
      </div>
    );
  }
  if (
    !program ||
    !program.idl ||
    !program.idl.accounts ||
    program.idl.accounts.length === 0
  ) {
    return <NoProgramFound />;
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Program Accounts</h1>
      <div className="py-3 px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:w-auto gap-1">
            {program.idl.accounts.map((account) => (
              <TabsTrigger
                key={account.name}
                value={account.name}
                className="capitalize text-sm px-3 py-1.5"
              >
                {account.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {program.idl.accounts.map((account) => (
            <TabsContent
              key={account.name}
              value={account.name}
              className="mt-1"
            ></TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
