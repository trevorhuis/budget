import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { type Account, AccountSchema } from "../schemas";
import { uuidv7 } from "uuidv7";

import { API } from "../api";
import { queryClient } from "../integrations/queryClient";

type CreateAccountInput = Pick<Account, "name" | "type" | "balance">;

const normalizeAccount = (account: Account) => ({
  ...account,
  createdAt: account.createdAt ? new Date(account.createdAt) : undefined,
  updatedAt: account.updatedAt ? new Date(account.updatedAt) : undefined,
});

const normalizeAccountUpdate = (account: Account) => ({
  name: account.name,
  type: account.type,
  balance: account.balance,
});

export const accountCollection = createCollection(
  queryCollectionOptions({
    schema: AccountSchema,
    queryClient,
    queryKey: ["accounts"],
    getKey: (account) => account.id,
    queryFn: async () => {
      const { data } = await API.accounts.fetch();
      return data.map(normalizeAccount);
    },
    onUpdate: async ({ transaction }) => {
      const { modified, original } = transaction.mutations[0];

      await API.accounts.update(original.id, normalizeAccountUpdate(modified));
    },
    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].modified;

      await API.accounts.delete(item.id);
    },
  }),
);

export const createAccount = async (account: CreateAccountInput) => {
  await API.accounts.create({
    ...account,
    id: uuidv7(),
  });

  await accountCollection.utils.refetch();
};
