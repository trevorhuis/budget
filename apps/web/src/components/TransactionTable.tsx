import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { type Category, type Transaction } from "schemas";
import { categoryCollection, transactionCollection } from "../lib/collections";
import { eq, useLiveQuery } from "@tanstack/react-db";

type TransactionTableData = {
  transaction: Transaction;
  category: Category | null;
};

const columnHelper = createColumnHelper<TransactionTableData>();

const columns = [
  columnHelper.accessor("transaction.merchant", {
    header: "Merchant",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("transaction.amount", {
    header: "Amount",
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor((row) => row.category?.name ?? null, {
    id: "category",
    header: "Category",
    cell: (info) => info.getValue() ?? "Uncategorized",
  }),
  columnHelper.accessor("transaction.date", {
    header: "Date",
    cell: (info) => formatDate(new Date(info.getValue())),
  }),
  columnHelper.accessor("transaction.notes", {
    header: "Notes",
    cell: (info) => info.getValue(),
  }),
];

const usFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (amount: number) => {
  return usFormatter.format(amount);
};

const formatDate = (date: Date) => {
  return `${date.toLocaleString("default", { month: "short" })} ${date.getDay() + 1}, ${date.getFullYear()}`;
};

export const TransactionTable = () => {
  const { data } = useLiveQuery((q) =>
    q
      .from({ transaction: transactionCollection })
      .join(
        { category: categoryCollection },
        ({ transaction, category }) => eq(transaction.categoryId, category.id),
        "left",
      ),
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="m-12">
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
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
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
