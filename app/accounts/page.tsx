"use client";

import NoProgramFound from "@/components/no-program";
import { useAccountData } from "@/hooks/useAccountData";
import useProgramStore from "@/lib/stores/program-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { AccountData, AccountTable } from "@/components/account-table";

export default function AccountsPage() {
  const programStoreState = useProgramStore((state) => state);
  const { program, programDetails, isInitialized, error } = programStoreState;
  const [activeTab, setActiveTab] = useState(
    program?.idl?.accounts?.[0]?.name ?? ""
  );
  console.log("isInitialized", isInitialized);
  console.log("program", program);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error initializing program: {error.message}
      </div>
    );
  }

  if (!program || !programDetails) {
    return <NoProgramFound />;
  }
  if (!program.idl?.accounts || program.idl.accounts.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <h2 className="text-xl font-semibold">No Accounts Found</h2>
        <p className="mt-2">This program doesn't define any account types.</p>
      </div>
    );
  }

  const accountNames = program.idl.accounts.map((acc) => acc.name);
  const typedAccountName = accountNames[0] as keyof typeof program.account;
  const accountType = program.idl.types?.find(
    (type) => type.name === typedAccountName
  );
  console.log("accountType", accountType);
  const {
    data,
    isLoading: accountDataLoading,
    error: accountDataError,
  } = useAccountData(program, typedAccountName);
  console.log("data", data);
  const transformedData: AccountData[] =
    data?.map((item) => ({
      publicKey: item.publicKey.toString(),
      account: item.account,
    })) || [];

  if (!program.idl?.accounts || program.idl.accounts.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <h2 className="text-xl font-semibold">No Accounts Found</h2>
        <p className="mt-2">This program doesn't define any account types.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Program Accounts</h1>
      <div className="py-3 px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="inline-flex items-center px-3 py-1  bg-muted/40 gap-2 mb-3">
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
            >
              <AccountTable data={transformedData} accountType={accountType} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
