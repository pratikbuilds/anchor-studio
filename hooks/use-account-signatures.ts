import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import useProgramStore from "@/lib/stores/program-store";
import { program } from "@coral-xyz/anchor/dist/cjs/native/system";

type SignatureInfo = {
  signature: string;
  slot: number;
  err: any;
  memo: string | null;
  blockTime?: number | null;
};

type UseAccountSignaturesOptions = {
  address: string | null;
  limit?: number;
  before?: string;
  until?: string;
  enabled?: boolean;
};

export function useAccountSignatures({
  address,
  limit = 10,
  before,
  until,
  enabled = true,
}: UseAccountSignaturesOptions) {
  const queryKey = useMemo(
    () => ["accountSignatures", address, { limit, before, until }],
    [address, limit, before, until]
  );

  const rpcUrl = useProgramStore((program) => program.programDetails?.rpcUrl);

  if (!rpcUrl) {
    throw new Error("RPC URL not found");
  }

  const connection = new Connection(rpcUrl);

  return useQuery<SignatureInfo[], Error>({
    queryKey,
    queryFn: async () => {
      if (!connection || !address) {
        throw new Error("Connection or address not provided");
      }

      const publicKey = new PublicKey(address);

      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit,
        before,
        until,
      });

      return signatures;
    },
    enabled: enabled && !!connection && !!address,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export default useAccountSignatures;
