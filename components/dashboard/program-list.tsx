"use client";

import useProgramStore from "@/lib/stores/program-store";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProgramListProps {
  onCreateProgram: () => void;
}

export function ProgramList({ onCreateProgram }: ProgramListProps) {
  const programDetails = useProgramStore((state) => state.programDetails);
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (!programDetails) {
    return <EmptyState onCreateProgram={onCreateProgram} />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Program</h1>
          <p className="text-muted-foreground mt-1">
            Manage and interact with your Anchor program
          </p>
        </div>
        <Button onClick={onCreateProgram}>Reinitialize Program</Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            {programDetails.name}
          </h3>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            {programDetails.cluster}
          </div>
        </div>
        <div className="p-6 pt-0 grid gap-2">
          <div className="text-sm text-muted-foreground">
            Initialized{" "}
            {new Date(programDetails.initializedAt).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            Program ID: {programDetails.programId}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            RPC: {programDetails.rpcUrl}
          </div>
        </div>
        <div className="flex items-center p-6 pt-0">
          <div className="flex justify-between w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleNavigate("/accounts")}
            >
              Accounts
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleNavigate("/instructions")}
            >
              Instructions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
