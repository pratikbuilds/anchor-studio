"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, RocketIcon, BookOpenIcon, GithubIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  onCreateProgram: () => void;
}

export function EmptyState({ onCreateProgram }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <RocketIcon className="h-10 w-10 text-primary" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight mb-3">Welcome to Anchor Studio</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Your all-in-one interface for interacting with Solana programs built with Anchor.
        Get started by creating your first program.
      </p>
      
      <Button 
        size="lg" 
        onClick={onCreateProgram}
        className="mb-12 px-8"
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Create Your First Program
      </Button>
      
      <div className="grid gap-4 md:grid-cols-2 max-w-2xl w-full">
        <Link 
          href="https://www.anchor-lang.com/" 
          target="_blank"
          className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <BookOpenIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium">Anchor Documentation</h3>
            <p className="text-sm text-muted-foreground">
              Learn more about Anchor framework
            </p>
          </div>
        </Link>
        
        <Link 
          href="https://github.com/coral-xyz/anchor" 
          target="_blank"
          className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <GithubIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium">GitHub Repository</h3>
            <p className="text-sm text-muted-foreground">
              View the source code and contribute
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
