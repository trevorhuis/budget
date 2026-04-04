import type { Account } from "~/lib/schemas";
import type { AccountFormValues } from "~/lib/utils/accountFormUtils";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { EditableAccountRow } from "~/components/accounts/EditableAccountRow";

type AccountsTableProps = {
  accounts: Account[];
  editError: string | null;
  editValues: AccountFormValues | null;
  editingId: Account["id"] | null;
  isSaving: boolean;
  onCancelEditing: () => void;
  onDelete: (account: Account) => void;
  onSave: (account: Account) => void;
  onStartEditing: (account: Account) => void;
  onUpdateField: <K extends keyof AccountFormValues>(
    field: K,
    value: AccountFormValues[K],
  ) => void;
};

export function AccountsTable({
  accounts,
  editError,
  editValues,
  editingId,
  isSaving,
  onCancelEditing,
  onDelete,
  onSave,
  onStartEditing,
  onUpdateField,
}: AccountsTableProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Subheading>Account list</Subheading>
        <Text>Edit balances inline to keep the working surface fast and dense.</Text>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-950/10 px-6 py-12 dark:border-white/10">
          <Text>No accounts yet. Add the first one to start tracking balances.</Text>
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
            {accounts.map((account) => (
              <EditableAccountRow
                key={account.id}
                account={account}
                editError={editingId === account.id ? editError : null}
                editValues={editingId === account.id ? editValues : null}
                isEditing={editingId === account.id}
                isSaving={isSaving}
                onCancelEditing={onCancelEditing}
                onDelete={onDelete}
                onSave={onSave}
                onStartEditing={onStartEditing}
                onUpdateField={onUpdateField}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
