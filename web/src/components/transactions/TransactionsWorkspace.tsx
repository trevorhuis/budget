import { motion } from "motion/react";
import type { TransactionTableRow } from "~/components/transactions/TransactionTable";
import type {
  TransactionAccountOption,
  TransactionBudgetLineOption,
} from "~/lib/utils/transactions/options";
import { CreateTransactionForm } from "~/components/transactions/CreateTransactionForm";
import { TransactionsHeader } from "~/components/transactions/TransactionsHeader";
import { TransactionsLedgerSection } from "~/components/transactions/TransactionsLedgerSection";
import { TransactionsSummary } from "~/components/transactions/TransactionsSummary";

type TransactionsWorkspaceProps = {
  accountOptions: TransactionAccountOption[];
  budgetLineOptions: TransactionBudgetLineOption[];
  summary: {
    activeBudgetLines: number;
    creditTotal: number;
    debitTotal: number;
    netBudgetImpact: number;
    totalTransactions: number;
  };
  transactionRows: TransactionTableRow[];
};

export function TransactionsWorkspace({
  accountOptions,
  budgetLineOptions,
  summary,
  transactionRows,
}: TransactionsWorkspaceProps) {
  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="grid gap-8 border-b border-zinc-950/6 pb-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,30rem)] dark:border-white/8"
      >
        <div className="space-y-6">
          <TransactionsHeader />
          <TransactionsSummary {...summary} />
        </div>

        <CreateTransactionForm
          accountOptions={accountOptions}
          budgetLineOptions={budgetLineOptions}
        />
      </motion.section>

      <TransactionsLedgerSection rows={transactionRows} />
    </div>
  );
}
