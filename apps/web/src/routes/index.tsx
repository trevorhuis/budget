import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import {
  accountCollection,
  bucketCollection,
  budgetCollection,
  budgetItemCollection,
  categoryCollection,
  transactionCollection,
  transactionRecurringCollection,
} from "../lib/collections";
import { TransactionTable } from "../components/TransactionTable";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: accountData } = useLiveQuery((q) =>
    q.from({ accounts: accountCollection }),
  );

  const { data: bucketData } = useLiveQuery((q) =>
    q.from({ buckets: bucketCollection }),
  );

  const { data: budgetData } = useLiveQuery((q) =>
    q.from({ budgets: budgetCollection }),
  );

  const { data: budgetItemData } = useLiveQuery((q) =>
    q.from({ budgetItems: budgetItemCollection }),
  );

  const { data: categoriesData } = useLiveQuery((q) =>
    q.from({ categories: categoryCollection }),
  );

  const { data: transactionRecurringData } = useLiveQuery((q) =>
    q.from({ recurringTransactions: transactionRecurringCollection }),
  );

  return (
    <TransactionTable />
  );
}
