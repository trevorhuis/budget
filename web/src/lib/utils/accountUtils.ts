import type { Account } from "~/lib/schemas";

export type AccountCounts = {
  type: Account["type"];
  count: number;
}[];

export const accountTypeLabels: Record<Account["type"], string> = {
  checking: "Checking",
  savings: "Savings",
  creditCard: "Credit card",
};

export const accountTypeColors: Record<
  Account["type"],
  "sky" | "emerald" | "amber"
> = {
  checking: "sky",
  savings: "emerald",
  creditCard: "amber",
};

export const accountTypes = [
  "checking",
  "savings",
  "creditCard",
] as const satisfies Array<Account["type"]>;

export const typeSortOrder: Record<Account["type"], number> = {
  checking: 0,
  savings: 1,
  creditCard: 2,
};

export const sortAccounts = (accounts: readonly Account[]) =>
  [...accounts].sort((left, right) => {
    const typeDifference = typeSortOrder[left.type] - typeSortOrder[right.type];

    if (typeDifference !== 0) {
      return typeDifference;
    }

    return left.name.localeCompare(right.name);
  });

export const getTotalBalance = (accounts: readonly Account[]) =>
  accounts.reduce(
    (runningBalance, account) => runningBalance + account.balance,
    0,
  );

export const getAccountCounts = (accounts: readonly Account[]): AccountCounts => {
  const counts = new Map<Account["type"], number>(
    accountTypes.map((type) => [type, 0]),
  );

  for (const account of accounts) {
    counts.set(account.type, (counts.get(account.type) ?? 0) + 1);
  }

  return accountTypes.map((type) => ({
    type,
    count: counts.get(type) ?? 0,
  }));
};
