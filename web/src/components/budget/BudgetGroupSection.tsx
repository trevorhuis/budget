import { Badge } from "~/components/ui/badge";
import { Subheading } from "~/components/ui/heading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { BudgetItem } from "~/lib/schemas";
import {
  formatCurrency,
  getBudgetGroupTone,
  type BudgetGroup,
} from "~/lib/utils/budgetUtils";
import { EditableBudgetItemRow } from "~/components/budget/EditableBudgetItemRow";

type BudgetGroupSectionProps = {
  editingBudgetItemId: BudgetItem["id"] | null;
  editingTargetAmount: string;
  group: BudgetGroup;
  isSaving: boolean;
  saveError: string | null;
  onCancelEditing: () => void;
  onEditingTargetAmountChange: (value: string) => void;
  onSaveBudgetItem: (budgetItem: BudgetItem) => void;
  onStartEditing: (budgetItem: BudgetItem) => void;
};

export function BudgetGroupSection({
  editingBudgetItemId,
  editingTargetAmount,
  group,
  isSaving,
  saveError,
  onCancelEditing,
  onEditingTargetAmountChange,
  onSaveBudgetItem,
  onStartEditing,
}: BudgetGroupSectionProps) {
  const tone = getBudgetGroupTone(group.isIncome);

  return (
    <div className="space-y-4">
      <div
        className={[
          "grid gap-4 rounded-2xl border bg-zinc-950/[0.02] px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center dark:bg-white/[0.03]",
          tone.border,
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <div className={["h-10 w-1 rounded-full", tone.bar].join(" ")} />
          <div className="space-y-0.5">
            <Subheading className="text-lg/6 sm:text-base/6">
              {group.group}
            </Subheading>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              {group.rows.length} items
            </div>
          </div>
        </div>
        <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3 sm:justify-self-end">
          <div>
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Target
            </div>
            <div className="font-semibold tabular-nums text-zinc-950 dark:text-white">
              {formatCurrency(group.targetAmount)}
            </div>
          </div>
          <div>
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Actual
            </div>
            <div className="font-semibold tabular-nums text-zinc-950 dark:text-white">
              {formatCurrency(group.actualAmount)}
            </div>
          </div>
          <div>
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Pace
            </div>
            <div className="pt-0.5">
              <Badge color={tone.chip}>
                {group.isIncome ? "Income" : "Expense"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Table dense striped>
        <TableHead>
          <TableRow>
            <TableHeader>Category</TableHeader>
            <TableHeader>Target</TableHeader>
            <TableHeader>Actual</TableHeader>
            <TableHeader>Variance</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {group.rows.map((row) => (
            <EditableBudgetItemRow
              key={row.budgetItem.id}
              editingTargetAmount={editingTargetAmount}
              isEditing={editingBudgetItemId === row.budgetItem.id}
              isSaving={isSaving}
              row={row}
              saveError={
                editingBudgetItemId === row.budgetItem.id ? saveError : null
              }
              onCancel={onCancelEditing}
              onEditingTargetAmountChange={onEditingTargetAmountChange}
              onSave={onSaveBudgetItem}
              onStartEditing={onStartEditing}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
