import type { Calculator } from "~/lib/schemas";
import {
  calculateDebtPayoff,
  calculateLoan,
  calculateMortgage,
  calculatorDefinitions,
  formatCurrency,
  formatPercent,
  formatTimeSaved,
} from "~/lib/calculators";
import { Badge } from "~/components/ui/badge";
import { Heading, Subheading } from "~/components/ui/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Text } from "~/components/ui/text";
import { LineChart, DonutChart } from "~/components/calculators/calculator-charts";
import { CalculatorMetric, CalculatorMetricGrid } from "~/components/calculators/calculator-metrics";
import { CalculatorSurface } from "~/components/calculators/calculator-surface";
import { formatDateTime } from "~/lib/calculators";

export function CalculatorReportHero({ calculator }: { calculator: Calculator }) {
  const definition = calculatorDefinitions[calculator.calculatorType];

  return (
    <CalculatorSurface>
      <div className="flex flex-wrap items-center gap-3">
        <Badge color="sky">{definition.label}</Badge>
        <Badge color="emerald">Shared</Badge>
      </div>
      <Heading className="mt-4">{calculator.name}</Heading>
      <Text className="mt-2">
        Read-only scenario report generated from a saved calculator session.
      </Text>
      <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        Last modified {formatDateTime(calculator.updatedAt)}
      </div>
    </CalculatorSurface>
  );
}

export function ReadOnlyCalculatorReport({
  calculator,
}: {
  calculator: Calculator;
}) {
  switch (calculator.calculatorType) {
    case "mortgage": {
      const data = calculatorDefinitions.mortgage.parseData(calculator.data);
      const result = calculateMortgage(data);

      return (
        <div className="space-y-6">
          <CalculatorMetricGrid columnsClassName="md:grid-cols-3">
            <CalculatorMetric label="Monthly PITI" value={formatCurrency(result.monthlyPiti)} />
            <CalculatorMetric label="Loan Amount" value={formatCurrency(result.loanAmount)} />
            <CalculatorMetric
              label="Total Interest"
              value={formatCurrency(result.totalInterest)}
            />
          </CalculatorMetricGrid>
          <CalculatorSurface>
            <DonutChart segments={result.monthlyBreakdown} />
          </CalculatorSurface>
          <CalculatorSurface>
            <Subheading>Amortization Snapshot</Subheading>
            <Table striped dense className="mt-4">
              <TableHead>
                <TableRow>
                  <TableHeader>Month</TableHeader>
                  <TableHeader>Rate</TableHeader>
                  <TableHeader>Total</TableHeader>
                  <TableHeader>Balance</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.amortizationTableRows.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell>{formatPercent(row.rate)}</TableCell>
                    <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
                    <TableCell>{formatCurrency(row.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CalculatorSurface>
        </div>
      );
    }
    case "loan": {
      const data = calculatorDefinitions.loan.parseData(calculator.data);
      const result = calculateLoan(data);

      return (
        <div className="space-y-6">
          <CalculatorMetricGrid>
            <CalculatorMetric
              label="Monthly Payment"
              value={formatCurrency(result.monthlyPayment)}
            />
            <CalculatorMetric label="True APR" value={formatPercent(result.trueApr)} />
            <CalculatorMetric
              label="Origination Fees"
              value={formatCurrency(result.totalFees)}
            />
            <CalculatorMetric
              label="Total Interest"
              value={formatCurrency(result.totalInterest)}
            />
          </CalculatorMetricGrid>
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
        </div>
      );
    }
    case "debtPayoff": {
      const data = calculatorDefinitions.debtPayoff.parseData(calculator.data);
      const result = calculateDebtPayoff(data);

      return (
        <div className="space-y-6">
          <CalculatorMetricGrid>
            <CalculatorMetric
              label="Payoff Date"
              value={result.canPayOff ? result.payoffDateLabel : "N/A"}
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
              label="Monthly Payment"
              value={formatCurrency(result.acceleratedMonthlyPayment)}
            />
          </CalculatorMetricGrid>
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
        </div>
      );
    }
  }
}
