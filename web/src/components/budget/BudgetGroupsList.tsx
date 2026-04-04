import { motion } from "motion/react";
import type { BudgetItem } from "~/lib/schemas";
import type { BudgetGroup } from "~/lib/utils/budgetUtils";
import { BudgetGroupSection } from "~/components/budget/BudgetGroupSection";

type BudgetGroupsListProps = {
  editingBudgetItemId: BudgetItem["id"] | null;
  editingTargetAmount: string;
  groups: BudgetGroup[];
  isSaving: boolean;
  saveError: string | null;
  onCancelEditing: () => void;
  onEditingTargetAmountChange: (value: string) => void;
  onSaveBudgetItem: (budgetItem: BudgetItem) => void;
  onStartEditing: (budgetItem: BudgetItem) => void;
};

export function BudgetGroupsList({
  editingBudgetItemId,
  editingTargetAmount,
  groups,
  isSaving,
  saveError,
  onCancelEditing,
  onEditingTargetAmountChange,
  onSaveBudgetItem,
  onStartEditing,
}: BudgetGroupsListProps) {
  return (
    <div className="space-y-10">
      {groups.map((group, index) => (
        <motion.section
          key={group.group}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.05,
            duration: 0.3,
            ease: "easeOut",
          }}
          className="space-y-4"
        >
          <BudgetGroupSection
            editingBudgetItemId={editingBudgetItemId}
            editingTargetAmount={editingTargetAmount}
            group={group}
            isSaving={isSaving}
            saveError={saveError}
            onCancelEditing={onCancelEditing}
            onEditingTargetAmountChange={onEditingTargetAmountChange}
            onSaveBudgetItem={onSaveBudgetItem}
            onStartEditing={onStartEditing}
          />
        </motion.section>
      ))}
    </div>
  );
}
