import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
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
import type { BudgetItem } from "schemas";

import type {
  BulkBudgetItemOption,
  BulkTransactionDraftRow,
} from "../lib/bulk-transactions";
import {
  filterBudgetItemOptionsByTransactionDate,
  getBudgetItemOptionDateKey,
  getTransactionDateKey,
  isBulkTransactionReady,
} from "../lib/bulk-transactions";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Combobox,
  ComboboxDescription,
  ComboboxLabel,
  ComboboxOption,
} from "./ui/combobox";
import { Input, InputGroup } from "./ui/input";
import { Select } from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Text } from "./ui/text";

type BulkTransactionTableRow = BulkTransactionDraftRow & {
  accountLabel: string;
  issueMessages: string[];
  ready: boolean;
  statusTone: "ready" | "warning" | "blocked";
  statusLabel: string;
};

type BulkTransactionReviewTableProps = {
  rows: BulkTransactionDraftRow[];
  budgetItemOptions: BulkBudgetItemOption[];
  onRowSelectionChange: (rowId: string, selected: boolean) => void;
  onBulkSelectionChange: (rowIds: string[], selected: boolean) => void;
  onBudgetItemChange: (
    rowId: string,
    budgetItemId: BudgetItem["id"] | null,
  ) => void;
  onBatchBudgetItemApply: (
    rowIds: string[],
    budgetItemId: BudgetItem["id"],
  ) => void;
};

const columnHelper = createColumnHelper<BulkTransactionTableRow>();

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

const getIssueMessages = (row: BulkTransactionDraftRow) => {
  const issues = [...row.errors];

  if (!row.accountId) {
    issues.push("Missing account assignment from the import preview.");
  }

  if (!row.budgetItemId) {
    issues.push("Assign a budget line before uploading.");
  }

  return issues;
};

const getStatusMeta = (row: BulkTransactionDraftRow) => {
  const issueMessages = getIssueMessages(row);

  if (issueMessages.length > 0) {
    return {
      issueMessages,
      ready: false,
      statusTone: "blocked" as const,
      statusLabel: "Needs review",
    };
  }

  if (row.warnings.length > 0) {
    return {
      issueMessages,
      ready: true,
      statusTone: "warning" as const,
      statusLabel: "Warning",
    };
  }

  return {
    issueMessages,
    ready: true,
    statusTone: "ready" as const,
    statusLabel: row.dirty ? "Edited" : "Ready",
  };
};

function SortableHeader({
  column,
  label,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="inline-flex items-center gap-1.5 text-left"
    >
      <span>{label}</span>
      <ChevronUpDownIcon className="size-4 text-zinc-400" />
    </button>
  );
}

function BudgetItemPicker({
  budgetItemId,
  budgetItemOptions,
  onChange,
  placeholder,
  ariaLabel,
}: {
  budgetItemId: BudgetItem["id"] | null;
  budgetItemOptions: BulkBudgetItemOption[];
  onChange: (budgetItemId: BudgetItem["id"] | null) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  const value =
    budgetItemOptions.find((option) => option.id === budgetItemId) ?? null;

  return (
    <Combobox
      value={value}
      onChange={(option) => onChange(option?.id ?? null)}
      options={budgetItemOptions}
      displayValue={(option) => option?.label}
      filter={(option, query) => {
        if (!option) {
          return false;
        }

        return [
          option.categoryName,
          option.groupName,
          option.budgetLabel,
          option.label,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      }}
      placeholder={placeholder}
      aria-label={ariaLabel}
    >
      {(option) => (
        <ComboboxOption value={option}>
          <ComboboxLabel>{option.categoryName}</ComboboxLabel>
          <ComboboxDescription>
            {option.groupName} · {option.budgetLabel}
          </ComboboxDescription>
        </ComboboxOption>
      )}
    </Combobox>
  );
}

const getStatusBadgeColor = (tone: BulkTransactionTableRow["statusTone"]) => {
  switch (tone) {
    case "blocked":
      return "red";
    case "warning":
      return "amber";
    default:
      return "emerald";
  }
};

export function BulkTransactionReviewTable({
  rows,
  budgetItemOptions,
  onRowSelectionChange,
  onBulkSelectionChange,
  onBudgetItemChange,
  onBatchBudgetItemApply,
}: BulkTransactionReviewTableProps) {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "needsAttention" | "missingAssignment"
  >("all");
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "date",
      desc: true,
    },
  ]);
  const [batchBudgetItemId, setBatchBudgetItemId] = useState<
    BudgetItem["id"] | null
  >(null);

  const enrichedRows = useMemo<BulkTransactionTableRow[]>(
    () =>
      rows.map((row) => {
        const status = getStatusMeta(row);

        return {
          ...row,
          accountLabel: row.accountName ?? "Account unavailable",
          ...status,
        };
      }),
    [rows],
  );

  const summary = useMemo(
    () => ({
      total: rows.length,
      ready: rows.filter(isBulkTransactionReady).length,
      warnings: rows.filter((row) => row.warnings.length > 0).length,
      invalid: rows.filter((row) => !isBulkTransactionReady(row)).length,
    }),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return enrichedRows.filter((row) => {
      const matchesQuery =
        query.length === 0 ||
        [
          row.merchant,
          row.notes,
          row.accountLabel,
          row.accountId ?? "",
          row.warnings.join(" "),
          row.errors.join(" "),
          row.budgetItemId ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "needsAttention"
          ? row.issueMessages.length > 0 || row.warnings.length > 0
          : !row.budgetItemId);

      return matchesQuery && matchesStatus;
    });
  }, [enrichedRows, searchValue, statusFilter]);

  const selectedRows = useMemo(
    () => rows.filter((row) => row.selected),
    [rows],
  );

  const batchBudgetItemOptions = useMemo(() => {
    if (selectedRows.length === 0) {
      return budgetItemOptions;
    }

    const selectedDateKeys = new Set(
      selectedRows.map((row) => getTransactionDateKey(row.date)),
    );

    const matchedOptions = budgetItemOptions.filter((option) =>
      selectedDateKeys.has(getBudgetItemOptionDateKey(option)),
    );

    if (matchedOptions.length === 0) {
      return budgetItemOptions;
    }

    return matchedOptions;
  }, [budgetItemOptions, selectedRows]);

  useEffect(() => {
    if (
      batchBudgetItemId &&
      !batchBudgetItemOptions.some((option) => option.id === batchBudgetItemId)
    ) {
      setBatchBudgetItemId(null);
    }
  }, [batchBudgetItemId, batchBudgetItemOptions]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "selection",
        header: () => <span className="sr-only">Select row</span>,
        enableSorting: false,
        cell: (info) => (
          <div className="pt-1">
            <Checkbox
              checked={info.row.original.selected}
              onChange={(checked) =>
                onRowSelectionChange(info.row.original.id, Boolean(checked))
              }
              aria-label={`Select ${info.row.original.merchant}`}
            />
          </div>
        ),
      }),
      columnHelper.accessor("date", {
        header: ({ column }) => <SortableHeader column={column} label="Date" />,
        sortingFn: "datetime",
        cell: (info) => (
          <div className="space-y-1 leading-tight">
            <div className="font-medium text-zinc-950 dark:text-white">
              {dateFormatter.format(info.getValue())}
            </div>
            <Badge
              color={info.row.original.type === "debit" ? "sky" : "emerald"}
            >
              {info.row.original.type === "debit" ? "Debit" : "Credit"}
            </Badge>
          </div>
        ),
      }),
      columnHelper.accessor("merchant", {
        header: ({ column }) => (
          <SortableHeader column={column} label="Merchant" />
        ),
        cell: (info) => (
          <div className="space-y-1 leading-tight">
            <div className="font-medium text-zinc-950 dark:text-white">
              {info.getValue()}
            </div>
            <p className="max-w-60 text-xs/5 text-zinc-500 dark:text-zinc-400">
              {info.row.original.notes || "No notes"}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("amount", {
        header: ({ column }) => (
          <SortableHeader column={column} label="Amount" />
        ),
        cell: (info) => (
          <span className="font-medium text-zinc-950 dark:text-white">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("accountLabel", {
        header: ({ column }) => (
          <SortableHeader column={column} label="Account" />
        ),
        cell: (info) => (
          <div className="space-y-1 leading-tight">
            <div className="font-medium text-zinc-950 dark:text-white">
              {info.getValue()}
            </div>
            {info.row.original.accountId ? (
              <p className="text-xs/5 text-zinc-500 dark:text-zinc-400">
                {info.row.original.accountId}
              </p>
            ) : null}
          </div>
        ),
      }),
      columnHelper.display({
        id: "budgetItem",
        header: () => <span>Budget line</span>,
        cell: (info) => (
          <div className="min-w-72">
            <BudgetItemPicker
              budgetItemId={info.row.original.budgetItemId}
              budgetItemOptions={filterBudgetItemOptionsByTransactionDate({
                budgetItemId: info.row.original.budgetItemId,
                options: budgetItemOptions,
                transactionDate: info.row.original.date,
              })}
              onChange={(budgetItemId) =>
                onBudgetItemChange(info.row.original.id, budgetItemId)
              }
              placeholder="Assign budget line"
              ariaLabel={`Assign budget line for ${info.row.original.merchant}`}
            />
          </div>
        ),
      }),
      columnHelper.display({
        id: "status",
        header: () => <span>Status</span>,
        cell: (info) => (
          <div className="max-w-64 space-y-1.5 leading-tight">
            <Badge color={getStatusBadgeColor(info.row.original.statusTone)}>
              {info.row.original.statusLabel}
            </Badge>
            {info.row.original.issueMessages.length > 0 ? (
              <p className="text-xs/5 text-red-600 dark:text-red-400">
                {info.row.original.issueMessages.join(" ")}
              </p>
            ) : null}
            {info.row.original.warnings.length > 0 ? (
              <p className="text-xs/5 text-amber-700 dark:text-amber-300">
                {info.row.original.warnings.join(" ")}
              </p>
            ) : null}
          </div>
        ),
      }),
    ],
    [budgetItemOptions, onBudgetItemChange, onRowSelectionChange],
  );

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
        pageSize: 10,
      },
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [searchValue, statusFilter, table]);

  const visibleRows = table.getRowModel().rows;
  const visibleRowIds = visibleRows.map((row) => row.original.id);
  const selectedRowIds = rows
    .filter((row) => row.selected)
    .map((row) => row.id);
  const selectedVisibleCount = visibleRows.filter(
    (row) => row.original.selected,
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-zinc-950/8 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,24rem)]">
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-950/8 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-zinc-950/40">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Total
              </div>
              <div className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
                {summary.total}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-950/8 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-zinc-950/40">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Ready
              </div>
              <div className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {summary.ready}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-950/8 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-zinc-950/40">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Warnings
              </div>
              <div className="mt-1 text-lg font-semibold text-amber-600 dark:text-amber-300">
                {summary.warnings}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-950/8 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-zinc-950/40">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Invalid
              </div>
              <div className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
                {summary.invalid}
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(15rem,1fr)_12rem]">
            <label className="relative block">
              <InputGroup>
                <MagnifyingGlassIcon data-slot="icon" />
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search merchant, notes, warnings"
                />
              </InputGroup>
            </label>

            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | "needsAttention"
                    | "missingAssignment",
                )
              }
              aria-label="Filter import rows"
            >
              <option value="all">All rows</option>
              <option value="needsAttention">Needs attention</option>
              <option value="missingAssignment">Missing assignment</option>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              plain
              onClick={() => onBulkSelectionChange(visibleRowIds, true)}
              disabled={visibleRowIds.length === 0}
            >
              Select visible
            </Button>
            <Button
              plain
              onClick={() => onBulkSelectionChange(selectedRowIds, false)}
              disabled={selectedRowIds.length === 0}
            >
              Clear selection
            </Button>
            <Text>
              {selectedRowIds.length} selected across {filteredRows.length}{" "}
              filtered rows
            </Text>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-dashed border-zinc-950/12 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950/30">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-zinc-950 dark:text-white">
              Batch assign selected rows
            </div>
            <Text>
              Apply one budget line to the current selection, then fine-tune
              any outliers row by row.
            </Text>
          </div>

          <BudgetItemPicker
            budgetItemId={batchBudgetItemId}
            budgetItemOptions={batchBudgetItemOptions}
            onChange={setBatchBudgetItemId}
            placeholder="Choose a budget line"
            ariaLabel="Choose a budget line for selected rows"
          />

          <Button
            color="dark/zinc"
            onClick={() => {
              if (!batchBudgetItemId || selectedRowIds.length === 0) {
                return;
              }

              onBatchBudgetItemApply(selectedRowIds, batchBudgetItemId);
            }}
            disabled={!batchBudgetItemId || selectedRowIds.length === 0}
          >
            Apply to {selectedRowIds.length} selected
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-950/10 px-6 py-10 dark:border-white/10">
          <Text>No rows are available for review yet.</Text>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-950/10 px-6 py-10 dark:border-white/10">
          <Text>
            No rows match the current search and status filters. Clear the
            filters to continue reviewing the import.
          </Text>
        </div>
      ) : (
        <>
          <Table
            dense
            striped
            className="rounded-2xl [&_tbody_td]:py-3 [&_tbody_td]:align-top [&_thead_th]:py-1.5"
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
              {table.getPageCount()} · {selectedVisibleCount} selected on this
              page
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
