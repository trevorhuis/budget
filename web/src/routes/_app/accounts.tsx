/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import type { Account } from "~/lib/schemas";
import type {
  AccountFormValues,
  AccountFormFieldErrors,
} from "~/lib/utils/accountFormUtils";
import {
  accountFormMessages,
  parseAccountFormValues,
  toAccountFormValues,
} from "~/lib/utils/accountFormUtils";
import {
  deleteAccount,
  updateAccount,
} from "~/lib/collections/accountCollection";
import { AccountDescriptionList } from "~/components/accounts/AccountDescriptionList";
import { AccountsTable } from "~/components/accounts/AccountsTable";
import { AddAccountForm } from "~/components/accounts/AddAccountForm";
import { DeleteAccountAlert } from "~/components/accounts/DeleteAccountAlert";
import { useAccountsData } from "~/hooks/useAccountsData";

export const Route = createFileRoute("/_app/accounts")({
  component: AccountsPage,
});

const getFirstAccountFormError = (errors: AccountFormFieldErrors) =>
  errors.name ?? errors.balance ?? accountFormMessages.updateFailure;

function AccountsPage() {
  const {
  accounts,
  accountCounts,
  totalBalance,
} = useAccountsData();

    const [editingId, setEditingId] = useState<Account["id"] | null>(null);
  const [editValues, setEditValues] = useState<AccountFormValues | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const startEditing = (account: Account) => {
    setEditingId(account.id);
    setEditValues(toAccountFormValues(account));
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues(null);
    setEditError(null);
  };

  const handleEditFieldChange = <K extends keyof AccountFormValues>(
    field: K,
    value: AccountFormValues[K],
  ) => {
    setEditValues((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );

    setEditError(null);
  };

  const handleSave = async (account: Account) => {
    if (!editValues) {
      return;
    }

    const parsedValues = parseAccountFormValues(editValues);
    if (!parsedValues.success) {
      setEditError(getFirstAccountFormError(parsedValues.errors));
      return;
    }

    setEditError(null);
    setIsSaving(true);

    try {
      await updateAccount({
        id: account.id,
        ...parsedValues.data,
      });
      cancelEditing();
    } catch {
      setEditError(accountFormMessages.updateFailure);
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
      await deleteAccount(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setDeleteError(accountFormMessages.deleteFailure);
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

          <AccountDescriptionList
            accounts={accounts}
            totalBalance={totalBalance}
            accountCounts={accountCounts}
          />
        </div>

        <AddAccountForm />
      </section>

      <AccountsTable
        accounts={accounts}
        editError={editError}
        editValues={editValues}
        editingId={editingId}
        isSaving={isSaving}
        onCancelEditing={cancelEditing}
        onDelete={setDeleteTarget}
        onSave={handleSave}
        onStartEditing={startEditing}
        onUpdateField={handleEditFieldChange}
      />

      <DeleteAccountAlert
        deleteError={deleteError}
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
