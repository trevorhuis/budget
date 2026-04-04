import { Heading } from "~/components/ui/heading";

export function TransactionsHeader() {
  return (
    <header>
      <Heading
        level={1}
        className="!text-xl/none !font-semibold tracking-tight sm:!text-2xl/none"
      >
        Transactions
      </Heading>
    </header>
  );
}
