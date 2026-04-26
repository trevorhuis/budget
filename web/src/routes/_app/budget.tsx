/* eslint-disable react-refresh/only-export-components */

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { AddBudgetItemDialog } from "~/components/budget/AddBudgetItemDialog";
import { AddCategoryDialog } from "~/components/budget/AddCategoryDialog";
import { BudgetCreateState } from "~/components/budget/BudgetCreateState";
import { BudgetEmptyState } from "~/components/budget/BudgetEmptyState";
import { BudgetGroupsList } from "~/components/budget/BudgetGroupsList";
import { BudgetHeader } from "~/components/budget/BudgetHeader";
import { BudgetPlanningPanel } from "~/components/budget/BudgetPlanningPanel";
import { BudgetQuickAddStrip } from "~/components/budget/BudgetQuickAddStrip";
import { BudgetSummary } from "~/components/budget/BudgetSummary";
import { useMonthlyBudgetData } from "~/hooks/useMonthlyBudgetData";
import { createBudget } from "~/lib/collections/budgetCollection";
import { updateBudgetItemTarget } from "~/lib/collections/budgetItemCollection";
import type { BudgetItem } from "~/lib/schemas";
import { budgetFormMessages } from "~/lib/utils/budgetFormShared";
import {
  formatMonthInputValue,
  formatMonthLabel,
  parseAmountInput,
  parseMonthInputValue,
} from "~/lib/utils/budgetUtils";

export const Route = createFileRoute("/_app/budget")({
  component: BudgetPage,
});

type EditingState = {
  budgetItemId: BudgetItem["id"];
  targetAmount: string;
};

function BudgetPage() {
  const [selectedMonthValue, setSelectedMonthValue] = useState(() =>
    formatMonthInputValue(new Date()),
  );
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [isAddBudgetItemOpen, setIsAddBudgetItemOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isCreatingBudget, setIsCreatingBudget] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { month, year } = useMemo(
    () => parseMonthInputValue(selectedMonthValue),
    [selectedMonthValue],
  );

  const budgetData = useMonthlyBudgetData(month, year);
  const monthLabel = formatMonthLabel(month, year);

  const {
    actualSpending,
    availableCategories,
    budget,
    expectedExpenses,
    expectedIncome,
    groups,
    knownGroups,
    overspentCategories,
    plannedNet,
  } = budgetData;

  const createMonthBudget = async () => {
    setBudgetError(null);
    setIsCreatingBudget(true);

    try {
      await createBudget({ month, year });
    } catch {
      setBudgetError(budgetFormMessages.createBudgetFailure);
    } finally {
      setIsCreatingBudget(false);
    }
  };

  const startEditing = (budgetItem: BudgetItem) => {
    setEditingState({
      budgetItemId: budgetItem.id,
      targetAmount: budgetItem.targetAmount.toFixed(2),
    });
    setSaveError(null);
  };

  const stopEditing = () => {
    setEditingState(null);
    setSaveError(null);
  };

  const updateEditingTargetAmount = (targetAmount: string) => {
    setEditingState((current) =>
      current
        ? {
            ...current,
            targetAmount,
          }
        : current,
    );
    setSaveError(null);
  };

  const saveBudgetItem = async (budgetItem: BudgetItem) => {
    if (!editingState) {
      return;
    }

    const nextTargetAmount = parseAmountInput(editingState.targetAmount);

    if (nextTargetAmount === null) {
      setSaveError(budgetFormMessages.invalidTargetAmount);
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      await updateBudgetItemTarget({
        id: budgetItem.id,
        targetAmount: nextTargetAmount,
      });
      stopEditing();
    } catch {
      setSaveError(budgetFormMessages.updateBudgetItemFailure);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-6 border-b border-(--color-ink-100) pb-8"
      >
        <BudgetHeader
          monthLabel={monthLabel}
          selectedMonthValue={selectedMonthValue}
          onSelectedMonthValueChange={setSelectedMonthValue}
        />

        <BudgetSummary
          actualSpending={actualSpending}
          expectedExpenses={expectedExpenses}
          expectedIncome={expectedIncome}
          monthLabel={monthLabel}
          overspentCategories={overspentCategories}
          plannedNet={plannedNet}
        />

        <BudgetPlanningPanel
          budgetId={budget?.id ?? null}
          hasKnownGroups={knownGroups.length > 0}
          monthLabel={monthLabel}
        />
      </motion.section>

      {!budget ? (
        <BudgetCreateState
          errorMessage={budgetError}
          isCreating={isCreatingBudget}
          monthLabel={monthLabel}
          onCreate={() => void createMonthBudget()}
        />
      ) : (
        <>
          {groups.length === 0 ? (
            <BudgetEmptyState
              monthLabel={monthLabel}
              hasAvailableCategories={availableCategories.length > 0}
              onAddCategory={() => setIsAddCategoryOpen(true)}
              onAddBudgetItem={() => setIsAddBudgetItemOpen(true)}
            />
          ) : (
            <>
              <BudgetGroupsList
                budgetId={budget.id}
                editingBudgetItemId={editingState?.budgetItemId ?? null}
                editingTargetAmount={editingState?.targetAmount ?? ""}
                groups={groups}
                isSaving={isSaving}
                saveError={saveError}
                onCancelEditing={stopEditing}
                onEditingTargetAmountChange={updateEditingTargetAmount}
                onSaveBudgetItem={(budgetItem) => void saveBudgetItem(budgetItem)}
                onStartEditing={startEditing}
              />
              <BudgetQuickAddStrip
                canAddBudgetItem={availableCategories.length > 0}
                onAddBudgetItem={() => setIsAddBudgetItemOpen(true)}
                onAddCategory={() => setIsAddCategoryOpen(true)}
              />
            </>
          )}
        </>
      )}

      <AddBudgetItemDialog
        availableCategories={availableCategories}
        budgetId={budget?.id ?? null}
        monthLabel={monthLabel}
        open={isAddBudgetItemOpen}
        onClose={() => setIsAddBudgetItemOpen(false)}
      />

      <AddCategoryDialog
        budgetId={budget?.id ?? null}
        knownGroups={knownGroups}
        monthLabel={monthLabel}
        open={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
      />
    </div>
  );
}
