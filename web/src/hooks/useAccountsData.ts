import { useLiveQuery } from "@tanstack/react-db";
import { accountCollection } from "~/lib/collections/accountCollection";
import {
  getAccountCounts,
  getTotalBalance,
  sortAccounts,
} from "~/lib/utils/accountUtils";

export const useAccountsData = () => {
  const { data } = useLiveQuery((q) => q.from({ account: accountCollection }));
  const accounts = sortAccounts(data ?? []);
  const totalBalance = getTotalBalance(accounts);
  const accountCounts = getAccountCounts(accounts);

  return { accounts, totalBalance, accountCounts };
};
