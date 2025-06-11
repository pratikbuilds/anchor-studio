"use client";

import NoProgramFound from "@/components/no-program";
import { useAccountData } from "@/hooks/useAccountData";
import useProgramStore from "@/lib/stores/program-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { AccountData, AccountTable } from "@/components/account-table";
import { IdlAccount } from "@coral-xyz/anchor/dist/cjs/idl";
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
  console.log("account", account);
  const {
    data,
    isLoading: accountDataLoading,
    error: accountDataError,
  } = useAccountData(program!, account.name, { enabled: isActive });
  const {
    data: pubkeys,
    isLoading,
    error,
  } = useAccountPubkeys(program!, account.name, { enabled: isActive });
  console.log("pubkeys", pubkeys);

  const accountType = useMemo(
    () => program!.idl.types?.find((type) => type.name === account.name),
    [program, account]
  );

  const transformedData: AccountData[] = useMemo(
    () =>
      data?.map((item) => ({
        publicKey: item.publicKey.toString(),
        account: item.account,
      })) || [],
    [data]
  );

  if (accountDataLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (accountDataError) {
    return (
      <div className="p-4 text-red-500">
        Error fetching accounts: {accountDataError.message}
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
      <div className="p-4 text-red-500">
        Error initializing program: {error.message}
      </div>
    );
  }

  if (!program || !programDetails) {
    return <NoProgramFound />;
  }

  if (accounts.length === 0) {
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
