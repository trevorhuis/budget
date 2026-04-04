import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { TransactionSchema, type Transaction } from "~/lib/schemas";
import { transactionsApi } from "~/lib/api/transactions";
import { queryClient } from "~/lib/integrations/queryClient";

const normalizeTransaction = (transaction: Transaction) => ({
  ...transaction,
  date: new Date(transaction.date),
  createdAt: transaction.createdAt ? new Date(transaction.createdAt) : undefined,
  updatedAt: transaction.updatedAt ? new Date(transaction.updatedAt) : undefined,
});

const normalizeTransactionUpdate = (transaction: Transaction) => ({
  merchant: transaction.merchant,
  amount: transaction.amount,
  notes: transaction.notes,
  date: transaction.date,
  type: transaction.type,
  accountId: transaction.accountId,
  budgetItemId: transaction.budgetItemId,
  recurringTemplateId: transaction.recurringTemplateId ?? null,
});

export const transactionCollection = createCollection(
  queryCollectionOptions({
    schema: TransactionSchema,
    queryClient,
    queryKey: ["transactions"],
    getKey: (transaction) => transaction.id,
    queryFn: async () => {
      const { data } = await transactionsApi.fetch();
      return data.map(normalizeTransaction);
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0];

      await transactionsApi.update(
        original.id,
        normalizeTransactionUpdate(modified),
      );
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified;

      await transactionsApi.delete(item.id);
    },
  }),
);
