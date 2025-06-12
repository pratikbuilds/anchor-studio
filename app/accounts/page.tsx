"use client";

import NoProgramFound from "@/components/no-program";
import { useAccountData, useAccountsByPubkeys } from "@/hooks/useAccountData";
import useProgramStore from "@/lib/stores/program-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { AccountData, AccountTable } from "@/components/account-table";
import { Idl, IdlAccount } from "@coral-xyz/anchor/dist/cjs/idl";
import { Loader2 } from "lucide-react";
import { useAccountPubkeys } from "@/hooks/useAccountPubkeys";

function AccountTabContent({
  account,
  isActive,
}: {
  account: IdlAccount;
  isActive: boolean;
}) {
  const { program } = useProgramStore();
  if (!program) return null;
  console.log("account", account);

  const {
    data: pubkeys,
    isLoading: pubkeysLoading,
    error: pubkeysError,
  } = useAccountPubkeys(program, account.name, { enabled: isActive });

  const {
    data: accountsData,
    isLoading: accountsLoading,
    error: accountsError,
  } = useAccountsByPubkeys(
    program,
    account.name as keyof (typeof program.idl)["accounts"],
    pubkeys,
    { enabled: isActive && !!pubkeys && pubkeys.length > 0 }
  );
  console.log("accountsData", accountsData);
  const accountType = useMemo(
    () => program.idl.types?.find((type) => type.name === account.name),
    [program, account]
  );

  console.log("accountType", accountType);

  const transformedData: AccountData[] = useMemo(
    () =>
      accountsData?.flatMap((item) =>
        item.account
          ? [
              {
                publicKey: item.publicKey,
                account: item.account as Record<string, unknown>,
              },
            ]
          : []
      ) ?? [],
    [accountsData]
  );

  if (pubkeysLoading || accountsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pubkeysError || accountsError) {
    return (
      <div className="p-4 text-red-500">
        Error fetching accounts:{" "}
        {pubkeysError?.message || accountsError?.message}
      </div>
    );
  }

  if (!accountType) {
    return (
      <div className="p-4 text-orange-500">
        Could not find type definition for account: {account.name}
      </div>
    );
  }

  return <AccountTable data={transformedData} accountType={accountType} />;
}

export default function AccountsPage() {
  const programStoreState = useProgramStore((state) => state);
  const { program, programDetails, error } = programStoreState;

  const accounts = useMemo(() => program?.idl?.accounts || [], [program]);

  const [activeTab, setActiveTab] = useState(accounts[0]?.name ?? "");

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="p-4 text-red-500">
          Error initializing program: {error.message}
        </div>
      </div>
    );
  }

  if (!program || !programDetails) {
    return <NoProgramFound />;
  }

  if (accounts.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
        <div className="p-6 text-center text-muted-foreground">
          <h2 className="text-xl font-semibold">No Accounts Found</h2>
          <p className="mt-2">This program doesn't define any account types.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Program Accounts</h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-auto p-1">
              {accounts.map((account) => (
                <TabsTrigger
                  key={account.name}
                  value={account.name}
                  className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2"
                >
                  {account.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {accounts.map((account) => (
            <TabsContent
              key={account.name}
              value={account.name}
              className="mt-4"
            >
              <AccountTabContent
                account={account}
                isActive={activeTab === account.name}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
