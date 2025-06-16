"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionInstruction } from "@solana/web3.js";
import useProgramStore from "@/lib/stores/program-store";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { useTransaction } from "@/hooks/use-transaction";
import {
  getAnchorAccountsFromInstruction,
  getAnchorNameForInstruction,
  getAnchorProgramName,
  instructionIsSelfCPI,
} from "@/components/anchor";
import { AddressWithCopy } from "@/components/ui/address-with-copy";
import { CollapsibleJson } from "@/components/ui/collapsible-json";
import { camelToTitleCase } from "@/utils";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  BorshEventCoder,
  BorshInstructionCoder,
  Instruction,
  Program,
} from "@coral-xyz/anchor";
import {
  IdlEvent,
  IdlField,
  IdlInstruction,
  IdlTypeDefTyStruct,
} from "@coral-xyz/anchor/dist/cjs/idl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

/**
 * Get a formatted relative time string using date-fns
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted relative time string
 */
function getRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
}

type PageProps = {
  params: Promise<{
    signature: string;
  }>;
};

/**
 * Component to display detailed Anchor instruction information
 */
function AnchorDetails({
  ix,
  anchorProgram,
}: {
  ix: TransactionInstruction;
  anchorProgram: Program;
}) {
  const { ixAccounts, decodedIxData, ixDef } = useMemo(() => {
    let ixAccounts:
      | {
          name: string;
          isMut: boolean;
          isSigner: boolean;
          pda?: object;
        }[]
      | null = null;
    let decodedIxData: Instruction | null = null;
    let ixDef: IdlInstruction | undefined;
    if (anchorProgram) {
      let coder: BorshInstructionCoder | BorshEventCoder;
      if (instructionIsSelfCPI(ix.data)) {
        coder = new BorshEventCoder(anchorProgram.idl);
        decodedIxData = coder.decode(ix.data.slice(8).toString("base64"));
        const ixEventDef = anchorProgram.idl.events?.find(
          (ixDef) => ixDef.name === decodedIxData?.name
        ) as IdlEvent;

        const ixEventFields = anchorProgram.idl.types?.find(
          (type: any) => type.name === ixEventDef.name
        );

        // Remap the event definition to an instruction definition by force casting to struct fields
        ixDef = {
          ...ixEventDef,
          accounts: [],
          args:
            ((ixEventFields?.type as IdlTypeDefTyStruct)
              .fields as IdlField[]) ?? [],
        };

        // Self-CPI instructions have 1 account called the eventAuthority
        // https://github.com/coral-xyz/anchor/blob/04985802587c693091f836e0083e4412148c0ca6/lang/attribute/event/src/lib.rs#L165
        ixAccounts = [{ isMut: false, isSigner: true, name: "eventAuthority" }];
      } else {
        coder = new BorshInstructionCoder(anchorProgram.idl);
        decodedIxData = coder.decode(ix.data);
        if (decodedIxData) {
          ixDef = anchorProgram.idl.instructions.find(
            (ixDef) => ixDef.name === decodedIxData?.name
          );
          if (ixDef) {
            ixAccounts = getAnchorAccountsFromInstruction(
              decodedIxData,
              anchorProgram
            );
          }
        }
      }
    }

    return {
      decodedIxData,
      ixAccounts,
      ixDef,
    };
  }, [anchorProgram, ix.data]);

  if (!ixAccounts || !decodedIxData || !ixDef) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Failed to decode account data according to the public Anchor interface
      </div>
    );
  }

  const programName = getAnchorProgramName(anchorProgram) ?? "Unknown Program";

  return (
    <div className="divide-y divide-border">
      {/* Program Section */}
      <div className="py-3.5 w-full">
        <div className="text-xs uppercase text-muted-foreground mb-2 px-0">
          Program
        </div>
        <div className="grid grid-cols-3 items-center py-2">
          <span className="font-medium text-sm col-span-2 px-5">
            {programName}
          </span>
          <div className="text-sm text-right px-5">
            <AddressWithCopy
              address={ix.programId.toString()}
              className="justify-end"
            />
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="px-0 py-3.5 w-full mb-8">
        <div className="text-xs uppercase text-muted-foreground mb-2">
          Accounts
        </div>
        <Table className="w-full border-0 rounded-none shadow-none">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left px-5 py-3 text-sm font-medium">
                Name
              </TableHead>
              <TableHead className="text-left px-5 py-3 text-sm text-muted-foreground font-normal">
                Type
              </TableHead>
              <TableHead className="text-right px-5 py-3 text-sm font-medium">
                Address
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ix.keys.map(({ pubkey, isSigner, isWritable }, keyIndex) => {
              const accountName = ixAccounts
                ? keyIndex < ixAccounts.length
                  ? camelToTitleCase(ixAccounts[keyIndex].name)
                  : `Remaining Account #${keyIndex + 1 - ixAccounts.length}`
                : `Account #${keyIndex + 1}`;
              return (
                <TableRow
                  key={keyIndex}
                  className="odd:bg-muted/10 hover:bg-muted/20 transition-colors h-14"
                >
                  <TableCell className="text-sm font-medium align-middle px-5 py-4 text-left">
                    {accountName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground align-middle px-5 py-4 text-left space-x-2">
                    {isWritable && (
                      <Badge
                        variant="writable"
                        className="text-xs px-1.5 py-0.5 h-5"
                      >
                        Writable
                      </Badge>
                    )}
                    {isSigner && (
                      <Badge
                        variant="signer"
                        className="text-xs px-1.5 py-0.5 h-5"
                      >
                        Signer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm align-middle px-5 py-4 text-right">
                    <AddressWithCopy
                      address={pubkey.toString()}
                      className="justify-end"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Arguments Section */}
      {decodedIxData && ixDef && ixDef.args.length > 0 && (
        <div className="px-0 py-3.5 w-full mt-6 mb-0">
          <div className="text-xs uppercase text-muted-foreground mb-2">
            Arguments
          </div>
          <Table className="w-full border-0 rounded-none shadow-none">
            <TableHeader>
              <TableRow>
                <TableHead className="text-left px-5 py-3 text-sm font-medium">
                  Name
                </TableHead>
                <TableHead className="text-left px-5 py-3 text-sm text-muted-foreground font-normal">
                  Type
                </TableHead>
                <TableHead className="text-right px-5 py-3 text-sm font-medium">
                  Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ixDef.args.map((arg, index) => {
                const value =
                  decodedIxData?.data && typeof decodedIxData.data === "object"
                    ? (decodedIxData.data as Record<string, any>)[arg.name]
                    : undefined;
                return (
                  <TableRow
                    key={index}
                    className="odd:bg-muted/10 hover:bg-muted/20 transition-colors h-14"
                  >
                    <TableCell className="text-sm font-medium align-middle px-5 py-4 text-left">
                      {camelToTitleCase(arg.name)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground align-middle px-5 py-4 text-left">
                      {typeof arg.type === "string"
                        ? arg.type
                        : JSON.stringify(arg.type)}
                    </TableCell>
                    <TableCell className="text-sm align-middle px-5 py-4 text-right">
                      {typeof value === "object" && value !== null ? (
                        <CollapsibleJson
                          data={value}
                          title={camelToTitleCase(arg.name)}
                          defaultOpen={false}
                          className="text-right !p-0 !bg-transparent !border-0 !shadow-none"
                        />
                      ) : (
                        <span className="text-sm">{String(value ?? "")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ProgramLogs component
function ProgramLogs({
  logs,
  programName,
  status,
}: {
  logs?: string[];
  programName?: string;
  status?: "success" | "error" | null;
}) {
  if (!logs || logs.length === 0) return null;
  return (
    <div className="mt-6 border rounded-lg bg-card/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/10">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">
            {programName || "Program"} Instruction Logs
          </span>
        </div>
      </div>
      <div className="px-6 py-4 bg-black/60">
        <pre className="text-xs md:text-sm font-mono text-left text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {logs.map((log, i) => (
            <div
              key={i}
              className={cn(
                "mb-1",
                log.includes("success")
                  ? "text-green-400"
                  : log.includes("error")
                  ? "text-red-400"
                  : ""
              )}
            >
              {log}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

/**
 * Main transaction details component
 */
function TransactionDetails() {
  const params = useParams();
  const signature = params?.signature as string;
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const program = useProgramStore((state) => state.program);
  const {
    data: transactionData,
    refetch,
    isLoading,
    error,
  } = useTransaction(signature);

  // Show warning if program is not initialized
  const showProgramWarning = !program;

  const meta = transactionData?.raw?.meta;
  const logs = meta?.logMessages;
  const computeUnits = meta?.computeUnitsConsumed;
  const fee = meta?.fee;
  const transactionError = meta?.err;
  const instructions = transactionData?.raw?.transaction?.instructions;
  const filteredInstructions =
    instructions?.filter((ix) => {
      if (ix.programId.toString() === program?.programId.toString()) {
        return ix;
      }
    }) || [];
  console.log("filteredInstructions", filteredInstructions);
  console.log("instructions", instructions);
  console.log("program", program);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const openInExplorer = () => {
    window.open(`https://explorer.solana.com/tx/${signature}`, "_blank");
  };

  const renderTxStatus = () => {
    // Show 'Error' if there is an error, otherwise 'Success'
    return transactionData?.raw.meta?.err ? (
      <Badge variant="destructive">Error</Badge>
    ) : (
      <Badge variant="success">Success</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="border-0 shadow-sm overflow-hidden mb-6">
          <CardHeader className="bg-card/95 backdrop-blur-sm border-b py-3">
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-card/95 backdrop-blur-sm border-b py-3">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !transactionData) {
    return (
      <div className="container max-w-5xl mx-auto py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-card/95 backdrop-blur-sm border-b py-3">
            <CardTitle>Transaction Not Found</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load transaction"}
            </p>
            <Button onClick={handleRefresh} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-4">
      {showProgramWarning && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-500/40 bg-yellow-400/10 px-5 py-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-200 font-medium text-base">
            Program object did not get initialized.{" "}
            <span className="font-normal">Please connect your wallet.</span>
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
          >
            <RefreshCw
              className={cn("mr-2 h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" onClick={openInExplorer} size="sm">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            View in Explorer
          </Button>
        </div>
      </div>

      {/* Transaction Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Transaction Overview</CardTitle>
            {renderTxStatus()}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Signature
              </h4>
              <AddressWithCopy address={signature} />
            </div>

            {program && filteredInstructions && filteredInstructions[0] && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Program
                </h4>
                <AddressWithCopy
                  address={filteredInstructions[0].programId.toString() || ""}
                  label={getAnchorProgramName(program) || "Unknown Program"}
                />
              </div>
            )}

            {transactionData.raw.slot && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Slot
                </h4>
                <p className="font-mono text-sm">{transactionData.raw.slot}</p>
              </div>
            )}

            {transactionData.raw.blockTime && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Time
                </h4>
                <div className="flex flex-col">
                  <span className="font-mono text-sm">
                    {new Date(
                      transactionData.raw.blockTime * 1000
                    ).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getRelativeTime(transactionData.raw.blockTime)}
                  </span>
                </div>
              </div>
            )}

            {typeof computeUnits === "number" && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Compute Units
                </h4>
                <span className="font-mono text-sm">
                  {computeUnits.toLocaleString()}
                </span>
              </div>
            )}
            {typeof fee === "number" && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Fee (lamports)
                </h4>
                <span className="font-mono text-sm">
                  {fee.toLocaleString()}
                </span>
              </div>
            )}
            {transactionError && (
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-destructive mb-1">
                  Transaction Error
                </h4>
                <span className="font-mono text-sm text-destructive">
                  {JSON.stringify(transactionError)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instruction Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Instruction Details</CardTitle>
              {/* <CardDescription className="text-xs">
                {anchorName
                  ? `${camelToTitleCase(anchorName)} instruction parameters`
                  : "Instruction parameters"}
              </CardDescription> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {instructions && program ? (
            <AnchorDetails
              ix={filteredInstructions[0]}
              anchorProgram={program}
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p>No instruction data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Program Logs */}
      <ProgramLogs
        logs={logs ?? undefined}
        programName={getAnchorProgramName(program)}
        status={!transactionError ? "success" : "error"}
      />

      {/* Raw Transaction Data */}
      <CollapsibleJson
        title="Raw Transaction Data"
        description="Complete JSON representation of transaction data"
        data={transactionData?.raw || {}}
        className="border-0 shadow-sm"
      />
    </div>
  );
}

/**
 * Page component that serves as the entry point
 */
export default function Page({ params }: PageProps) {
  return <TransactionDetails />;
}
