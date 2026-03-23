import { createFileRoute } from "@tanstack/react-router";
import { AccountsWorkspace } from "../../components/accounts-workspace";

export const Route = createFileRoute("/_app/accounts")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AccountsWorkspace />;
}
