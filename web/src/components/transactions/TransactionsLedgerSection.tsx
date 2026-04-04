import { TransactionTable, type TransactionTableRow } from "~/components/transactions/TransactionTable";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

export function TransactionsLedgerSection({
  rows,
}: {
  rows: TransactionTableRow[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <Subheading>Ledger</Subheading>
        <Text>
          Search, filter, and sort the posted transaction stream across all
          connected accounts and budget lines.
        </Text>
      </div>

      <TransactionTable rows={rows} />
    </section>
  );
}
