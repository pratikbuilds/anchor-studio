"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IdlField, IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";

// Copy button component
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={copyToClipboard}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      <span className="sr-only">Copy</span>
    </Button>
  );
};

// Types based on IDL structure
type AccountField = {
  name: string;
  type: string;
};

type AccountType = {
  name: string;
  type: {
    kind: string;
    fields: AccountField[];
  };
};

export type AccountData = {
  publicKey: string;
  account: Record<string, unknown>;
};

interface AccountTableProps {
  data: AccountData[];
  accountType?: IdlTypeDef;
}

export function AccountTable({ data, accountType }: AccountTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, // Default page size changed to 15
  });

  const columns = useMemo<ColumnDef<AccountData>[]>(() => {
    // Base columns that are always present
    const baseColumns: ColumnDef<AccountData>[] = [
      {
        id: "publicKey",
        header: "Public Key",
        accessorKey: "publicKey",
        cell: ({ row }) => {
          const value = row.getValue("publicKey") as string;
          return (
            <div className="flex items-center gap-2 group">
              <span className="font-mono text-sm max-w-[200px] truncate">
                {value}
              </span>
              <CopyButton text={value} />
            </div>
          );
        },
      },
    ];

    // Type guard for IdlField
    function isIdlField(field: unknown): field is IdlField {
      return (
        typeof field === "object" &&
        field !== null &&
        typeof (field as any).name === "string" &&
        "type" in (field as any)
      );
    }
    // Add dynamic columns based on the account type fields
    const accountFields: IdlField[] =
      accountType &&
      accountType.type &&
      accountType.type.kind === "struct" &&
      Array.isArray(accountType.type.fields)
        ? (accountType.type.fields as unknown[]).filter(isIdlField)
        : [];

    const dynamicColumns: ColumnDef<AccountData>[] = accountFields.map(
      (field) => {
        const fieldType = typeof field.type === "string" ? field.type : "";
        return {
          id: field.name,
          header: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          accessorFn: (row) => {
            const value = row.account[field.name];
            switch (fieldType) {
              case "pubkey":
                return value?.toString() || "";
              case "u64":
              case "u32":
              case "u16":
              case "u8":
                return value ? value.toString() : "0";
              case "bool":
                return value ? "Yes" : "No";
              default:
                return value;
            }
          },
          cell: ({ getValue }) => {
            const value = getValue();
            const displayValue =
              typeof value === "object" ? JSON.stringify(value) : String(value);

            return fieldType === "pubkey" ? (
              <div className="flex items-center gap-2 group">
                <span className="font-mono text-sm max-w-[200px] truncate">
                  {displayValue}
                </span>
                <CopyButton text={displayValue} />
              </div>
            ) : (
              <div className="max-w-[200px] group relative">
                <div className="truncate">{displayValue}</div>
              </div>
            );
          },
        };
      }
    );

    return [...baseColumns, ...dynamicColumns];
  }, [accountType]);

  // Custom filter function for global search
  const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
    const value = row.getValue(columnId);
    if (!filterValue) return true;
    const search = filterValue.toLowerCase();

    if (typeof value === "string" && value.toLowerCase().includes(search)) {
      return true;
    }
    if (typeof value === "number" && value.toString().includes(search)) {
      return true;
    }
    if (
      value !== null &&
      value !== undefined &&
      typeof value === "object" &&
      JSON.stringify(value).toLowerCase().includes(search)
    ) {
      return true;
    }
    return false;
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn,
    autoResetPageIndex: false,
  });

  if (!accountType) {
    return <div>No account type specified</div>;
  }

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
      {/* Search and table info header */}
      <div className="px-6 py-4 flex items-center justify-between border-b bg-muted/20">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${accountType?.name || "accounts"}...`}
            className="pl-9 h-9 w-full bg-background border-muted"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} accounts
        </div>
      </div>

      {/* Table */}
      <div className="w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b bg-muted/20 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-4 text-xs font-medium text-muted-foreground select-none"
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : "none"
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          "flex h-full cursor-pointer items-center gap-1 select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (
                            header.column.getCanSort() &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ChevronUpIcon
                              className="ml-1 h-3.5 w-3.5 shrink-0 text-foreground"
                              aria-hidden="true"
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              className="ml-1 h-3.5 w-3.5 shrink-0 text-foreground"
                              aria-hidden="true"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No accounts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
