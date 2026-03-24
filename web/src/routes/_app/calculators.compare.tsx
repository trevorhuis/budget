import { createFileRoute } from "@tanstack/react-router";
import { CalculatorCompareWorkspace } from "../../components/calculator-workspaces";

export const Route = createFileRoute("/_app/calculators/compare")({
  component: CalculatorCompareWorkspace,
});
