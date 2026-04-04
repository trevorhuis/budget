/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { DonutChart } from "~/components/calculators/calculator-charts";
import { CalculatorInputSection, CalculatorResultsColumn } from "~/components/calculators/calculator-editor";
import { NumberField, SelectField } from "~/components/calculators/calculator-fields";
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
  calculateMortgage,
  calculatorDefinitions,
  formatCurrency,
  formatPercent,
  type MortgageCalculatorData,
} from "~/lib/calculators";

export const Route = createFileRoute("/_app/calculators/mortgage")({
  component: MortgageCalculatorPage,
});

function MortgageCalculatorPage() {
  const scenario = useScenarioDraft(calculatorDefinitions.mortgage);
  const result = useMemo(
    () => calculateMortgage(scenario.draft as MortgageCalculatorData),
    [scenario.draft],
  );
  const update = createDraftUpdateHelpers(scenario.setDraft);

  return (
    <CalculatorScenarioShell definition={calculatorDefinitions.mortgage} scenario={scenario}>
      <CalculatorInputSection>
        <NumberField
          label="Home Purchase Price"
          value={scenario.draft.homePrice}
          min={0}
          step={1000}
          onChange={update.setField("homePrice")}
        />
        <SelectField
          label="Down Payment Mode"
          value={scenario.draft.downPaymentMode}
          onChange={(value) =>
            update.setField("downPaymentMode")(
              value as MortgageCalculatorData["downPaymentMode"],
            )
          }
        >
          <option value="percent">Percent</option>
          <option value="amount">Dollar Amount</option>
        </SelectField>
        <NumberField
          label={scenario.draft.downPaymentMode === "percent" ? "Down Payment %" : "Down Payment $"}
          value={scenario.draft.downPaymentValue}
          min={0}
          step={scenario.draft.downPaymentMode === "percent" ? 0.5 : 1000}
          onChange={update.setField("downPaymentValue")}
        />
        <SelectField
          label="Interest Mode"
          value={scenario.draft.rateType}
          onChange={(value) =>
            update.setField("rateType")(value as MortgageCalculatorData["rateType"])
          }
        >
          <option value="fixed">Fixed</option>
          <option value="adjustable">Simple ARM</option>
        </SelectField>
        <NumberField
          label="Initial Interest Rate"
          value={scenario.draft.interestRate}
          min={0}
          step={0.05}
          onChange={update.setField("interestRate")}
        />
        <SelectField
          label="Loan Term"
          value={`${scenario.draft.loanTermYears}`}
          onChange={(value) =>
            update.setField("loanTermYears")(
              Number(value) as MortgageCalculatorData["loanTermYears"],
            )
          }
        >
          {[10, 15, 20, 30].map((years) => (
            <option key={years} value={years}>
              {years} years
            </option>
          ))}
        </SelectField>
        <NumberField
          label="Annual Property Taxes"
          value={scenario.draft.annualPropertyTaxes}
          min={0}
          step={100}
          onChange={update.setField("annualPropertyTaxes")}
        />
        <NumberField
          label="Annual Homeowners Insurance"
          value={scenario.draft.annualHomeInsurance}
          min={0}
          step={100}
          onChange={update.setField("annualHomeInsurance")}
        />
        {scenario.draft.rateType === "adjustable" ? (
          <>
            <NumberField
              label="Intro Fixed Years"
              value={scenario.draft.adjustableRate.introFixedYears}
              min={1}
              step={1}
              onChange={update.setNestedField("adjustableRate", "introFixedYears")}
            />
            <NumberField
              label="Adjustment Interval (Years)"
              value={scenario.draft.adjustableRate.adjustmentIntervalYears}
              min={1}
              step={1}
              onChange={update.setNestedField("adjustableRate", "adjustmentIntervalYears")}
            />
            <NumberField
              label="Rate Increase Per Reset"
              value={scenario.draft.adjustableRate.rateAdjustment}
              min={0}
              step={0.25}
              onChange={update.setNestedField("adjustableRate", "rateAdjustment")}
            />
            <NumberField
              label="Maximum Rate"
              value={scenario.draft.adjustableRate.maxRate}
              min={0}
              step={0.25}
              onChange={update.setNestedField("adjustableRate", "maxRate")}
            />
          </>
        ) : null}
      </CalculatorInputSection>
      <CalculatorResultsColumn>
        <CalculatorSurface>
          <CalculatorMetricGrid columnsClassName="md:grid-cols-3">
            <CalculatorMetric
              label="Monthly PITI"
              value={formatCurrency(result.monthlyPiti)}
              helper={result.pmiApplied ? "PMI is active until the loan reaches 80% LTV." : "PMI is not required."}
            />
            <CalculatorMetric
              label="Down Payment"
              value={formatCurrency(result.downPaymentAmount)}
              helper={formatPercent(
                scenario.draft.homePrice === 0
                  ? 0
                  : (result.downPaymentAmount / scenario.draft.homePrice) * 100,
              )}
            />
            <CalculatorMetric
              label="Sticker Shock"
              value={formatCurrency(result.totalInterest)}
              helper="Total interest across the full loan life."
            />
          </CalculatorMetricGrid>
        </CalculatorSurface>
        <CalculatorSurface>
          <DonutChart segments={result.monthlyBreakdown} />
        </CalculatorSurface>
        <CalculatorSurface>
          <Subheading>Amortization Schedule</Subheading>
          <Table striped dense className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeader>Month</TableHeader>
                <TableHeader>Rate</TableHeader>
                <TableHeader>Principal</TableHeader>
                <TableHeader>Interest</TableHeader>
                <TableHeader>Total Payment</TableHeader>
                <TableHeader>Balance</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.amortizationTableRows.map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{formatPercent(row.rate)}</TableCell>
                  <TableCell>{formatCurrency(row.principal)}</TableCell>
                  <TableCell>{formatCurrency(row.interest)}</TableCell>
                  <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
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
