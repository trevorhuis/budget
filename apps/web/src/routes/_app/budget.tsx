import { createFileRoute } from "@tanstack/react-router";
import { MonthlyBudgetHome } from "../../components/monthly-budget-home";

export const Route = createFileRoute("/_app/budget")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MonthlyBudgetHome />;
}
