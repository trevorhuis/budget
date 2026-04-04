import { formatCurrency } from "~/lib/format";
import type { Account } from "~/lib/schemas";
import {
  accountTypeColors,
  accountTypeLabels,
  type AccountCounts,
} from "~/lib/utils/accountUtils";
import { Badge } from "~/components/ui/badge";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "~/components/ui/description-list";

type Props = {
  accounts: Account[];
  totalBalance: number;
  accountCounts: AccountCounts;
};

export function AccountDescriptionList({
  accounts,
  totalBalance,
  accountCounts,
}: Props) {
  return (
    <DescriptionList className="max-w-3xl">
      <DescriptionTerm>Active accounts</DescriptionTerm>
      <DescriptionDetails>{accounts.length}</DescriptionDetails>

      <DescriptionTerm>Net balance</DescriptionTerm>
      <DescriptionDetails>{formatCurrency(totalBalance)}</DescriptionDetails>

      <DescriptionTerm>Account mix</DescriptionTerm>
      <DescriptionDetails className="flex flex-wrap gap-2">
        {accountCounts.map(({ count, type }) => (
          <Badge key={type} color={accountTypeColors[type]}>
            {count} {accountTypeLabels[type]}
          </Badge>
        ))}
      </DescriptionDetails>
    </DescriptionList>
  );
}
