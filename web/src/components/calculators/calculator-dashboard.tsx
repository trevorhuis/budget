import {
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import { useState } from "react";

import { buildCompareUrl, formatCurrency, getScenarioDisplay } from "~/lib/calculators";
import type { Calculator } from "~/lib/schemas";
import { useCalculatorScenarioActions } from "~/hooks/calculators/useCalculatorScenarioActions";
import { useCalculatorScenarios } from "~/hooks/calculators/useCalculatorScenarios";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Text } from "~/components/ui/text";
import { CalculatorFeedbackBanner } from "~/components/calculators/calculator-states";
import { CalculatorSurface } from "~/components/calculators/calculator-surface";
import { formatDateTime } from "~/lib/calculators";

export function CalculatorDashboard() {
  const { scenarios } = useCalculatorScenarios();
  const actions = useCalculatorScenarioActions();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (calculatorId: string) => {
    setSelectedIds((current) => {
      if (current.includes(calculatorId)) {
        return current.filter((id) => id !== calculatorId);
      }

      return [...current.slice(-1), calculatorId];
    });
  };

  const openSelectedCompare = () => {
    if (selectedIds.length !== 2) {
      return;
    }

    window.location.assign(buildCompareUrl(selectedIds[0], selectedIds[1]));
  };

  return (
    <div className="space-y-8">
      <CalculatorSurface className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.92),_rgba(244,244,245,0.95))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,_rgba(24,24,27,0.94),_rgba(9,9,11,0.92))]">
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="emerald">Saved Scenarios</Badge>
          <Badge color="sky">{scenarios.length} total</Badge>
        </div>
        <Heading className="mt-4">Scenario Library</Heading>
        <Text className="mt-2 max-w-2xl">
          Name each model, duplicate it for what-if branches, then compare two saved
          scenarios side by side before you commit.
        </Text>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/calculators/mortgage">
            <SparklesIcon />
            New Mortgage Scenario
          </Button>
          <Button color="white" href="/calculators/loan">
            <Squares2X2Icon />
            New Loan Scenario
          </Button>
          <Button color="white" href="/calculators/debt-payoff">
            <ArrowPathRoundedSquareIcon />
            New Debt Scenario
          </Button>
          <Button plain onClick={openSelectedCompare} disabled={selectedIds.length !== 2}>
            <ArrowsRightLeftIcon />
            Compare Selected
          </Button>
        </div>
        {actions.feedback ? <CalculatorFeedbackBanner message={actions.feedback} /> : null}
      </CalculatorSurface>
      <CalculatorSurface>
        <Table striped className="mt-2">
          <TableHead>
            <TableRow>
              <TableHeader>Compare</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Monthly</TableHeader>
              <TableHeader>Total Interest</TableHeader>
              <TableHeader>Last Modified</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {scenarios.map((calculator) => (
              <CalculatorDashboardRow
                key={calculator.id}
                calculator={calculator}
                isSelected={selectedIds.includes(calculator.id)}
                isWorking={actions.workingId === calculator.id}
                onDuplicate={() => actions.duplicateScenario(calculator)}
                onOpen={() => actions.openScenario(calculator)}
                onPdf={() => actions.openScenarioPdf(calculator)}
                onShare={() => actions.shareScenario(calculator)}
                onToggleSelection={() => toggleSelection(calculator.id)}
              />
            ))}
          </TableBody>
        </Table>
      </CalculatorSurface>
    </div>
  );
}

function CalculatorDashboardRow({
  calculator,
  isSelected,
  isWorking,
  onDuplicate,
  onOpen,
  onPdf,
  onShare,
  onToggleSelection,
}: {
  calculator: Calculator;
  isSelected: boolean;
  isWorking: boolean;
  onDuplicate: () => void;
  onOpen: () => void;
  onPdf: () => void;
  onShare: () => void;
  onToggleSelection: () => void;
}) {
  const { definition, summary } = getScenarioDisplay(calculator);

  return (
    <TableRow>
      <TableCell>
        <input type="checkbox" checked={isSelected} onChange={onToggleSelection} />
      </TableCell>
      <TableCell>
        <button
          type="button"
          onClick={onOpen}
          className="text-left font-medium text-zinc-950 hover:text-sky-600 dark:text-white dark:hover:text-sky-400"
        >
          {calculator.name}
        </button>
      </TableCell>
      <TableCell>
        <Badge color="sky">{definition.label}</Badge>
      </TableCell>
      <TableCell>{formatCurrency(summary.monthlyPayment)}</TableCell>
      <TableCell>{formatCurrency(summary.totalInterest)}</TableCell>
      <TableCell>{formatDateTime(calculator.updatedAt)}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <Button plain onClick={onOpen}>
            Open
          </Button>
          <Button plain onClick={onDuplicate} disabled={isWorking}>
            Duplicate
          </Button>
          <Button plain onClick={onShare} disabled={isWorking}>
            Share
          </Button>
          <Button plain onClick={onPdf} disabled={isWorking}>
            PDF
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

