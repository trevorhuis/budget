import type { Account } from "~/lib/schemas";
import {
  accountTypeColors,
  accountTypeLabels,
} from "~/lib/utils/accountUtils";
import { Badge } from "~/components/ui/badge";

export const AccountTypeBadge = ({ type }: { type: Account["type"] }) => {
  return (
    <Badge color={accountTypeColors[type]}>{accountTypeLabels[type]}</Badge>
  );
};
