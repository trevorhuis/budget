import { PlusIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
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
import { BudgetGroupInlineAddForm } from "~/components/budget/BudgetGroupInlineAddForm";
import { EditableBudgetItemRow } from "~/components/budget/EditableBudgetItemRow";

type BudgetGroupSectionProps = {
  budgetId: string;
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
  budgetId,
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
  const [showAddLine, setShowAddLine] = useState(false);

  const lineCount = group.rows.length;
  const linesLabel =
    lineCount === 1 ? "1 line visible" : `${lineCount} lines visible`;

  return (
    <div
      className={[
        "overflow-hidden rounded-[1.75rem] border bg-white/75 dark:bg-white/4",
        tone.border,
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-zinc-950/8 bg-zinc-950/[0.025] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <div className={["h-9 w-1 shrink-0 rounded-full", tone.bar].join(" ")} />
            <div className="min-w-0 space-y-0.5">
              <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                {group.group}
              </div>
              <Text className="text-sm/5 text-zinc-500 dark:text-zinc-400">
                {linesLabel}
              </Text>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
            <div className="flex w-[6.75rem] shrink-0 flex-col gap-1">
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Target
              </div>
              <div className="flex h-8 items-center">
                <span className="font-semibold tabular-nums text-zinc-950 dark:text-white">
                  {formatCurrency(group.targetAmount)}
                </span>
              </div>
            </div>
            <div className="flex w-[6.75rem] shrink-0 flex-col gap-1">
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Actual
              </div>
              <div className="flex h-8 items-center">
                <span className="font-semibold tabular-nums text-zinc-950 dark:text-white">
                  {formatCurrency(group.actualAmount)}
                </span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Pace
              </div>
              <div className="flex h-8 items-center">
                <Badge color={tone.chip}>
                  {group.isIncome ? "Income" : "Expense"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Button
          color="dark/zinc"
          type="button"
          className="shrink-0"
          onClick={() => setShowAddLine((open) => !open)}
        >
          <PlusIcon data-slot="icon" />
          Add line
        </Button>
      </div>

      {showAddLine ? (
        <div className="border-b border-zinc-950/8 bg-zinc-950/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
          <BudgetGroupInlineAddForm
            budgetId={budgetId}
            groupName={group.group}
            onClose={() => setShowAddLine(false)}
          />
        </div>
      ) : null}

      <Table dense striped className="border-0" tableClassName="table-fixed">
        <colgroup>
          <col />
          <col style={{ width: "6.75rem" }} />
          <col style={{ width: "6.75rem" }} />
          <col />
          <col style={{ width: "9rem" }} />
          <col style={{ width: "5rem" }} />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableHeader>Category</TableHeader>
            <TableHeader className="text-right">Target</TableHeader>
            <TableHeader className="text-right">Actual</TableHeader>
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
