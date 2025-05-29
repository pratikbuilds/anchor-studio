"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import useProgramStore from "@/lib/stores/program-store";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransaction } from "@/hooks/use-transaction";
import {
  AddressDisplay,
  getAnchorAccountsFromInstruction,
  getAnchorNameForInstruction,
  getAnchorProgramName,
  instructionIsSelfCPI,
  mapIxArgsToRows,
} from "@/components/anchor";
import { camelToTitleCase } from "@/utils";
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

type TransactionDetailsProps = {
  signature: string;
};

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
      <tr>
        <td colSpan={3} className="text-lg-center">
          Failed to decode account data according to the public Anchor interface
        </td>
      </tr>
    );
  }

  const programName = getAnchorProgramName(anchorProgram) ?? "Unknown Program";

  return (
    <>
      <tr>
        <td>Program</td>
        <td className="text-lg-end" colSpan={2}>
          <AddressDisplay pubkey={ix.programId} />
        </td>
      </tr>
      <tr className="table-sep">
        <td>Account Name</td>
        <td className="text-lg-end" colSpan={2}>
          Address
        </td>
      </tr>
      {ix.keys.map(({ pubkey, isSigner, isWritable }, keyIndex) => {
        return (
          <tr key={keyIndex}>
            <td>
              <div className="me-2 d-md-inline">
                {ixAccounts
                  ? keyIndex < ixAccounts.length
                    ? `${camelToTitleCase(ixAccounts[keyIndex].name)}`
                    : `Remaining Account #${keyIndex + 1 - ixAccounts.length}`
                  : `Account #${keyIndex + 1}`}
              </div>
              {isWritable && (
                <span className="badge bg-danger-soft me-1">Writable</span>
              )}
              {isSigner && (
                <span className="badge bg-info-soft me-1">Signer</span>
              )}
            </td>
            <td className="text-lg-end" colSpan={2}>
              <AddressDisplay pubkey={pubkey} />
            </td>
          </tr>
        );
      })}

      {decodedIxData && ixDef && ixDef.args.length > 0 && (
        <>
          <tr className="table-sep">
            <td>Argument Name</td>
            <td>Type</td>
            <td className="text-lg-end">Value</td>
          </tr>
          {mapIxArgsToRows(decodedIxData.data, ixDef, anchorProgram.idl)}
        </>
      )}
    </>
  );
}

function TransactionDetails({ signature }: TransactionDetailsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const program = useProgramStore((state) => state.program);
  const { data: transaction, isLoading, error } = useTransaction(signature);
  console.log("transaction", transaction);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const instructions = transaction?.raw.transaction.instructions;
  console.log("instructions", instructions);
  const anchorName =
    instructions && program
      ? getAnchorNameForInstruction(instructions[0], program)
      : null;

  console.log("anchorName", anchorName);
  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to transactions
        </Button>
        <div className="space-y-6">
          <Skeleton className="h-10 w-96" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to transactions
        </Button>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Transaction not found
          </h2>
          <p className="text-muted-foreground mb-4">
            The transaction with signature {signature} could not be found or an
            error occurred.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Go back to transactions
          </Button>
        </div>
      </div>
    );
  }

  // const isSuccessful = !transaction.meta?.err;
  // const blockTime = transaction.raw.message.blockTime
  //   ? new Date(transaction.raw.message.blockTime * 1000)
  //   : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to transactions
      </Button>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
              <CardDescription>
                Detailed information about this transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4"></CardContent>
          </Card>
          {instructions && program && (
            <AnchorDetails ix={instructions[0]} anchorProgram={program} />
          )}
        </TabsContent>
        <TabsContent value="raw" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Transaction Data</CardTitle>
              <CardDescription>
                JSON representation of the transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md overflow-hidden"></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TransactionPage() {
  const { signature } = useParams<{ signature: string }>();

  if (!signature) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Invalid Transaction
          </h2>
          <p className="text-muted-foreground mb-4">
            No transaction signature provided.
          </p>
        </div>
      </div>
    );
  }

  return <TransactionDetails signature={signature} />;
}
