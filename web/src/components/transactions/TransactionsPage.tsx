import { useTransactionsPageData } from "~/hooks/useTransactionsPageData";
import { TransactionsWorkspace } from "~/components/transactions/TransactionsWorkspace";

export function TransactionsPage() {
  const { accountOptions, budgetLineOptions, summary, transactionRows } =
    useTransactionsPageData();

  return (
    <TransactionsWorkspace
      accountOptions={accountOptions}
      budgetLineOptions={budgetLineOptions}
      summary={summary}
      transactionRows={transactionRows}
    />
  );
}
