import { createFileRoute } from "@tanstack/react-router";
import { SharedCalculatorReport } from "../components/calculator-workspaces";

export const Route = createFileRoute("/shared/calculators/$shareToken")({
  component: SharedCalculatorRouteComponent,
});

function SharedCalculatorRouteComponent() {
  const { shareToken } = Route.useParams();

  return <SharedCalculatorReport shareToken={shareToken} />;
}
