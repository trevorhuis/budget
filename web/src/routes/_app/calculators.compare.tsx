/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";

import { CalculatorCompare } from "~/components/calculators/CalculatorCompare";

export const Route = createFileRoute("/_app/calculators/compare")({
  component: CalculatorComparePage,
});

function CalculatorComparePage() {
  return <CalculatorCompare />;
}
