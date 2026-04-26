import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";

import { CalculatorDashboard } from "~/components/calculators/CalculatorDashboard";

export const Route = createFileRoute("/_app/calculators")({
  component: function CalculatorsRouteComponent() {
    const pathname = useRouterState({
      select: (state) => state.location.pathname,
    });

    if (pathname === "/calculators") {
      return <CalculatorDashboard />;
    }

    return <Outlet />;
  },
});
