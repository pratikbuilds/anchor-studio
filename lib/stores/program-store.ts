import { create } from "zustand";
import { Program, Idl, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, Commitment, Cluster } from "@solana/web3.js";
import { AnchorWallet } from "@jup-ag/wallet-adapter";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

/**
 * Type representing a Solana program with any IDL
 */
type AnyProgram = Program<Idl>;

/**
 * Type for Solana commitment level
 */
type CommitmentLevel = Commitment;

/**
 * Interface for program details
 */
export interface ProgramDetails {
  /**
   * The program ID on the Solana blockchain
   */
  programId: string;

  /**
   * Display name for the program
   */
  name: string;

  /**
   * RPC URL used to connect to the program
   */
  rpcUrl: string;

  /**
   * Solana cluster (e.g., 'mainnet-beta', 'devnet')
   */
  cluster: Cluster | string;

  /**
   * Commitment level for transactions
   */
  commitment: CommitmentLevel;

  /**
   * Timestamp when the program was initialized
   */
  initializedAt: number;

  /**
   * Serialized IDL for the program
   */
  serializedIdl: string;
}

/**
 * Interface for the program store state
 */
export interface ProgramState {
  /**
   * The active Anchor program instance
   */
  program: AnyProgram | null;

  /**
   * The Anchor provider for the active program
   */
  provider: AnchorProvider | null;

  /**
   * The Solana connection for the active program
   */
  connection: Connection | null;

  /**
   * Whether a program is initialized
   */
  isInitialized: boolean;

  /**
   * Any error that occurred during initialization
   */
  error: {
    name: string;
    message: string;
    stack?: string;
  } | null;

  /**
   * Details of the active program
   */
  programDetails: ProgramDetails | null;

  /**
   * Initialize a program with the given IDL and connection details
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
   * Reinitialize the program from stored state
   * @param wallet - The connected wallet
   * @returns The reinitialized program or null if reinitialization failed
   */
  reinitialize: (wallet: AnchorWallet) => Promise<AnyProgram | null>;

  /**
   * Reset the store to its initial state
   */
  reset: () => void;
}

/**
 * Default commitment level for Solana connections
 */
const DEFAULT_COMMITMENT: CommitmentLevel = "confirmed";

/**
 * Default connection config
 */
const DEFAULT_CONNECTION_CONFIG = {
  commitment: DEFAULT_COMMITMENT,
  confirmTransactionInitialTimeout: 30000, // 30 seconds
};

/**
 * Helper function to determine the cluster from an RPC URL
 */
function getClusterFromRpcUrl(rpcUrl: string): Cluster | string {
  if (rpcUrl.includes("devnet")) return "devnet";
  if (rpcUrl.includes("testnet")) return "testnet";
  if (rpcUrl.includes("mainnet")) return "mainnet-beta";
  if (rpcUrl.includes("localhost") || rpcUrl.includes("127.0.0.1"))
    return "localnet";
  return "custom";
}

/**
 * Type for the persisted state
 */
type PersistedState = Pick<ProgramState, "programDetails" | "isInitialized">;

/**
 * Create the program store with a single program instance
 */
const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
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
        try {
          // Reset any previous state
          set({
            error: null,
            isInitialized: false,
            program: null,
            provider: null,
            connection: null,
            programDetails: null,
          });

          // Create connection
          const connection = new Connection(rpcUrl, {
            ...DEFAULT_CONNECTION_CONFIG,
          });

          // Create provider
          const provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: commitment,
            commitment,
          });

          // Create program instance directly with the provider
          // This approach worked in the original implementation
          const program = new Program(idl, provider);

          // Determine cluster from RPC URL
          const cluster = getClusterFromRpcUrl(rpcUrl);

          // Create program details
          const programDetails: ProgramDetails = {
            programId: program.programId.toString(),
            name: idl.metadata?.name || "Anchor Program",
            rpcUrl,
            cluster,
            commitment,
            initializedAt: Date.now(),
            serializedIdl: JSON.stringify(idl),
          };

          // Update state
          set({
            isInitialized: true,
            program,
            provider,
            connection,
            programDetails,
          });
          console.log("[program-store] Program initialized successfully");

          return program;
        } catch (error) {
          let errorMessage = "Failed to initialize program";
          let errorName = "ProgramInitializationError";
          let errorStack: string | undefined;

          if (error instanceof Error) {
            errorMessage = error.message;
            errorName = error.name;
            errorStack = error.stack;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else if (error && typeof error === "object") {
            errorMessage = String((error as any).message || error);
          }

          const errorObj = {
            name: errorName,
            message: errorMessage,
            stack: errorStack,
          };

          console.error("Program initialization error:", errorObj);

          set({
            error: errorObj,
            isInitialized: false,
            program: null,
            provider: null,
            connection: null,
            programDetails: null,
          });

          throw new Error(errorMessage);
        }
      },

      reinitialize: async (wallet: AnchorWallet) => {
        const { programDetails } = get();
        console.log("reinitialize programDetails", programDetails);
        if (!programDetails) {
          console.log(
            "[program-store] No program details found for reinitialization"
          );
          return null;
        }

        try {
          console.log("[program-store] Reinitializing program...");

          // Parse the serialized IDL
          let idl: Idl;
          try {
            idl = JSON.parse(programDetails.serializedIdl);
          } catch (error) {
            console.error("[program-store] Failed to parse IDL:", error);
            throw new Error("Failed to parse program IDL");
          }

          if (!idl && !programDetails.rpcUrl && !programDetails.commitment) {
            console.log(
              "[program-store] No program details found for reinitialization"
            );
            return null;
          }

          // Reinitialize the program
          const program = await get().initialize(
            idl,
            programDetails.rpcUrl,
            wallet,
            programDetails.commitment
          );

          console.log("[program-store] Program reinitialized successfully");
          return program;
        } catch (error) {
          let errorMessage = "Failed to reinitialize program";
          let errorName = "ProgramReinitializationError";
          let errorStack: string | undefined;

          if (error instanceof Error) {
            errorMessage = error.message;
            errorName = error.name;
            errorStack = error.stack;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else if (error && typeof error === "object") {
            errorMessage = String((error as any).message || error);
          }

          const errorObj = {
            name: errorName,
            message: errorMessage,
            stack: errorStack,
          };

          console.error("[program-store] Reinitialization error:", errorObj);

          // Update error state before resetting
          set({
            error: errorObj,
          });

          // Reset state on error
          get().reset();
          throw new Error(errorMessage);
        }
      },

      reset: () => {
        set({
          isInitialized: false,
          program: null,
          provider: null,
          connection: null,
          programDetails: null,
          error: null,
        });
      },
    }),
    {
      name: "anchor-studio-program",
      partialize: (state) =>
        ({
          programDetails: state.programDetails,
          isInitialized: state.isInitialized,
        } as PersistedState),
    }
  )
);

export default useProgramStore;
