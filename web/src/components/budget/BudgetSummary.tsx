import { Badge } from "~/components/ui/badge";
import { SummaryMetric } from "~/components/ui/SummaryMetric";
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

export function BudgetSummary({
  actualSpending,
  expectedExpenses,
  expectedIncome,
  monthLabel,
  overspentCategories,
  plannedNet,
}: BudgetSummaryProps) {
  return (
    <div className="border-y border-(--color-ink-100) py-4">
      <div className="grid grid-cols-2 items-start gap-x-4 gap-y-4 sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.15fr)] lg:items-center lg:gap-x-5">
        <SummaryMetric label="Expected income">
          <span className="text-(--color-positive)">
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
              ? "text-(--color-positive)"
              : "text-(--color-negative)"
          }
        >
          {formatCurrency(plannedNet)}
        </SummaryMetric>

        <div className="col-span-2 border-t border-(--color-ink-100) pt-4 sm:col-span-4 lg:col-span-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
          <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-(--color-ink-500)">
            Pressure points
          </div>
          {overspentCategories.length === 0 ? (
            <p className="mt-1 text-xs/5 text-(--color-ink-500)">
              None over target · {monthLabel}
            </p>
          ) : (
            <div className="mt-2 space-y-1.5">
              {overspentCategories.slice(0, 3).map((row) => (
                <div
                  key={row.budgetItem.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-(--color-ink-100) px-2 py-1.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-(--color-ink-900)">
                      {row.category.name}
                    </div>
                    <span className="block text-[0.65rem] leading-4 text-(--color-ink-500)">
                      {row.group}
                    </span>
                  </div>
                  <Badge color="negative" className="shrink-0">
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
