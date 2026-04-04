import clsx from "clsx";
import type { ReactNode } from "react";

import { formatTransactionCurrency } from "~/lib/utils/transactions/format";

type TransactionsSummaryProps = {
  creditTotal: number;
  debitTotal: number;
  netBudgetImpact: number;
  totalTransactions: number;
};

function SummaryMetric({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div
        className={clsx(
          "mt-0.5 truncate text-sm font-semibold tabular-nums text-zinc-950 dark:text-white",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

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
