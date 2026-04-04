/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { LineChart } from "~/components/calculators/calculator-charts";
import { CalculatorInputSection, CalculatorResultsColumn } from "~/components/calculators/calculator-editor";
import { NumberField } from "~/components/calculators/calculator-fields";
import { CalculatorMetric, CalculatorMetricGrid } from "~/components/calculators/calculator-metrics";
import { CalculatorScenarioShell } from "~/components/calculators/calculator-shell";
import { CalculatorSurface } from "~/components/calculators/calculator-surface";
import { Subheading } from "~/components/ui/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { createDraftUpdateHelpers } from "~/hooks/calculators/draftUpdateHelpers";
import { useScenarioDraft } from "~/hooks/calculators/useScenarioDraft";
import {
  calculateDebtPayoff,
  calculatorDefinitions,
  formatCurrency,
  formatTimeSaved,
  type DebtPayoffCalculatorData,
} from "~/lib/calculators";

export const Route = createFileRoute("/_app/calculators/debt-payoff")({
  component: DebtPayoffCalculatorPage,
});

function DebtPayoffCalculatorPage() {
  const scenario = useScenarioDraft(calculatorDefinitions.debtPayoff);
  const result = useMemo(
    () => calculateDebtPayoff(scenario.draft as DebtPayoffCalculatorData),
    [scenario.draft],
  );
  const update = createDraftUpdateHelpers(scenario.setDraft);

  return (
    <CalculatorScenarioShell definition={calculatorDefinitions.debtPayoff} scenario={scenario}>
      <CalculatorInputSection>
        <NumberField
          label="Current Balance"
          value={scenario.draft.currentBalance}
          min={0}
          step={100}
          onChange={update.setField("currentBalance")}
        />
        <NumberField
          label="APR"
          value={scenario.draft.apr}
          min={0}
          step={0.1}
          onChange={update.setField("apr")}
        />
        <NumberField
          label="Current Monthly Payment"
          value={scenario.draft.currentMonthlyPayment}
          min={0}
          step={10}
          onChange={update.setField("currentMonthlyPayment")}
        />
        <NumberField
          label="Accelerator Extra Payment"
          value={scenario.draft.extraMonthlyPayment}
          min={0}
          step={10}
          onChange={update.setField("extraMonthlyPayment")}
        />
      </CalculatorInputSection>
      <CalculatorResultsColumn>
        <CalculatorSurface>
          <CalculatorMetricGrid>
            <CalculatorMetric
              label="Payoff Date"
              value={result.canPayOff ? result.payoffDateLabel : "Never"}
              helper={
                result.canPayOff
                  ? "Estimated from the current calendar month."
                  : "Increase your payment to outrun monthly interest."
              }
            />
            <CalculatorMetric
              label="Interest Saved"
              value={formatCurrency(result.interestSaved)}
            />
            <CalculatorMetric
              label="Time Saved"
              value={formatTimeSaved(result.timeSavedMonths)}
            />
            <CalculatorMetric
              label="Accelerated Payment"
              value={formatCurrency(result.acceleratedMonthlyPayment)}
            />
          </CalculatorMetricGrid>
        </CalculatorSurface>
        <CalculatorSurface>
          <LineChart
            title="Balance Path"
            series={[
              {
                label: "Baseline",
                color: "text-zinc-900 dark:text-zinc-100",
                values: result.baselineSchedule?.map((row) => row.balance) ?? [0],
              },
              {
                label: "Accelerated",
                color: "text-emerald-500",
                values: result.acceleratedSchedule?.map((row) => row.balance) ?? [0],
              },
            ]}
          />
        </CalculatorSurface>
        <CalculatorSurface>
          <Subheading>Timeline Comparison</Subheading>
          <Table striped dense className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeader>Scenario</TableHeader>
                <TableHeader>Months</TableHeader>
                <TableHeader>Total Interest</TableHeader>
                <TableHeader>Monthly Payment</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Baseline</TableCell>
                <TableCell>{result.baselineSchedule?.length ?? "N/A"}</TableCell>
                <TableCell>
                  {formatCurrency(
                    result.baselineSchedule?.reduce(
                      (sum, row) => sum + row.interest,
                      0,
                    ) ?? 0,
                  )}
                </TableCell>
                <TableCell>{formatCurrency(scenario.draft.currentMonthlyPayment)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Accelerated</TableCell>
                <TableCell>{result.acceleratedSchedule?.length ?? "N/A"}</TableCell>
                <TableCell>{formatCurrency(result.totalInterest)}</TableCell>
                <TableCell>{formatCurrency(result.acceleratedMonthlyPayment)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CalculatorSurface>
      </CalculatorResultsColumn>
    </CalculatorScenarioShell>
  );
}
