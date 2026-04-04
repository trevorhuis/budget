import clsx from "clsx";
import type { ReactNode } from "react";

import { Badge } from "~/components/ui/badge";
import type { BudgetRow } from "~/lib/utils/budgetUtils";
import { formatCurrency } from "~/lib/utils/budgetUtils";

type BudgetSummaryProps = {
  actualSpending: number;
  expectedExpenses: number;
  expectedIncome: number;
  monthLabel: string;
  overspentCategories: BudgetRow[];
  plannedNet: number;
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

export function BudgetSummary({
  actualSpending,
  expectedExpenses,
  expectedIncome,
  monthLabel,
  overspentCategories,
  plannedNet,
}: BudgetSummaryProps) {
  return (
    <div className="border-y border-zinc-950/6 py-2.5 dark:border-white/8">
      <div className="grid grid-cols-2 items-start gap-x-4 gap-y-2.5 sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.15fr)] lg:items-center lg:gap-x-5">
        <SummaryMetric label="Expected income">
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatCurrency(expectedIncome)}
          </span>
        </SummaryMetric>
        <SummaryMetric label="Expected expenses">
          {formatCurrency(expectedExpenses)}
        </SummaryMetric>
        <SummaryMetric label="Actual spending">
          {formatCurrency(actualSpending)}
        </SummaryMetric>
        <SummaryMetric
          label="Planned net"
          className={
            plannedNet >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }
        >
          {formatCurrency(plannedNet)}
        </SummaryMetric>

        <div className="col-span-2 border-t border-zinc-950/6 pt-2.5 sm:col-span-4 lg:col-span-1 lg:border-t-0 lg:border-l lg:border-zinc-950/10 lg:pt-0 lg:pl-4 dark:border-white/8 dark:lg:border-white/10">
          <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            Pressure points
          </div>
          {overspentCategories.length === 0 ? (
            <p className="mt-0.5 text-xs/5 text-zinc-600 dark:text-zinc-400">
              None over target · {monthLabel}
            </p>
          ) : (
            <div className="mt-1.5 space-y-1">
              {overspentCategories.slice(0, 3).map((row) => (
                <div
                  key={row.budgetItem.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-zinc-950/8 px-2 py-1.5 dark:border-white/10"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-zinc-950 dark:text-white">
                      {row.category.name}
                    </div>
                    <span className="block text-[0.65rem] leading-4 text-zinc-500 dark:text-zinc-400">
                    {row.group}
                  </span>
                  </div>
                  <Badge color="rose" className="shrink-0">
                    {formatCurrency(Math.abs(row.variance))} over
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
