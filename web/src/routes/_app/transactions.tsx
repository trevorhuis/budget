import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { TransactionsPage } from "~/components/transactions/TransactionsPage";

export const Route = createFileRoute("/_app/transactions")({
  component: function TransactionsRouteComponent() {
    const pathname = useRouterState({
      select: (state) => state.location.pathname,
    });

    if (pathname === "/transactions") {
      return <TransactionsPage />;
    }

    return <Outlet />;
  },
});
