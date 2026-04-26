import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import type { Account } from "~/lib/schemas";
import type { AccountFormValues } from "~/lib/utils/accountFormUtils";
import { accountTypeLabels, accountTypes } from "~/lib/utils/accountUtils";
import { formatCurrency } from "~/lib/utils/budgetUtils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { TableCell, TableRow } from "~/components/ui/table";
import { Text } from "~/components/ui/text";
import { AccountTypeBadge } from "~/components/accounts/AccountTypeBadge";

type EditableAccountRowProps = {
  account: Account;
  editError: string | null;
  editValues: AccountFormValues | null;
  isEditing: boolean;
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

export function EditableAccountRow({
  account,
  editError,
  editValues,
  isEditing,
  isSaving,
  onCancelEditing,
  onDelete,
  onSave,
  onStartEditing,
  onUpdateField,
}: EditableAccountRowProps) {
  return (
    <TableRow>
      <TableCell className="align-top">
        {isEditing && editValues ? (
          <div className="space-y-2">
            <Input
              value={editValues.name}
              onChange={(event) => onUpdateField("name", event.target.value)}
              aria-label={`Edit name for ${account.name}`}
            />
            {editError ? (
              <Text className="text-red-600 dark:text-red-400">{editError}</Text>
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
        {isEditing && editValues ? (
          <Select
            value={editValues.type}
            onChange={(event) =>
              onUpdateField("type", event.target.value as Account["type"])
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
        {isEditing && editValues ? (
          <Input
            type="number"
            step="0.01"
            value={editValues.balance}
            onChange={(event) => onUpdateField("balance", event.target.value)}
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
                onClick={() => void onSave(account)}
                disabled={isSaving}
                type="button"
              >
                Save
              </Button>
              <Button
                plain
                onClick={onCancelEditing}
                disabled={isSaving}
                type="button"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button plain onClick={() => onStartEditing(account)} type="button">
                <PencilSquareIcon data-slot="icon" />
                Edit
              </Button>
              <Button
                plain
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                onClick={() => onDelete(account)}
                type="button"
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
}
