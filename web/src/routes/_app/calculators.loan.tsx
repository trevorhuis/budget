/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { LineChart } from "~/components/calculators/CalculatorCharts";
import { CalculatorInputSection, CalculatorResultsColumn } from "~/components/calculators/CalculatorEditor";
import { DateField, NumberField, SelectField } from "~/components/calculators/CalculatorFields";
import { CalculatorMetric, CalculatorMetricGrid } from "~/components/calculators/CalculatorMetrics";
import { CalculatorScenarioShell } from "~/components/calculators/CalculatorShell";
import { CalculatorSurface } from "~/components/calculators/CalculatorSurface";
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
  calculateLoan,
  calculatorDefinitions,
  formatCurrency,
  formatPercent,
  type LoanCalculatorData,
} from "~/lib/calculators";

export const Route = createFileRoute("/_app/calculators/loan")({
  component: LoanCalculatorPage,
});

function LoanCalculatorPage() {
  const scenario = useScenarioDraft(calculatorDefinitions.loan);
  const result = useMemo(
    () => calculateLoan(scenario.draft as LoanCalculatorData),
    [scenario.draft],
  );
  const update = createDraftUpdateHelpers(scenario.setDraft);

  return (
    <CalculatorScenarioShell definition={calculatorDefinitions.loan} scenario={scenario}>
      <CalculatorInputSection>
        <NumberField
          label="Total Loan Amount"
          value={scenario.draft.loanAmount}
          min={0}
          step={500}
          onChange={update.setField("loanAmount")}
        />
        <SelectField
          label="Loan Term Unit"
          value={scenario.draft.termUnit}
          onChange={(value) =>
            update.setField("termUnit")(value as LoanCalculatorData["termUnit"])
          }
        >
          <option value="months">Months</option>
          <option value="years">Years</option>
        </SelectField>
        <NumberField
          label="Loan Term Value"
          value={scenario.draft.termValue}
          min={1}
          step={1}
          onChange={update.setField("termValue")}
        />
        <NumberField
          label="Interest Rate"
          value={scenario.draft.interestRate}
          min={0}
          step={0.05}
          onChange={update.setField("interestRate")}
        />
        <DateField
          label="Loan Start Date"
          value={scenario.draft.startDate}
          onChange={update.setField("startDate")}
        />
        <SelectField
          label="Origination Fee Mode"
          value={scenario.draft.originationFeeMode}
          onChange={(value) =>
            update.setField("originationFeeMode")(
              value as LoanCalculatorData["originationFeeMode"],
            )
          }
        >
          <option value="percent">Percent</option>
          <option value="amount">Dollar Amount</option>
        </SelectField>
        <NumberField
          label={scenario.draft.originationFeeMode === "percent" ? "Origination Fee %" : "Origination Fee $"}
          value={scenario.draft.originationFeeValue}
          min={0}
          step={scenario.draft.originationFeeMode === "percent" ? 0.1 : 50}
          onChange={update.setField("originationFeeValue")}
        />
      </CalculatorInputSection>
      <CalculatorResultsColumn>
        <CalculatorSurface>
          <CalculatorMetricGrid>
            <CalculatorMetric
              label="Monthly Payment"
              value={formatCurrency(result.monthlyPayment)}
            />
            <CalculatorMetric
              label="Total Interest"
              value={formatCurrency(result.totalInterest)}
            />
            <CalculatorMetric label="True APR" value={formatPercent(result.trueApr)} />
            <CalculatorMetric label="Upfront Fees" value={formatCurrency(result.totalFees)} />
          </CalculatorMetricGrid>
        </CalculatorSurface>
        <CalculatorSurface>
          <LineChart
            title="Interest vs Principal"
            series={[
              {
                label: "Interest",
                color: "text-zinc-900 dark:text-zinc-100",
                values: result.schedule.map((row) => row.interest),
              },
              {
                label: "Principal",
                color: "text-sky-500",
                values: result.schedule.map((row) => row.principal),
              },
            ]}
          />
        </CalculatorSurface>
        <CalculatorSurface>
          <Subheading>Payment Summary</Subheading>
          <Table striped dense className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeader>Month</TableHeader>
                <TableHeader>Payment</TableHeader>
                <TableHeader>Principal</TableHeader>
                <TableHeader>Interest</TableHeader>
                <TableHeader>Balance</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.schedule.slice(0, 24).map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{formatCurrency(row.payment)}</TableCell>
                  <TableCell>{formatCurrency(row.principal)}</TableCell>
                  <TableCell>{formatCurrency(row.interest)}</TableCell>
                  <TableCell>{formatCurrency(row.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CalculatorSurface>
      </CalculatorResultsColumn>
    </CalculatorScenarioShell>
  );
}
