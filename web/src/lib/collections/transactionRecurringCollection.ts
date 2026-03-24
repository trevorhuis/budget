import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import {
  RecurringTransactionSchema,
  type RecurringTransaction,
} from "../schemas";
import { API } from "../api";
import { queryClient } from "../integrations/queryClient";

const normalizeRecurringTransaction = (
  recurringTransaction: RecurringTransaction,
) => ({
  ...recurringTransaction,
  createdAt: recurringTransaction.createdAt
    ? new Date(recurringTransaction.createdAt)
    : undefined,
  updatedAt: recurringTransaction.updatedAt
    ? new Date(recurringTransaction.updatedAt)
    : undefined,
});

const normalizeRecurringTransactionUpdate = (
  recurringTransaction: RecurringTransaction,
) => ({
  merchant: recurringTransaction.merchant,
  amount: recurringTransaction.amount,
  notes: recurringTransaction.notes,
  recurringDate: recurringTransaction.recurringDate,
  categoryId: recurringTransaction.categoryId,
});

export const recurringTransactionCollection = createCollection(
  queryCollectionOptions({
    schema: RecurringTransactionSchema,
    queryClient,
    queryKey: ["recurringTransactions"],
    getKey: (recurringTransaction) => recurringTransaction.id,
    queryFn: async () => {
      const { data } = await API.recurringTransactions.fetch();
      return data.map(normalizeRecurringTransaction);
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0];

      await API.recurringTransactions.update(
        original.id,
        normalizeRecurringTransactionUpdate(modified),
      );
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified;

      await API.recurringTransactions.delete(item.id);
    },
  }),
);
