import { TransactionTable, type TransactionTableRow } from "~/components/transactions/TransactionTable";

export function TransactionsListSection({
  rows,
}: {
  rows: TransactionTableRow[];
}) {
  return (
    <section className="min-w-0" aria-label="Transaction list and filters">
      <TransactionTable rows={rows} />
    </section>
  );
}
