import { createFileRoute } from "@tanstack/react-router";
import { useBudgetData } from "../hooks/useBudgetData";

export const Route = createFileRoute("/budget")({
  component: RouteComponent,
});

function RouteComponent() {
  const budgetData = useBudgetData(3, 2026);
  return <div>ca</div>;
}
