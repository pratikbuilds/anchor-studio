import { create } from "zustand";
import { Program, Idl, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, Commitment, Cluster } from "@solana/web3.js";
import { AnchorWallet } from "@jup-ag/wallet-adapter";

/**
 * Type representing a Solana program with any IDL
 */
type AnyProgram = Program<Idl>;

/**
 * Type for Solana commitment level
 */
type CommitmentLevel = "processed" | "confirmed" | "finalized";

/**
 * Interface for program details
 */
export interface ProgramDetails {
  // Program ID as string
  programId: string;
  // Program name from IDL
  name: string;
  // RPC URL being used
  rpcUrl: string;
  // Network cluster (mainnet-beta, devnet, etc.)
  cluster: Cluster | string;
  // Commitment level
  commitment: CommitmentLevel;
  // Timestamp when program was initialized
  initializedAt: number;
}

/**
 * Interface for the program store state
 */
interface ProgramState {
  // The Anchor program instance
  program: AnyProgram | null;

  // The Anchor provider instance
  provider: AnchorProvider | null;

  // The Solana connection instance
  connection: Connection | null;

  // Whether the program has been initialized
  isInitialized: boolean;

  // Any error that occurred during initialization
  error: Error | null;
  
  // Detailed information about the initialized program
  programDetails: ProgramDetails | null;

  /**
   * Initialize the program with the given IDL and connection details
   * @param idl - The Anchor IDL for the program
   * @param rpcUrl - The RPC URL to connect to
   * @param wallet - The connected wallet
   * @param commitment - The commitment level (default: 'confirmed')
   * @returns The initialized program or null if initialization failed
   */
  initialize: (
    idl: Idl,
    rpcUrl: string,
    wallet: AnchorWallet,
    commitment?: CommitmentLevel
  ) => Promise<AnyProgram | null>;

  /**
   * Reset the program state
   */
  reset: () => void;
}

/**
 * Default commitment level for Solana connections
 */
const DEFAULT_COMMITMENT: CommitmentLevel = "confirmed";

/**
 * Default connection configuration
 */
const DEFAULT_CONNECTION_CONFIG = {
  confirmTransactionInitialTimeout: 30000, // 30 seconds
};

export const useProgramStore = create<ProgramState>((set, get) => ({
  program: null,
  provider: null,
  connection: null,
  isInitialized: false,
  error: null,
  programDetails: null,

  initialize: async (
    idl: Idl,
    rpcUrl: string,
    wallet: AnchorWallet,
    commitment: CommitmentLevel = DEFAULT_COMMITMENT
  ): Promise<AnyProgram | null> => {
    console.log("[program-store] Attempting to initialize program with IDL name:", idl.metadata.name, "RPC:", rpcUrl);
    try {
      if (!rpcUrl) {
        throw new Error("RPC URL is required");
      }

      if (!wallet?.publicKey) {
        throw new Error("Wallet not connected");
      }

      // Reset any previous state
      get().reset();

      // Create connection
      const connection = new Connection(rpcUrl, {
        commitment,
        ...DEFAULT_CONNECTION_CONFIG,
      });

      // Create provider
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: commitment,
        commitment,
      });

      const program = new Program(idl, provider);
      console.log("[program-store] Program instance created:", program?.programId?.toString());
      
      // Determine cluster from RPC URL
      let cluster: Cluster | string = "custom";
      if (rpcUrl.includes("mainnet-beta")) {
        cluster = "mainnet-beta";
      } else if (rpcUrl.includes("devnet")) {
        cluster = "devnet";
      } else if (rpcUrl.includes("127.0.0.1") || rpcUrl.includes("localhost")) {
        cluster = "localnet";
      }
      
      // Create program details object
      const programDetails: ProgramDetails = {
        programId: program.programId.toString(),
        name: idl.metadata?.name || "Unknown Program",
        rpcUrl,
        cluster,
        commitment,
        initializedAt: Date.now(),
      };

      // Update state
      set({
        program,
        provider,
        connection,
        isInitialized: true,
        error: null,
        programDetails,
      });
      console.log("[program-store] State after set:", get());

      return program;
    } catch (error) {
      const errorObj =
        error instanceof Error
          ? error
          : new Error(`Failed to initialize program: ${String(error)}`);

      console.error("Program initialization error:", errorObj);

      set({
        error: errorObj,
        isInitialized: false,
        program: null,
        provider: null,
        connection: null,
        programDetails: null,
      });

      throw errorObj;
    }
  },

  reset: () => {
    console.log("[program-store] Resetting program state. Current state:", get());
    set({
      program: null,
      provider: null,
      connection: null,
      isInitialized: false,
      error: null,
      programDetails: null,
    });
  },
}));

// Export a type-safe hook for convenience
export const useConnectedProgram = <T extends Idl>() => {
  const { program, ...rest } = useProgramStore();
  return {
    ...rest,
    program: program as Program<T> | null,
  };
};

export default useProgramStore;
