import * as anchor from "@coral-xyz/anchor";
import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { AllAccountsMap } from "@coral-xyz/anchor/dist/cjs/program/namespace/types";
import { useQuery } from "@tanstack/react-query";

//TODO:(Pratik) Add Filter support to this
const getAllAccountsData = async <T extends anchor.Idl>(
  program: anchor.Program<T>,
  accountName: keyof AllAccountsMap<T>
) => {
  const lowerCaseAccountName =
    accountName.toLowerCase() as keyof AllAccountsMap<T>;
  const data = await program.account[lowerCaseAccountName].all();
  return data;
};

export const getAccountData = async <T extends anchor.Idl>(
  program: anchor.Program<T>,
  accountName: keyof AllAccountsMap<T>,
  pubkey: string
) => {
  if (!pubkey) return null;
  const accountKeys = new anchor.web3.PublicKey(pubkey);
  const lowerCaseAccountName =
    accountName.toLowerCase() as keyof AllAccountsMap<T>;
  const data = await program.account[lowerCaseAccountName].fetchNullable(
    accountKeys
  );
  return data;
};

export function useOneAccountData<T extends anchor.Idl>(
  program: anchor.Program<T>,
  accountName: keyof AllAccountsMap<T>,
  pubkey: string
) {
  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["accountData", accountName, pubkey],
    queryFn: () => getAccountData<T>(program, accountName, pubkey),
  });
  return query;
}

export function useAccountData<T extends anchor.Idl>(
  program: anchor.Program<T>,
  accountName: keyof AllAccountsMap<T>,
  options?: { enabled: boolean }
) {
  const query = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["accountData", accountName],
    queryFn: () => getAllAccountsData<T>(program, accountName),
    ...options,
  });
  return query;
}

export function useAccountsByPubkeys<T extends anchor.Idl>(
  program: anchor.Program<T>,
  accountName: keyof AllAccountsMap<T>,
  pubkeys: string[] | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["accountsByPubkeys", accountName, pubkeys],
    enabled:
      !!program &&
      !!accountName &&
      !!pubkeys &&
      pubkeys.length > 0 &&
      (options?.enabled ?? true),
    queryFn: async () => {
      if (!pubkeys || pubkeys.length === 0) return [];
      const lowerCaseAccountName =
        accountName.toLowerCase() as keyof AllAccountsMap<T>;
      const publicKeys = pubkeys.map((k) => new anchor.web3.PublicKey(k));
      const data = await program.account[lowerCaseAccountName].fetchMultiple(
        publicKeys
      );
      // fetchMultiple returns array in the same order as pubkeys, but may include nulls for missing accounts
      return data.map((account, i) => ({
        publicKey: pubkeys[i],
        account,
      }));
    },
    ...options,
  });
}
