import * as anchor from "@coral-xyz/anchor";
import { AllAccountsMap } from "@coral-xyz/anchor/dist/cjs/program/namespace/types";
import { useQuery } from "@tanstack/react-query";

// Helper to compute the 8-byte discriminator for an Anchor account type
function getDiscriminator(accountName: string): Buffer {
  const preimage = `account:${accountName}`;
  const hashHex = anchor.utils.sha256.hash(preimage);
  const discriminator = Buffer.from(hashHex, "hex").slice(0, 8);

  return discriminator;
}

// Fetch all public keys for a given Anchor account type
const getAccountPubkeys = async <T extends anchor.Idl>(
  program: anchor.Program<T>,
  accountName: keyof AllAccountsMap<T>
): Promise<string[]> => {
  const discriminator = getDiscriminator(accountName.toString());
  const discriminatorB58 = anchor.utils.bytes.bs58.encode(discriminator);
  const filter = {
    memcmp: {
      offset: 0,
      bytes: discriminatorB58,
    },
  };

  const accounts = await program.provider.connection.getProgramAccounts(
    program.programId,
    {
      dataSlice: { offset: 0, length: 0 }, // Only fetch pubkeys, no data
      filters: [filter],
    }
  );

  return accounts.map((acc) => acc.pubkey.toBase58());
};

export function useAccountPubkeys<T extends anchor.Idl>(
  program: anchor.Program<T>,
  accountName: string,
  options?: { enabled: boolean }
) {
  return useQuery({
    queryKey: ["accountPubkeys", accountName],
    queryFn: () =>
      getAccountPubkeys<T>(program, accountName as keyof AllAccountsMap<T>),
    ...options,
  });
}
