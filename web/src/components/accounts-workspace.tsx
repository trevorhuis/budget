import { useLiveQuery } from "@tanstack/react-db";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon,
} from "@heroicons/react/20/solid";
import { type FormEvent, useState } from "react";
import type { Account } from "../lib/schemas";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "./ui/description-list";
import { Field, FieldGroup, Fieldset, Label } from "./ui/fieldset";
import { Heading, Subheading } from "./ui/heading";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Text } from "./ui/text";
import {
  accountCollection,
  createAccount,
} from "../lib/collections/accountCollection";

const accountTypes = [
  "checking",
  "savings",
  "creditCard",
] as const satisfies Array<Account["type"]>;

const accountTypeLabels: Record<Account["type"], string> = {
  checking: "Checking",
  savings: "Savings",
  creditCard: "Credit card",
};

const accountTypeColors: Record<Account["type"], "sky" | "emerald" | "amber"> =
  {
    checking: "sky",
    savings: "emerald",
    creditCard: "amber",
  };

const typeSortOrder: Record<Account["type"], number> = {
  checking: 0,
  savings: 1,
  creditCard: 2,
};

type AccountFormValues = {
  name: string;
  type: Account["type"];
  balance: string;
};

const emptyAccountValues = (): AccountFormValues => ({
  name: "",
  type: "checking",
  balance: "0.00",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const validateAccountValues = (
  values: AccountFormValues,
):
  | {
      error: string;
    }
  | {
      data: {
        name: string;
        type: Account["type"];
        balance: number;
      };
    } => {
  const name = values.name.trim();
  if (!name) {
    return { error: "Account name is required." };
  }

  const balance = Number(values.balance);
  if (!Number.isFinite(balance)) {
    return { error: "Balance must be a valid number." };
  }

  return {
    data: {
      name,
      type: values.type,
      balance,
    },
  };
};

const toFormValues = (account: Account): AccountFormValues => ({
  name: account.name,
  type: account.type,
  balance: account.balance.toFixed(2),
});

function AccountTypeBadge({ type }: { type: Account["type"] }) {
  return (
    <Badge color={accountTypeColors[type]}>{accountTypeLabels[type]}</Badge>
  );
}

export function AccountsWorkspace() {
  const { data } = useLiveQuery((q) => q.from({ account: accountCollection }));

  const accounts = [...(data ?? [])].sort((left, right) => {
    const typeDifference = typeSortOrder[left.type] - typeSortOrder[right.type];

    if (typeDifference !== 0) {
      return typeDifference;
    }

    return left.name.localeCompare(right.name);
  });

  const [createValues, setCreateValues] =
    useState<AccountFormValues>(emptyAccountValues);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Account["id"] | null>(null);
  const [editValues, setEditValues] = useState<AccountFormValues | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalBalance = accounts.reduce(
    (runningBalance, account) => runningBalance + account.balance,
    0,
  );

  const accountCounts = accountTypes.map((type) => ({
    type,
    count: accounts.filter((account) => account.type === type).length,
  }));

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateAccountValues(createValues);
    if ("error" in result) {
      setCreateError(result.error);
      return;
    }

    setCreateError(null);
    setIsCreating(true);

    try {
      await createAccount(result.data);
      setCreateValues(emptyAccountValues());
    } catch {
      setCreateError("Unable to create the account right now.");
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (account: Account) => {
    setEditingId(account.id);
    setEditValues(toFormValues(account));
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues(null);
    setEditError(null);
  };

  const handleSave = async (account: Account) => {
    if (!editValues) {
      return;
    }

    const result = validateAccountValues(editValues);
    if ("error" in result) {
      setEditError(result.error);
      return;
    }

    setEditError(null);
    setIsSaving(true);

    try {
      await Promise.resolve(
        accountCollection.update(account.id, (draft) => {
          draft.name = result.data.name;
          draft.type = result.data.type;
          draft.balance = result.data.balance;
        }),
      );

      cancelEditing();
    } catch (error) {
      console.error(error)
      setEditError("Unable to save this account.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await Promise.resolve(accountCollection.delete(deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError("Unable to delete this account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="grid gap-10 border-b border-zinc-950/6 pb-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(22rem,28rem)] dark:border-white/8">
        <div className="space-y-8">
          <div className="space-y-3">
            <Heading>Accounts</Heading>
            <Text>
              Add, adjust, and remove the accounts that anchor the rest of the
              budget workspace.
            </Text>
          </div>

          <DescriptionList className="max-w-3xl">
            <DescriptionTerm>Active accounts</DescriptionTerm>
            <DescriptionDetails>{accounts.length}</DescriptionDetails>

            <DescriptionTerm>Net balance</DescriptionTerm>
            <DescriptionDetails>
              {formatCurrency(totalBalance)}
            </DescriptionDetails>

            <DescriptionTerm>Account mix</DescriptionTerm>
            <DescriptionDetails className="flex flex-wrap gap-2">
              {accountCounts.map(({ count, type }) => (
                <Badge key={type} color={accountTypeColors[type]}>
                  {count} {accountTypeLabels[type]}
                </Badge>
              ))}
            </DescriptionDetails>
          </DescriptionList>
        </div>

        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-zinc-950/8 bg-zinc-50/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/4"
        >
          <Fieldset>
            <LegendBlock />
            <FieldGroup className="mt-8">
              <Field>
                <Label>Account name</Label>
                <Input
                  value={createValues.name}
                  onChange={(event) =>
                    setCreateValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Everyday checking"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label>Type</Label>
                  <Select
                    value={createValues.type}
                    onChange={(event) =>
                      setCreateValues((current) => ({
                        ...current,
                        type: event.target.value as Account["type"],
                      }))
                    }
                  >
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {accountTypeLabels[type]}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field>
                  <Label>Balance</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={createValues.balance}
                    onChange={(event) =>
                      setCreateValues((current) => ({
                        ...current,
                        balance: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </Field>
              </div>

              {createError ? (
                <Text className="text-red-600 dark:text-red-400">
                  {createError}
                </Text>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Text>
                  Signed balances are allowed for debt and offset accounts.
                </Text>
                <Button type="submit" color="dark/zinc" disabled={isCreating}>
                  <PlusIcon data-slot="icon" />
                  Add account
                </Button>
              </div>
            </FieldGroup>
          </Fieldset>
        </form>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <Subheading>Account list</Subheading>
          <Text>
            Edit balances inline to keep the working surface fast and dense.
          </Text>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-950/10 px-6 py-12 dark:border-white/10">
            <Text>
              No accounts yet. Add the first one to start tracking balances.
            </Text>
          </div>
        ) : (
          <Table dense striped className="mt-2">
            <TableHead>
              <TableRow>
                <TableHeader>Account</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Balance</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => {
                const isEditing = editingId === account.id && editValues;

                return (
                  <TableRow key={account.id}>
                    <TableCell className="align-top">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editValues.name}
                            onChange={(event) =>
                              setEditValues((current) =>
                                current
                                  ? { ...current, name: event.target.value }
                                  : current,
                              )
                            }
                            aria-label={`Edit name for ${account.name}`}
                          />
                          {editError ? (
                            <Text className="text-red-600 dark:text-red-400">
                              {editError}
                            </Text>
                          ) : null}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-medium text-zinc-950 dark:text-white">
                            {account.name}
                          </div>
                          <Text>Updated account balance and details live.</Text>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="align-top">
                      {isEditing ? (
                        <Select
                          value={editValues.type}
                          onChange={(event) =>
                            setEditValues((current) =>
                              current
                                ? {
                                    ...current,
                                    type: event.target.value as Account["type"],
                                  }
                                : current,
                            )
                          }
                          aria-label={`Edit type for ${account.name}`}
                        >
                          {accountTypes.map((type) => (
                            <option key={type} value={type}>
                              {accountTypeLabels[type]}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <AccountTypeBadge type={account.type} />
                      )}
                    </TableCell>

                    <TableCell className="align-top">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editValues.balance}
                          onChange={(event) =>
                            setEditValues((current) =>
                              current
                                ? { ...current, balance: event.target.value }
                                : current,
                            )
                          }
                          aria-label={`Edit balance for ${account.name}`}
                        />
                      ) : (
                        <span className="font-medium text-zinc-950 dark:text-white">
                          {formatCurrency(account.balance)}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="align-top">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              color="dark/zinc"
                              onClick={() => void handleSave(account)}
                              disabled={isSaving}
                            >
                              Save
                            </Button>
                            <Button
                              plain
                              onClick={cancelEditing}
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button plain onClick={() => startEditing(account)}>
                              <PencilSquareIcon data-slot="icon" />
                              Edit
                            </Button>
                            <Button
                              plain
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => setDeleteTarget(account)}
                            >
                              <TrashIcon data-slot="icon" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      <Alert
        open={deleteTarget !== null}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertTitle>Delete account</AlertTitle>
        <AlertDescription>
          {deleteTarget
            ? `Remove ${deleteTarget.name} from the workspace. This action cannot be undone.`
            : "Remove this account from the workspace."}
        </AlertDescription>
        {deleteError ? (
          <Text className="mt-4 text-red-600 dark:text-red-400">
            {deleteError}
          </Text>
        ) : null}
        <AlertActions>
          <Button
            plain
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          >
            Delete account
          </Button>
        </AlertActions>
      </Alert>
    </div>
  );
}

function LegendBlock() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <WalletIcon className="size-5" />
        </span>
        <div>
          <Subheading>Add account</Subheading>
          <Text>
            Create a new balance source without leaving the workspace.
          </Text>
        </div>
      </div>
    </div>
  );
}
