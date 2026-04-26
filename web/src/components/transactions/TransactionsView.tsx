import { motion } from "motion/react";
import type { TransactionTableRow } from "~/components/transactions/TransactionTable";
import type {
  TransactionAccountOption,
  TransactionBudgetLineOption,
} from "~/lib/utils/transactions/options";
import { CreateTransactionForm } from "~/components/transactions/CreateTransactionForm";
import { Heading } from "~/components/ui/heading";
import { TransactionTable } from "~/components/transactions/TransactionTable";
import { TransactionsSummary } from "~/components/transactions/TransactionsSummary";

type TransactionsViewProps = {
  accountOptions: TransactionAccountOption[];
  budgetLineOptions: TransactionBudgetLineOption[];
  summary: {
    creditTotal: number;
    debitTotal: number;
    netBudgetImpact: number;
    totalTransactions: number;
  };
  transactionRows: TransactionTableRow[];
};

export function TransactionsView({
  accountOptions,
  budgetLineOptions,
  summary,
  transactionRows,
}: TransactionsViewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 border-b border-zinc-950/6 pb-6 dark:border-white/8"
    >
      <div className="space-y-4">
        <header>
          <Heading
            level={1}
            className="!text-xl/none !font-semibold tracking-tight sm:!text-2xl/none"
          >
            Transactions
          </Heading>
        </header>
        <TransactionsSummary {...summary} />
      </div>

      <CreateTransactionForm
        accountOptions={accountOptions}
        budgetLineOptions={budgetLineOptions}
      />

      <section className="min-w-0" aria-label="Transaction list and filters">
        <TransactionTable rows={transactionRows} />
      </section>
    </motion.section>
  );
}
