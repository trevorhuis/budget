import { createFileRoute } from "@tanstack/react-router";
import { BulkTransactionsWorkspace } from "../../components/bulk-transactions-workspace";

export const Route = createFileRoute("/_app/transactions/bulk")({
  component: BulkTransactionsWorkspace,
});
