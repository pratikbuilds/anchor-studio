"use client";

import { type ProgramDetails } from "@/lib/stores/program-store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ServerIcon, CodeIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

interface ProgramCardProps {
  program: ProgramDetails;
  onSelect: (programId: string) => void;
}

export function ProgramCard({ program, onSelect }: ProgramCardProps) {
  // Function to determine badge color based on cluster
  const getClusterBadgeColor = (cluster: string) => {
    switch (cluster) {
      case "mainnet-beta":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400";
      case "devnet":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
      case "localnet":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{program.name}</CardTitle>
          <Badge variant="outline" className={getClusterBadgeColor(program.cluster)}>
            {program.cluster}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 font-mono text-xs">
          {program.programId.slice(0, 12)}...{program.programId.slice(-8)}
          <CopyButton value={program.programId} variant="ghost" size="icon" className="h-5 w-5" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-2">
          Initialized {formatDistanceToNow(program.initializedAt, { addSuffix: true })}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          RPC: {program.rpcUrl}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2 pb-4">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => onSelect(program.id)}
        >
          <ExternalLinkIcon className="mr-2 h-4 w-4" />
          Open
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <ServerIcon className="mr-2 h-4 w-4" />
          Accounts
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <CodeIcon className="mr-2 h-4 w-4" />
          Instructions
        </Button>
      </CardFooter>
    </Card>
  );
}
