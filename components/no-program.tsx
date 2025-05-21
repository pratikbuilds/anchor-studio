"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NoProgramFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center p-6">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-6" />
      <h2 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Program Not Loaded or No Accounts Found
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400 max-w-md">
        The program IDL might not be initialized, or it may not contain any
        account definitions. Please initialize a program from the main page and
        ensure its IDL is correctly parsed.
      </p>
      <Link href="/">
        <Button>Go to Main Page</Button>
      </Link>
    </div>
  );
}
