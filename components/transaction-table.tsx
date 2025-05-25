"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export interface TxItem {
  signature: string;
  slot: number;
  blockTime?: number | null;
  status: string;
}

interface TransactionTableProps {
  data: TxItem[];
  filter: string;
}

export function TransactionTable({ data, filter }: TransactionTableProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columns = useMemo<ColumnDef<TxItem>[]>(
    () => [
      {
        id: "signature",
        header: "Signature",
        accessorKey: "signature",
        cell: ({ row }) => {
          const sig = row.getValue("signature") as string;
          return (
            <Link
              href={`/tx/${sig}`}
              className="flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            >
              <span className="font-mono truncate max-w-[220px]">{sig}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          );
        },
      },
      {
        id: "slot",
        header: "Slot",
        accessorKey: "slot",
      },
      {
        id: "blockTime",
        header: "Time",
        accessorKey: "blockTime",
        cell: ({ row }) => {
          const blockTime = row.getValue("blockTime") as number | undefined | null;
          if (!blockTime) return "-";
          if (!isMounted) {
            // Render a non-locale-specific string or placeholder during SSR/hydration
            return new Date(blockTime * 1000).toUTCString(); // Example: UTC string
          }
          // Render locale-specific time on the client after hydration
          return new Date(blockTime * 1000).toLocaleString();
        },
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          const color = value === "Success" ? "text-green-600" : "text-red-600";
          return <span className={`font-medium ${color}`}>{value}</span>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: filter },
    globalFilterFn: (row, columnId, filterValue) => {
      const v = row.getValue(columnId) as string | number | undefined;
      return String(v).toLowerCase().includes(filterValue.toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: () => {},
  });

  return (
    <div className="flex flex-col border rounded-lg bg-card shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-muted/10">
              {hg.headers.map((header) => (
                <TableHead key={header.id} className="uppercase text-xs px-4 py-2">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/30">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-4 py-2">
                  {flexRender(
                    cell.column.columnDef.cell ??
                      // @ts-ignore - tanstack type generics allow accessorFn
                      cell.column.columnDef.accessorFn ??
                      // @ts-ignore
                      cell.column.columnDef.accessorKey,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {table.getFilteredRowModel().rows.length === 0 && (
            <p className="text-center py-6 text-muted-foreground">No transactions found.</p>
          )}
        </TableBody>
      </Table>
      {/* Pagination placeholder for future implementation */}
      {/* <div className="flex justify-end p-4">Pagination here</div> */}
    </div>
  );
}
