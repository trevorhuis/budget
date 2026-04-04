import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

export function TransactionsHeader() {
  return (
    <div className="space-y-2">
      <Heading>Transactions</Heading>
      <Text>
        Post activity into the ledger, keep budget actuals honest, and scan the
        full transaction stream without leaving the workspace.
      </Text>
    </div>
  );
}
