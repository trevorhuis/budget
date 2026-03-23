import { createFileRoute } from "@tanstack/react-router";
import { LoanCalculatorWorkspace } from "../../components/calculator-workspaces";

export const Route = createFileRoute("/_app/calculators/loan")({
  component: LoanCalculatorWorkspace,
});
