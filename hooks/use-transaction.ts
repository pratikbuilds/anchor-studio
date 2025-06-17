"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Connection,
  DecompileArgs,
  TransactionMessage,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import useProgramStore from "@/lib/stores/program-store";

/**
 * Custom hook to fetch a Solana transaction by its signature.
 * @param signature The transaction signature (string).
 * @returns An object containing the transaction data, loading state, and error state.
 */
export function useTransaction(signature: string | undefined) {
  const rpcUrl = useProgramStore((state) => state.programDetails?.rpcUrl);

  return useQuery({
    queryKey: ["transaction", signature],
    queryFn: async () => {
      if (!rpcUrl) {
        throw new Error("RPC URL not available");
      }
      if (!signature) {
        // This case should ideally be handled by the `enabled` option,
        // but as a safeguard:
        return null;
      }
      const connection = new Connection(rpcUrl, "confirmed");
      const response: VersionedTransactionResponse | null =
        await connection.getTransaction(signature, {
          maxSupportedTransactionVersion: 0, // Ensures we get a VersionedTransaction
        });

      if (response !== null) {
        const versionedTx = response.transaction;
        const meta = response.meta;
        const message = versionedTx.message; // This is now a VersionedMessage
        // Convert Uint8Array signatures to base58 string array
        const signatures = versionedTx.signatures;

        const accountKeysFromLookups = response.meta?.loadedAddresses;
        // DecompileArgs expects { accountKeysFromLookups: LoadedAddresses }, and loadedAddresses is already in that format.
        // TransactionMessage.decompile internally checks if the message is v0 before using ALTs.
        const decompileArgs: DecompileArgs | undefined = accountKeysFromLookups
          ? { accountKeysFromLookups }
          : undefined;

        const decompiledTxMsg = TransactionMessage.decompile(
          message,
          decompileArgs
        );

        const data = {
          raw: {
            slot: response.slot,
            blockTime: response.blockTime,
            meta,
            message,
            signatures,
            transaction: decompiledTxMsg,
          },
        };
        return data;
      }

      return null;
    },
    enabled: !!rpcUrl && !!signature, // Only run query if rpcUrl and signature are available
    retry: 1, // Optional: retry once on failure
  });
}
