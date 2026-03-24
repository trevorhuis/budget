import { createFileRoute } from "@tanstack/react-router";
import { MortgageCalculatorWorkspace } from "../../components/calculator-workspaces";

export const Route = createFileRoute("/_app/calculators/mortgage")({
  component: MortgageCalculatorWorkspace,
});
