import { Badge } from "~/components/ui/badge";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "~/components/ui/description-list";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
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
    <div className="grid gap-6 border-y border-zinc-950/6 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] dark:border-white/8">
      <DescriptionList className="max-w-3xl">
        <DescriptionTerm>Expected income</DescriptionTerm>
        <DescriptionDetails className="font-medium text-emerald-600 dark:text-emerald-400">
          {formatCurrency(expectedIncome)}
        </DescriptionDetails>

        <DescriptionTerm>Expected expenses</DescriptionTerm>
        <DescriptionDetails>{formatCurrency(expectedExpenses)}</DescriptionDetails>

        <DescriptionTerm>Actual spending</DescriptionTerm>
        <DescriptionDetails>{formatCurrency(actualSpending)}</DescriptionDetails>

        <DescriptionTerm>Planned net</DescriptionTerm>
        <DescriptionDetails
          className={
            plannedNet >= 0
              ? "font-medium text-emerald-600 dark:text-emerald-400"
              : "font-medium text-rose-600 dark:text-rose-400"
          }
        >
          {formatCurrency(plannedNet)}
        </DescriptionDetails>
      </DescriptionList>

      <div className="space-y-3">
        <Subheading>Pressure points</Subheading>
        {overspentCategories.length === 0 ? (
          <Text>No categories are over target for {monthLabel}.</Text>
        ) : (
          <div className="space-y-2">
            {overspentCategories.slice(0, 3).map((row) => (
              <div
                key={row.budgetItem.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-950/8 px-4 py-3 dark:border-white/10"
              >
                <div>
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {row.category.name}
                  </div>
                  <Text>{row.group}</Text>
                </div>
                <Badge color="rose">
                  {formatCurrency(Math.abs(row.variance))} over
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
