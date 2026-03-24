import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { TransactionsWorkspace } from "../../components/transactions-workspace";

export const Route = createFileRoute("/_app/transactions")({
  component: function TransactionsRouteComponent() {
    const pathname = useRouterState({
      select: (state) => state.location.pathname,
    });

    if (pathname === "/transactions") {
      return <TransactionsWorkspace />;
    }

    return <Outlet />;
  },
});
