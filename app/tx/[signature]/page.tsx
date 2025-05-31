"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
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

/**
 * Get a formatted relative time string using date-fns
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted relative time string
 */
function getRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
}

type PageProps = {
  params: {
    signature: string;
  };
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
      <div className="px-4 py-3.5">
        <div className="text-xs uppercase text-muted-foreground mb-2">
          Program
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="font-medium text-sm">{programName}</span>
          <AddressWithCopy address={ix.programId.toString()} />
        </div>
      </div>

      {/* Accounts Section */}
      <div className="px-4 py-3.5">
        <div className="text-xs uppercase text-muted-foreground mb-2">
          Accounts
        </div>
        <div className="divide-y divide-border">
          {ix.keys.map(({ pubkey, isSigner, isWritable }, keyIndex) => {
            const accountName = ixAccounts
              ? keyIndex < ixAccounts.length
                ? camelToTitleCase(ixAccounts[keyIndex].name)
                : `Remaining Account #${keyIndex + 1 - ixAccounts.length}`
              : `Account #${keyIndex + 1}`;

            return (
              <div
                key={keyIndex}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <div className="font-medium text-sm">{accountName}</div>
                  <div className="flex gap-1.5 mt-1.5">
                    {isWritable && (
                      <Badge
                        variant="writable" // Use new 'writable' variant
                        className="text-xs px-1.5 py-0.5 h-5"
                      >
                        Writable
                      </Badge>
                    )}
                    {isSigner && (
                      <Badge
                        variant="signer" // Use new 'signer' variant
                        className="text-xs px-1.5 py-0.5 h-5"
                      >
                        Signer
                      </Badge>
                    )}
                  </div>
                </div>
                <AddressWithCopy address={pubkey.toString()} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Arguments Section */}
      {decodedIxData && ixDef && ixDef.args.length > 0 && (
        <div className="px-4 py-3.5">
          <div className="text-xs uppercase text-muted-foreground mb-2">
            Arguments
          </div>
          <div className="divide-y divide-border">
            {ixDef.args.map((arg, index) => {
              const value =
                decodedIxData?.data && typeof decodedIxData.data === "object"
                  ? (decodedIxData.data as Record<string, any>)[arg.name]
                  : undefined;

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-start justify-between py-2"
                >
                  <div className="mb-1 sm:mb-0 mr-4">
                    <div className="font-medium text-sm">
                      {camelToTitleCase(arg.name)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {typeof arg.type === "string"
                        ? arg.type
                        : JSON.stringify(arg.type)}
                    </div>
                  </div>
                  <div className="font-mono text-sm break-all text-right sm:ml-auto flex-shrink min-w-0">
                    {typeof value === "object" ? (
                      <CollapsibleJson
                        data={value}
                        title={camelToTitleCase(arg.name)}
                        defaultOpen={false}
                        className="text-left !p-0 !bg-transparent !border-0 !shadow-none"
                      />
                    ) : (
                      String(value ?? "")
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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

  // Extract transaction details
  const instructions = transactionData?.raw?.transaction?.instructions;
  const anchorName =
    instructions && program
      ? getAnchorNameForInstruction(instructions[0], program)
      : undefined;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const openInExplorer = () => {
    window.open(`https://explorer.solana.com/tx/${signature}`, "_blank");
  };

  const renderTxStatus = () => {
    // Simplified logic: if we have transaction data, consider it successful
    return transactionData ? (
      <Badge variant="success">Success</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
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
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="bg-card/95 backdrop-blur-sm border-b py-3">
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

            {program && instructions && instructions[0] && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Program
                </h4>
                <AddressWithCopy
                  address={instructions[0].programId.toString() || ""}
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
          </div>
        </CardContent>
      </Card>

      {/* Instruction Details */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="bg-card/95 backdrop-blur-sm border-b py-3">
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
            <AnchorDetails ix={instructions[0]} anchorProgram={program} />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p>No instruction data available</p>
            </div>
          )}
        </CardContent>
      </Card>

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
