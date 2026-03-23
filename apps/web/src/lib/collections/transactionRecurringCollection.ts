import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { RecurringTransactionSchema, type RecurringTransaction } from "schemas";
import { queryClient } from "../integrations/queryClient";
import { createCrudHandlers, getCollectionData } from "./utils";

export const recurringTransactionCollection = createCollection(
  queryCollectionOptions({
    schema: RecurringTransactionSchema,
    queryClient,
    queryKey: ["recurringTransaction"],
    getKey: (recurringTransaction) => recurringTransaction.id,
    queryFn: async () =>
      getCollectionData<RecurringTransaction>("/api/transactions/recurring"),
    ...createCrudHandlers<RecurringTransaction>("/api/transactions/recurring"),
  }),
);
