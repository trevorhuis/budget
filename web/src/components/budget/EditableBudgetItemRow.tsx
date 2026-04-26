import type { BudgetItem } from "~/lib/schemas";
import {
  formatCurrency,
  getBudgetStatusBadge,
  getBudgetVarianceLabel,
  type BudgetRow,
} from "~/lib/utils/budgetUtils";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  TableCell,
  TableRow,
} from "~/components/ui/table";
import { Text } from "~/components/ui/text";

type EditableBudgetItemRowProps = {
  editingTargetAmount: string;
  isEditing: boolean;
  isSaving: boolean;
  row: BudgetRow;
  saveError: string | null;
  onCancel: () => void;
  onEditingTargetAmountChange: (value: string) => void;
  onSave: (budgetItem: BudgetItem) => void;
  onStartEditing: (budgetItem: BudgetItem) => void;
};

export function EditableBudgetItemRow({
  editingTargetAmount,
  isEditing,
  isSaving,
  row,
  saveError,
  onCancel,
  onEditingTargetAmountChange,
  onSave,
  onStartEditing,
}: EditableBudgetItemRowProps) {
  const status = getBudgetStatusBadge(row);

  return (
    <TableRow>
      <TableCell className="align-middle">
        <span className="font-medium text-zinc-950 dark:text-white">
          {row.category.name}
        </span>
      </TableCell>
      <TableCell className="align-middle text-right">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              type="number"
              step="0.01"
              value={editingTargetAmount}
              onChange={(event) =>
                onEditingTargetAmountChange(event.target.value)
              }
              className="text-right tabular-nums"
            />
            {saveError ? (
              <Text className="text-left text-rose-600 dark:text-rose-400">
                {saveError}
              </Text>
            ) : null}
          </div>
        ) : (
          <span className="font-medium tabular-nums text-zinc-950 dark:text-white">
            {formatCurrency(row.budgetItem.targetAmount)}
          </span>
        )}
      </TableCell>
      <TableCell className="align-middle text-right font-medium tabular-nums text-zinc-950 dark:text-white">
        {formatCurrency(row.budgetItem.actualAmount)}
      </TableCell>
      <TableCell className="align-middle text-right font-medium tabular-nums">
        {getBudgetVarianceLabel(row)}
      </TableCell>
      <TableCell className="align-middle">
        <Badge color={status.color}>{status.label}</Badge>
      </TableCell>
      <TableCell className="align-middle">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                color="dark/zinc"
                onClick={() => onSave(row.budgetItem)}
                disabled={isSaving}
              >
                Save
              </Button>
              <Button plain onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            </>
          ) : (
            <Button plain onClick={() => onStartEditing(row.budgetItem)}>
              Edit
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
