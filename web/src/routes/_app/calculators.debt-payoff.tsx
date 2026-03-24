import { createFileRoute } from "@tanstack/react-router";
import { DebtPayoffCalculatorWorkspace } from "../../components/calculator-workspaces";

export const Route = createFileRoute("/_app/calculators/debt-payoff")({
  component: DebtPayoffCalculatorWorkspace,
});
