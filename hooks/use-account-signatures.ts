import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey, ConfirmedSignatureInfo } from "@solana/web3.js";
import { useMemo } from "react";
import useProgramStore from "@/lib/stores/program-store";

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

  const rpcUrl = useProgramStore((state) => state.programDetails?.rpcUrl);

  const connection = useMemo(() => {
    if (!rpcUrl) return null;
    return new Connection(rpcUrl);
  }, [rpcUrl]);

  const queryResult = useQuery<ConfirmedSignatureInfo[], Error>({
    queryKey,
    queryFn: async () => {
      if (!connection || !address) {
        throw new Error("Connection or address not provided");
      }
      console.log("publicKey", new PublicKey(address));
      const publicKey = new PublicKey(address);

      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit,
        before,
        until,
      });

      console.log("signatures from useAccountSignatures", signatures);

      return signatures;
    },
    enabled: enabled && !!connection && !!address,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  console.log("Data from useAccountSignatures:", queryResult.data);

  return queryResult;
}

export default useAccountSignatures;
