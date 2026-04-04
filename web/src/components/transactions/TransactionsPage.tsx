import { useTransactionsPageData } from "~/hooks/useTransactionsPageData";
import { TransactionsView } from "~/components/transactions/TransactionsView";

export function TransactionsPage() {
  const { accountOptions, budgetLineOptions, summary, transactionRows } =
    useTransactionsPageData();

  return (
    <TransactionsView
      accountOptions={accountOptions}
      budgetLineOptions={budgetLineOptions}
      summary={summary}
      transactionRows={transactionRows}
    />
  );
}
