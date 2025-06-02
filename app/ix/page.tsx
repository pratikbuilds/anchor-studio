"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@jup-ag/wallet-adapter";
import { useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  Loader2,
  Code,
  Terminal,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import useProgramStore from "@/lib/stores/program-store";
import NoProgramFound from "@/components/no-program";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";
import { TypeInput } from "@/components/type-input";
import {
  IdlInstruction,
  IdlInstructionAccount,
  IdlType,
} from "@coral-xyz/anchor/dist/cjs/idl";

export default function InstructionBuilderPage() {
  const { program, programDetails } = useProgramStore();
  const { publicKey, sendTransaction } = useWallet();

  const [selectedIx, setSelectedIx] = useState<string>("");
  const [args, setArgs] = useState<Record<string, any>>({});
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ signature: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get instructions from the program IDL
  const instructions = program?.idl?.instructions;
  // Format instruction names for better display
  const formattedInstructions = useMemo(() => {
    return instructions
      ? instructions.map((ix) => ({
          ...ix,
          displayName:
            ix.name.charAt(0).toUpperCase() +
            ix.name.slice(1).replace(/_/g, " "),
        }))
      : [];
  }, [instructions]);

  const instruction = useMemo(() => {
    return instructions?.find((ix) => ix.name === selectedIx);
  }, [instructions, selectedIx]);

  const initialSelectedIx = useMemo(() => {
    return formattedInstructions.length > 0
      ? formattedInstructions[0].name
      : "";
  }, [formattedInstructions]);

  useEffect(() => {
    if (initialSelectedIx && !selectedIx) {
      setSelectedIx(initialSelectedIx);
    }
  }, [initialSelectedIx, selectedIx]);

  // Fetch resolved pubkeys using method builder
  const fetchResolvedPubkeys = useCallback(async () => {
    if (!program || !instruction || !publicKey) return;

    try {
      // Create method builder with current args
      const methodBuilder = program.methods[instruction.name](
        ...Object.values(args)
      );

      // Get resolved pubkeys
      const resolvedPubkeys = await methodBuilder.pubkeys();

      // Update accounts with resolved pubkeys
      const updates: Record<string, string> = {};

      for (const [accountName, pubkey] of Object.entries(resolvedPubkeys)) {
        if (pubkey) {
          updates[accountName] = pubkey.toString();
        }
      }

      // Auto-populate signer accounts
      const commonSigners = instruction.accounts.filter(
        (acc) =>
          "signer" in acc &&
          acc.signer === true &&
          ["authority", "payer", "signer"].some((name) =>
            acc.name.toLowerCase().includes(name.toLowerCase())
          )
      ) as IdlInstructionAccount[];

      for (const account of commonSigners) {
        updates[account.name] = publicKey.toString();
      }

      // Update accounts state if we have any resolved pubkeys
      if (Object.keys(updates).length > 0) {
        setAccounts((prev) => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.warn("Failed to resolve pubkeys:", error);
    }
  }, [program, instruction, args, publicKey]);

  // Auto-populate accounts when instruction or args change
  useEffect(() => {
    if (instruction && Object.keys(args).length > 0) {
      fetchResolvedPubkeys();
    }
  }, [instruction, args, fetchResolvedPubkeys]);

  // Reset form when instruction changes
  useEffect(() => {
    if (instruction) {
      // Initialize args with default values
      const initialArgs: Record<string, any> = {};
      instruction.args.forEach((arg) => {
        initialArgs[arg.name] = "";
      });
      setArgs(initialArgs);

      // Initialize accounts with empty values
      const initialAccounts: Record<string, string> = {};
      instruction.accounts.forEach((acc) => {
        initialAccounts[acc.name] = "";
      });
      setAccounts(initialAccounts);
    }
  }, [selectedIx]);

  const handleArgChange = (name: string, value: any) => {
    const newArgs = {
      ...args,
      [name]: value,
    };
    setArgs(newArgs);
  };

  const handleAccountChange = (name: string, value: string) => {
    setAccounts((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!program || !instruction || !publicKey) {
      setError("Program, instruction, or wallet not available");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Prepare arguments
      const processedArgs = instruction.args.map((arg) => args[arg.name]);

      // 2. Create method builder with args
      const methodBuilder = program.methods[instruction.name](...processedArgs);

      // 3. Resolve accounts
      const accountsObject: Record<string, PublicKey> = {};
      const unresolvedAccounts: string[] = [];

      // If we have unresolved required accounts, show an error
      if (unresolvedAccounts.length > 0) {
        throw new Error(
          `The following required accounts could not be resolved automatically: ${unresolvedAccounts.join(
            ", "
          )}. Please provide them manually.`
        );
      }

      // 4. Add any remaining accounts that were provided manually
      for (const [name, value] of Object.entries(accounts)) {
        if (value && !accountsObject[name]) {
          try {
            accountsObject[name] = new PublicKey(value);
          } catch (err) {
            console.warn(`Invalid public key for account ${name}:`, err);
          }
        }
      }

      // 5. Send transaction with resolved accounts
      const txSignature = await methodBuilder.accounts(accountsObject).rpc();
      console.log("Transaction sent with signature:", txSignature);
      setResult({ signature: txSignature });
      toast.success("Transaction sent", {
        description: "Your transaction was successfully sent to the network.",
      });
    } catch (err: any) {
      console.error("Transaction failed:", err);
      setError(err.message || "An unknown error occurred");
      toast.error("Transaction failed", {
        description: err.message || "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!program || !programDetails) {
    return <NoProgramFound />;
  }

  if (!instructions || instructions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          No instructions found in the program IDL.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Instruction Builder
        </h1>
        <p className="text-muted-foreground mt-2">
          Execute instructions from the {programDetails?.name || "selected"}{" "}
          program
        </p>
      </div>

      {formattedInstructions.length > 0 ? (
        <Tabs
          value={selectedIx}
          onValueChange={setSelectedIx}
          defaultValue={initialSelectedIx}
          className="w-full"
        >
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-auto p-1">
              {formattedInstructions.map((ix) => (
                <TabsTrigger
                  key={ix.name}
                  value={ix.name}
                  className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2"
                >
                  {ix.displayName}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Render content for the selected instruction */}
          {instruction && (
            <TabsContent
              value={instruction.name}
              className="mt-4 flex flex-col flex-1 overflow-hidden"
            >
              <Card className="w-full flex flex-col flex-1 overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        {instruction.name.charAt(0).toUpperCase() +
                          instruction.name.slice(1).replace(/_/g, " ")}
                      </CardTitle>
                      {instruction.docs && instruction.docs[0] && (
                        <CardDescription className="mt-1.5">
                          {instruction.docs[0]}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {instruction.args.length} Args •{" "}
                      {instruction.accounts.length} Accounts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto px-6 pt-6 pb-20 space-y-6 min-h-0">
                  {/* Arguments Section */}
                  {instruction.args.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <Code className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-lg font-medium">Arguments</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {instruction.args.map((arg) => (
                          <div
                            key={arg.name}
                            className="space-y-2 bg-muted/40 p-4 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <Label
                                htmlFor={`arg-${arg.name}`}
                                className="font-medium"
                              >
                                {arg.name}
                              </Label>
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                {typeof arg.type === "string"
                                  ? arg.type
                                  : JSON.stringify(arg.type)}
                              </Badge>
                            </div>
                            <TypeInput
                              type={arg.type}
                              value={args[arg.name]}
                              onChange={(value) =>
                                handleArgChange(arg.name, value)
                              }
                              placeholder={`Enter ${arg.name}`}
                              className="mt-1.5"
                            />
                            {arg.docs && arg.docs[0] && (
                              <p className="text-xs text-muted-foreground mt-1.5">
                                {arg.docs[0]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {instruction.args.length > 0 &&
                    instruction.accounts.length > 0 && (
                      <Separator className="my-6" />
                    )}

                  {/* Accounts Section */}
                  {instruction.accounts.length > 0 && (
                    <div>
                      <div className="flex items-center mb-4">
                        <Terminal className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="text-lg font-medium">Accounts</h3>
                      </div>
                      <div className="space-y-4">
                        {instruction.accounts.map((account) => (
                          <div
                            key={account.name}
                            className="bg-muted/40 p-4 rounded-lg space-y-2"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <Label
                                htmlFor={`account-${account.name}`}
                                className="font-medium"
                              >
                                {account.name}
                              </Label>
                              <div className="flex gap-1.5">
                                {"signer" in account && account.signer && (
                                  <Badge
                                    variant="secondary"
                                    className="font-normal text-xs"
                                  >
                                    Signer
                                  </Badge>
                                )}
                                {"writable" in account && account.writable && (
                                  <Badge
                                    variant="default"
                                    className="font-normal text-xs"
                                  >
                                    Mutable
                                  </Badge>
                                )}
                                {"optional" in account && account.optional && (
                                  <Badge
                                    variant="outline"
                                    className="font-normal text-xs"
                                  >
                                    Optional
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Input
                                id={`account-${account.name}`}
                                value={accounts[account.name] || ""}
                                onChange={(e) =>
                                  handleAccountChange(
                                    account.name,
                                    e.target.value
                                  )
                                }
                                placeholder={`Enter ${account.name} public key`}
                                className="font-mono text-sm flex-1"
                              />
                              {publicKey &&
                                ["authority", "payer", "signer"].some((term) =>
                                  account.name
                                    .toLowerCase()
                                    .includes(term.toLowerCase())
                                ) && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      handleAccountChange(
                                        account.name,
                                        publicKey.toString()
                                      )
                                    }
                                    title="Use connected wallet"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                            {"docs" in account &&
                              account.docs &&
                              account.docs[0] && (
                                <p className="text-xs text-muted-foreground">
                                  {account.docs[0]}
                                </p>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="sticky bottom-0 z-10 bg-card py-4 px-6 border-t flex items-center justify-center flex-shrink-0">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !publicKey}
                    className="w-auto"
                    size="sm" // Ensuring this is explicitly set
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Transaction...
                      </>
                    ) : !publicKey ? (
                      "Connect Wallet to Execute"
                    ) : (
                      `Execute ${instruction.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}

          {/* Fallback if no instruction is selected but tabs are present (e.g. initial state before useEffect sets selectedIx) */}
          {!instruction && formattedInstructions.length > 0 && (
            <Card className="mt-4 flex items-center justify-center h-[200px]">
              <CardContent>
                <p className="text-muted-foreground">
                  Select an instruction to view details.
                </p>
              </CardContent>
            </Card>
          )}
        </Tabs>
      ) : (
        // This case is already handled by the NoProgramFound or no instructions found messages earlier
        // but as a safeguard for the Tabs component not having items:
        <Card className="flex items-center justify-center h-[200px]">
          <CardContent>
            <p className="text-muted-foreground">
              No instructions available to display in tabs.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transaction Result Card - Placed outside Tabs, but related to the overall page state */}
      {result && (
        <Card className="border-green-500/20 bg-green-500/5 mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-green-600 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Transaction Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Signature:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1"
                    asChild
                  >
                    <a
                      href={`https://explorer.solana.com/tx/${
                        result?.signature
                      }?cluster=${
                        program?.provider?.connection?.rpcEndpoint?.includes(
                          "devnet"
                        )
                          ? "devnet"
                          : "mainnet"
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="text-xs">View in Explorer</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="p-3 bg-background rounded-md overflow-x-auto flex items-center gap-2 border">
                  <code className="text-xs break-all flex-1">
                    {result?.signature}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      if (result?.signature) {
                        navigator.clipboard.writeText(result.signature);
                        toast.success("Signature copied to clipboard");
                      }
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Card */}
      {error && (
        <Card className="border-destructive mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-destructive flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-destructive" />
              Transaction Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
