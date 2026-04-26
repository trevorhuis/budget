
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "~/lib/schemas";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { SortableHeader } from "~/components/ui/SortableHeader";
import { EmptyState } from "~/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Text } from "~/components/ui/text";

export type TransactionTableRow = {
  id: Transaction["id"];
  merchant: string;
  notes: string;
  type: Transaction["type"];
  amount: number;
  signedAmount: number;
  date: Date;
  accountName: string;
  accountTypeLabel: string;
  categoryName: string;
  groupName: string;
  budgetLabel: string;
};

const columnHelper = createColumnHelper<TransactionTableRow>();

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const getTypeBadgeColor = (type: Transaction["type"]) => {
  return type === "debit" ? "sky" : "emerald";
};

const columns = [
  columnHelper.accessor("date", {
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
    sortingFn: "datetime",
    cell: (info) => (
      <div className="space-y-0.5 leading-tight">
        <div className="font-medium text-zinc-950 dark:text-white">
          {dateFormatter.format(info.getValue())}
        </div>
        <p className="text-xs/5 text-zinc-500 dark:text-zinc-400">
          {info.row.original.budgetLabel}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("merchant", {
    header: ({ column }) => <SortableHeader column={column} label="Merchant" />,
    cell: (info) => (
      <div className="space-y-0.5 leading-tight">
        <div className="font-medium text-zinc-950 dark:text-white">
          {info.getValue()}
        </div>
        <p className="max-w-56 truncate text-xs/5 text-zinc-500 dark:text-zinc-400">
          {info.row.original.notes || "No notes"}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("categoryName", {
    header: ({ column }) => (
      <SortableHeader column={column} label="Budget line" />
    ),
    cell: (info) => (
      <div className="space-y-0.5 leading-tight">
        <div className="font-medium text-zinc-950 dark:text-white">
          {info.getValue()}
        </div>
        <p className="text-xs/5 text-zinc-500 dark:text-zinc-400">
          {info.row.original.groupName}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("accountName", {
    header: ({ column }) => <SortableHeader column={column} label="Account" />,
    cell: (info) => (
      <div className="space-y-0.5 leading-tight">
        <div className="font-medium text-zinc-950 dark:text-white">
          {info.getValue()}
        </div>
        <p className="text-xs/5 text-zinc-500 dark:text-zinc-400">
          {info.row.original.accountTypeLabel}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("type", {
    header: ({ column }) => <SortableHeader column={column} label="Type" />,
    cell: (info) => (
      <Badge color={getTypeBadgeColor(info.getValue())}>
        {info.getValue() === "debit" ? "Debit" : "Credit"}
      </Badge>
    ),
  }),
  columnHelper.accessor("amount", {
    header: ({ column }) => <SortableHeader column={column} label="Amount" />,
    cell: (info) => (
      <span className="font-medium text-zinc-950 dark:text-white">
        {formatCurrency(info.getValue())}
      </span>
    ),
  }),
];

export function TransactionTable({ rows }: { rows: TransactionTableRow[] }) {
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Transaction["type"]>(
    "all",
  );
  const [accountFilter, setAccountFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "date",
      desc: true,
    },
  ]);

  const accountOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.accountName))).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        query.length === 0 ||
        [
          row.merchant,
          row.notes,
          row.categoryName,
          row.groupName,
          row.accountName,
          row.budgetLabel,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType = typeFilter === "all" || row.type === typeFilter;
      const matchesAccount =
        accountFilter === "all" || row.accountName === accountFilter;

      return matchesQuery && matchesType && matchesAccount;
    });
  }, [accountFilter, rows, searchValue, typeFilter]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 12,
      },
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [accountFilter, searchValue, table, typeFilter]);

  const visibleRows = table.getRowModel().rows;

  return (
    <div className="min-w-0 max-w-full space-y-4">
      <div className="flex w-full min-w-0 flex-col gap-2.5 border-b border-zinc-950/6 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/8">
        <div className="grid min-w-0 w-full gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,11rem)_minmax(8rem,12rem)]">
          <label className="relative block">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search merchant, category, notes"
              className="pl-9"
            />
          </label>

          <Select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "all" | Transaction["type"])
            }
            aria-label="Filter transactions by type"
          >
            <option value="all">All types</option>
            <option value="debit">Debits</option>
            <option value="credit">Credits</option>
          </Select>

          <Select
            value={accountFilter}
            onChange={(event) => setAccountFilter(event.target.value)}
            aria-label="Filter transactions by account"
          >
            <option value="all">All accounts</option>
            {accountOptions.map((accountName) => (
              <option key={accountName} value={accountName}>
                {accountName}
              </option>
            ))}
          </Select>
        </div>

        <Text>
          {filteredRows.length} of {rows.length} transactions visible
        </Text>
      </div>

      {rows.length === 0 ? (
        <EmptyState>
          No transactions yet. Add the first one to start feeding actual spend
          into the budget.
        </EmptyState>
      ) : filteredRows.length === 0 ? (
        <EmptyState>
          No transactions match the current filters. Clear the search or
          switch filters to see more activity.
        </EmptyState>
      ) : (
        <>
          <Table
            dense
            striped
            className="rounded-2xl [&_tbody_td]:py-2 [&_tbody_td]:align-top [&_thead_th]:py-1.5"
          >
            <TableHead>
              <TableRow>
                {table.getFlatHeaders().map((header) => (
                  <TableHeader key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-2.5 border-t border-zinc-950/6 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/8">
            <Text>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </Text>
            <div className="flex items-center gap-2">
              <Button
                plain
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon data-slot="icon" />
                Previous
              </Button>
              <Button
                plain
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRightIcon data-slot="icon" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
