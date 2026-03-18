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

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: accountData } = useLiveQuery((q) =>
    q.from({ accounts: accountCollection }),
  );
  console.log(accountData);

  const { data: bucketData } = useLiveQuery((q) =>
    q.from({ buckets: bucketCollection }),
  );
  console.log(bucketData);

  const { data: budgetData } = useLiveQuery((q) =>
    q.from({ budgets: budgetCollection }),
  );
  console.log(budgetData);

  const { data: budgetItemData } = useLiveQuery((q) =>
    q.from({ budgetItems: budgetItemCollection }),
  );
  console.log(budgetItemData);

  const { data: categoriesData } = useLiveQuery((q) =>
    q.from({ categories: categoryCollection }),
  );
  console.log(categoriesData);

  const { data: transactionData } = useLiveQuery((q) =>
    q.from({ transactions: transactionCollection }),
  );
  console.log(transactionData);

  const { data: transactionRecurringData } = useLiveQuery((q) =>
    q.from({ recurringTransactions: transactionRecurringCollection }),
  );
  console.log(transactionRecurringData);

  return <div>Hello "/"!</div>;
}
