import { SummaryMetric } from "~/components/ui/SummaryMetric";
import { formatTransactionCurrency } from "~/lib/utils/transactions/format";

type TransactionsSummaryProps = {
  creditTotal: number;
  debitTotal: number;
  netBudgetImpact: number;
  totalTransactions: number;
};

export function TransactionsSummary({
  creditTotal,
  debitTotal,
  netBudgetImpact,
  totalTransactions,
}: TransactionsSummaryProps) {
  return (
    <div className="border-b border-zinc-950/6 py-2.5 dark:border-white/8">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
        <SummaryMetric label="Transactions">
          {totalTransactions}
        </SummaryMetric>
        <SummaryMetric label="Money out">
          {formatTransactionCurrency(debitTotal)}
        </SummaryMetric>
        <SummaryMetric label="Money in">
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatTransactionCurrency(creditTotal)}
          </span>
        </SummaryMetric>
        <SummaryMetric
          label="Net change"
          className={
            netBudgetImpact >= 0
              ? undefined
              : "text-emerald-600 dark:text-emerald-400"
          }
        >
          {formatTransactionCurrency(netBudgetImpact)}
        </SummaryMetric>
      </div>
    </div>
  );
}
