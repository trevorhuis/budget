import { useRouterState } from "@tanstack/react-router";

import {
  formatCurrency,
  formatDateTime,
  getCalculatorDefinition,
  getCalculatorSummary,
  readSearchParam,
} from "~/lib/calculators";
import { useCalculatorScenarios } from "~/hooks/calculators/useCalculatorScenarios";
import { Badge } from "~/components/ui/badge";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { CalculatorMetric } from "~/components/calculators/calculator-metrics";
import { CalculatorNotice } from "~/components/calculators/calculator-states";
import { CalculatorSurface } from "~/components/calculators/calculator-surface";

export function CalculatorCompare() {
  const searchStr = useRouterState({
    select: (state) => state.location.searchStr,
  });
  const leftId = readSearchParam(searchStr, "left");
  const rightId = readSearchParam(searchStr, "right");
  const { getScenarioById } = useCalculatorScenarios();
  const leftScenario = getScenarioById(leftId);
  const rightScenario = getScenarioById(rightId);

  if (!leftScenario || !rightScenario) {
    return (
      <div className="space-y-8">
        <CalculatorNotice
          badgeColor="amber"
          badgeLabel="Compare"
          title="Pick Two Saved Scenarios"
          description="Select two scenarios from your saved dashboard, then launch compare mode from there."
          actionHref="/calculators"
          actionLabel="Open Saved Scenarios"
        />
      </div>
    );
  }

  if (leftScenario.calculatorType !== rightScenario.calculatorType) {
    return (
      <div className="space-y-8">
        <CalculatorNotice
          badgeColor="rose"
          badgeLabel="Type Mismatch"
          title="Use Matching Calculator Types"
          description="Comparison mode only works for two saved scenarios from the same calculator family."
          actionHref="/calculators"
          actionLabel="Back to Saved Scenarios"
        />
      </div>
    );
  }

  const leftSummary = getCalculatorSummary(leftScenario);
  const rightSummary = getCalculatorSummary(rightScenario);
  const definition = getCalculatorDefinition(leftScenario.calculatorType);
  const monthlyDelta = rightSummary.monthlyPayment - leftSummary.monthlyPayment;
  const interestDelta = rightSummary.totalInterest - leftSummary.totalInterest;

  return (
    <div className="space-y-8">
      <CalculatorSurface>
        <Badge color="sky">Comparison</Badge>
        <Heading className="mt-4">{definition.label} Comparison View</Heading>
        <Text className="mt-2">
          Compare monthly cash flow and lifetime interest before you decide which
          scenario to keep.
        </Text>
      </CalculatorSurface>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)]">
        <CompareScenarioColumn
          scenarioName={leftScenario.name}
          monthly={formatCurrency(leftSummary.monthlyPayment)}
          totalInterest={formatCurrency(leftSummary.totalInterest)}
          updatedAt={formatDateTime(leftScenario.updatedAt)}
        />
        <CalculatorSurface className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <Subheading className="text-white dark:text-zinc-950">Delta</Subheading>
          <div className="mt-5 grid gap-4">
            <CalculatorMetric
              label="Monthly Difference"
              value={formatCurrency(monthlyDelta)}
              helper={
                monthlyDelta < 0
                  ? "Right scenario is cheaper monthly."
                  : "Right scenario costs more monthly."
              }
            />
            <CalculatorMetric
              label="Interest Difference"
              value={formatCurrency(interestDelta)}
              helper={
                interestDelta < 0
                  ? "Right scenario pays less interest."
                  : "Right scenario pays more interest."
              }
            />
          </div>
        </CalculatorSurface>
        <CompareScenarioColumn
          scenarioName={rightScenario.name}
          monthly={formatCurrency(rightSummary.monthlyPayment)}
          totalInterest={formatCurrency(rightSummary.totalInterest)}
          updatedAt={formatDateTime(rightScenario.updatedAt)}
        />
      </div>
    </div>
  );
}

function CompareScenarioColumn({
  monthly,
  scenarioName,
  totalInterest,
  updatedAt,
}: {
  monthly: string;
  scenarioName: string;
  totalInterest: string;
  updatedAt: string;
}) {
  return (
    <CalculatorSurface>
      <Subheading>{scenarioName}</Subheading>
      <div className="mt-5 grid gap-4">
        <CalculatorMetric label="Monthly" value={monthly} />
        <CalculatorMetric label="Total Interest" value={totalInterest} />
        <CalculatorMetric label="Last Modified" value={updatedAt} />
      </div>
    </CalculatorSurface>
  );
}

