import {
  ArrowPathRoundedSquareIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/20/solid";
import { formatTransactionCurrency } from "~/lib/utils/transactions/format";
import { Badge } from "~/components/ui/badge";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "~/components/ui/description-list";
import { Text } from "~/components/ui/text";

type TransactionsSummaryProps = {
  activeBudgetLines: number;
  creditTotal: number;
  debitTotal: number;
  netBudgetImpact: number;
  totalTransactions: number;
};

export function TransactionsSummary({
  activeBudgetLines,
  creditTotal,
  debitTotal,
  netBudgetImpact,
  totalTransactions,
}: TransactionsSummaryProps) {
  return (
    <div className="space-y-6">
      <DescriptionList className="max-w-3xl [&>dd]:pb-2.5 [&>dd]:pt-0.5 [&>dt]:pt-2.5 sm:[&>dd]:py-2.5 sm:[&>dt]:py-2.5">
        <DescriptionTerm>Total transactions</DescriptionTerm>
        <DescriptionDetails>{totalTransactions}</DescriptionDetails>

        <DescriptionTerm>Debit flow</DescriptionTerm>
        <DescriptionDetails>
          {formatTransactionCurrency(debitTotal)}
        </DescriptionDetails>

        <DescriptionTerm>Credit flow</DescriptionTerm>
        <DescriptionDetails className="font-medium text-emerald-600 dark:text-emerald-400">
          {formatTransactionCurrency(creditTotal)}
        </DescriptionDetails>

        <DescriptionTerm>Net budget impact</DescriptionTerm>
        <DescriptionDetails
          className={
            netBudgetImpact >= 0
              ? "font-medium text-zinc-950 dark:text-white"
              : "font-medium text-emerald-600 dark:text-emerald-400"
          }
        >
          {formatTransactionCurrency(netBudgetImpact)}
        </DescriptionDetails>
      </DescriptionList>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-950/8 px-4 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Badge color="sky">
              <ArrowPathRoundedSquareIcon className="size-4" />
              Live sync
            </Badge>
          </div>
          <Text className="mt-2.5">
            Debits raise the selected budget line&apos;s actual spend. Credits
            reduce it immediately in the client before the API round-trip
            finishes.
          </Text>
        </div>

        <div className="rounded-2xl border border-zinc-950/8 px-4 py-3.5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Badge color="amber">
              <ReceiptPercentIcon className="size-4" />
              Budget lines touched
            </Badge>
          </div>
          <div className="mt-2.5 font-medium text-zinc-950 dark:text-white">
            {activeBudgetLines}
          </div>
          <Text>Distinct budget lines with posted transaction activity.</Text>
        </div>
      </div>
    </div>
  );
}
