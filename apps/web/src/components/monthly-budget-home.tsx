import { motion } from "motion/react";
import { PlusIcon } from "@heroicons/react/20/solid";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { BudgetItem } from "schemas";
import { createBudget } from "../lib/collections/budgetCollection";
import {
  budgetItemCollection,
  createBudgetItem,
} from "../lib/collections/budgetItemCollection";
import { createCategory } from "../lib/collections/categoryCollection";
import { useMonthlyBudgetWorkspace } from "../hooks/useMonthlyBudgetWorkspace";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
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

type AddBudgetItemValues = {
  categoryId: string;
  targetAmount: string;
};

type AddCategoryValues = {
  name: string;
  group: string;
  targetAmount: string;
};

type EditingState = {
  budgetItemId: BudgetItem["id"];
  targetAmount: string;
};

const emptyAddBudgetItemValues = (): AddBudgetItemValues => ({
  categoryId: "",
  targetAmount: "",
});

const emptyAddCategoryValues = (): AddCategoryValues => ({
  name: "",
  group: "",
  targetAmount: "",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatMonthInputValue = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
};

const parseMonthInputValue = (value: string) => {
  const [year, month] = value.split("-").map(Number);

  return {
    year,
    month,
  };
};

const formatMonthLabel = (month: number, year: number) =>
  monthFormatter.format(new Date(year, month - 1, 1));

const parseAmount = (value: string) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
};

const getStatusBadge = (row: {
  isIncome: boolean;
  status: "funded" | "pending" | "on-track" | "tight" | "overspent";
}) => {
  if (row.isIncome) {
    return row.status === "funded"
      ? { label: "Funded", color: "emerald" as const }
      : { label: "Pending", color: "amber" as const };
  }

  switch (row.status) {
    case "overspent":
      return { label: "Overspent", color: "rose" as const };
    case "tight":
      return { label: "Tight", color: "amber" as const };
    default:
      return { label: "On track", color: "emerald" as const };
  }
};

const getVarianceLabel = (row: { isIncome: boolean; variance: number }) => {
  if (row.isIncome) {
    return row.variance >= 0
      ? `${formatCurrency(row.variance)} short`
      : `${formatCurrency(Math.abs(row.variance))} ahead`;
  }

  return row.variance >= 0
    ? `${formatCurrency(row.variance)} left`
    : `${formatCurrency(Math.abs(row.variance))} over`;
};

const getGroupTone = (isIncome: boolean) =>
  isIncome
    ? {
        border: "border-emerald-500/20 dark:border-emerald-400/20",
        bar: "bg-emerald-500 dark:bg-emerald-400",
        chip: "emerald" as const,
      }
    : {
        border: "border-zinc-950/8 dark:border-white/10",
        bar: "bg-amber-500 dark:bg-amber-400",
        chip: "zinc" as const,
      };

export function MonthlyBudgetHome() {
  const [selectedMonthValue, setSelectedMonthValue] = useState(() =>
    formatMonthInputValue(new Date()),
  );
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [isCreatingBudget, setIsCreatingBudget] = useState(false);
  const [isAddBudgetItemOpen, setIsAddBudgetItemOpen] = useState(false);
  const [addBudgetItemValues, setAddBudgetItemValues] = useState(
    emptyAddBudgetItemValues,
  );
  const [addBudgetItemError, setAddBudgetItemError] = useState<string | null>(
    null,
  );
  const [isAddingBudgetItem, setIsAddingBudgetItem] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [addCategoryValues, setAddCategoryValues] = useState(
    emptyAddCategoryValues,
  );
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const { month, year } = useMemo(
    () => parseMonthInputValue(selectedMonthValue),
    [selectedMonthValue],
  );

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
  } = useMonthlyBudgetWorkspace(month, year);

  const monthLabel = formatMonthLabel(month, year);

  const createMonthBudget = async () => {
    setBudgetError(null);
    setIsCreatingBudget(true);

    try {
      await createBudget({ month, year });
    } catch {
      setBudgetError("Unable to create this month right now.");
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

  const saveBudgetItem = async (budgetItem: BudgetItem) => {
    if (!editingState) {
      return;
    }

    const nextTargetAmount = parseAmount(editingState.targetAmount);

    if (nextTargetAmount === null) {
      setSaveError("Target amount must be a valid number.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      await Promise.resolve(
        budgetItemCollection.update(budgetItem.id, (draft) => {
          draft.targetAmount = nextTargetAmount;
        }),
      );

      stopEditing();
    } catch {
      setSaveError("Unable to save this budget item.");
    } finally {
      setIsSaving(false);
    }
  };

  const submitAddBudgetItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!budget) {
      return;
    }

    const targetAmount = parseAmount(addBudgetItemValues.targetAmount);

    if (!addBudgetItemValues.categoryId) {
      setAddBudgetItemError("Select a category to add.");
      return;
    }

    if (targetAmount === null) {
      setAddBudgetItemError("Target amount must be a valid number.");
      return;
    }

    setAddBudgetItemError(null);
    setIsAddingBudgetItem(true);

    try {
      await createBudgetItem({
        budgetId: budget.id,
        categoryId: addBudgetItemValues.categoryId,
        targetAmount,
      });

      setAddBudgetItemValues(emptyAddBudgetItemValues());
      setIsAddBudgetItemOpen(false);
    } catch {
      setAddBudgetItemError("Unable to add this budget item.");
    } finally {
      setIsAddingBudgetItem(false);
    }
  };

  const submitAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!budget) {
      return;
    }

    const name = addCategoryValues.name.trim();
    const group = addCategoryValues.group.trim();
    const targetAmount = parseAmount(addCategoryValues.targetAmount);

    if (!name) {
      setAddCategoryError("Category name is required.");
      return;
    }

    if (!group) {
      setAddCategoryError("Group name is required.");
      return;
    }

    if (targetAmount === null) {
      setAddCategoryError("Initial target must be a valid number.");
      return;
    }

    setAddCategoryError(null);
    setIsAddingCategory(true);

    try {
      const categoryId = await createCategory({ name, group });

      await createBudgetItem({
        budgetId: budget.id,
        categoryId,
        targetAmount,
      });

      setAddCategoryValues(emptyAddCategoryValues());
      setIsAddCategoryOpen(false);
    } catch {
      setAddCategoryError("Unable to add this category right now.");
    } finally {
      setIsAddingCategory(false);
    }
  };

  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="space-y-8 border-b border-zinc-950/6 pb-10 dark:border-white/8"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-zinc-950/10 bg-zinc-950/[0.03] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
              Budget workspace
              <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-[0.62rem] tracking-[0.18em] text-white dark:bg-white dark:text-zinc-950">
                {monthLabel}
              </span>
            </div>
            <div className="space-y-3">
              <Heading className="text-4xl/none tracking-tight text-zinc-950 sm:text-5xl/none dark:text-white">
                Monthly budget
              </Heading>
              <div className="h-px w-24 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent dark:from-white dark:via-white/40" />
            </div>
            <Text className="max-w-2xl">
              Review one month at a time, watch category pressure early, and
              tune plan targets without leaving the page.
            </Text>
          </div>

          <div className="w-full max-w-xs">
            <Field>
              <Label>Month</Label>
              <Input
                type="month"
                value={selectedMonthValue}
                onChange={(event) => setSelectedMonthValue(event.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-6 border-y border-zinc-950/6 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] dark:border-white/8">
          <DescriptionList className="max-w-3xl">
            <DescriptionTerm>Expected income</DescriptionTerm>
            <DescriptionDetails className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(expectedIncome)}
            </DescriptionDetails>

            <DescriptionTerm>Expected expenses</DescriptionTerm>
            <DescriptionDetails>
              {formatCurrency(expectedExpenses)}
            </DescriptionDetails>

            <DescriptionTerm>Actual spending</DescriptionTerm>
            <DescriptionDetails>
              {formatCurrency(actualSpending)}
            </DescriptionDetails>

            <DescriptionTerm>Planned net</DescriptionTerm>
            <DescriptionDetails
              className={
                plannedNet >= 0
                  ? "font-medium text-emerald-600 dark:text-emerald-400"
                  : "font-medium text-rose-600 dark:text-rose-400"
              }
            >
              {formatCurrency(plannedNet)}
            </DescriptionDetails>
          </DescriptionList>

          <div className="space-y-3">
            <Subheading>Pressure points</Subheading>
            {overspentCategories.length === 0 ? (
              <Text>No categories are over target for {monthLabel}.</Text>
            ) : (
              <div className="space-y-2">
                {overspentCategories.slice(0, 3).map((row) => (
                  <div
                    key={row.budgetItem.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-950/8 px-4 py-3 dark:border-white/10"
                  >
                    <div>
                      <div className="font-medium text-zinc-950 dark:text-white">
                        {row.category.name}
                      </div>
                      <Text>{row.group}</Text>
                    </div>
                    <Badge color="rose">
                      {formatCurrency(Math.abs(row.variance))} over
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            color="dark/zinc"
            onClick={() => setIsAddBudgetItemOpen(true)}
            disabled={!budget || availableCategories.length === 0}
          >
            <PlusIcon data-slot="icon" />
            Add budget item
          </Button>
          <Button
            outline
            onClick={() => setIsAddCategoryOpen(true)}
            disabled={!budget}
          >
            <PlusIcon data-slot="icon" />
            Add category
          </Button>
          {!budget ? (
            <Text>Create the month budget first to start planning.</Text>
          ) : availableCategories.length === 0 ? (
            <Text>
              All active categories are already assigned to this month.
            </Text>
          ) : (
            <Text>{monthLabel} is the active planning month.</Text>
          )}
        </div>
      </motion.section>

      {!budget ? (
        <section className="space-y-4 rounded-2xl border border-dashed border-zinc-950/12 px-6 py-10 dark:border-white/10">
          <div className="space-y-2">
            <Subheading>{monthLabel} has no budget yet</Subheading>
            <Text>
              Create this month’s budget to unlock grouped planning, inline
              target updates, and direct category entry.
            </Text>
          </div>
          {budgetError ? (
            <Text className="text-rose-600 dark:text-rose-400">
              {budgetError}
            </Text>
          ) : null}
          <Button
            color="dark/zinc"
            onClick={() => void createMonthBudget()}
            disabled={isCreatingBudget}
          >
            <PlusIcon data-slot="icon" />
            Create {monthLabel} budget
          </Button>
        </section>
      ) : groups.length === 0 ? (
        <section className="space-y-3 rounded-2xl border border-zinc-950/8 px-6 py-10 dark:border-white/10">
          <Subheading>No budget items yet</Subheading>
          <Text>
            Start by adding an existing category or create a new category
            directly into {monthLabel}.
          </Text>
        </section>
      ) : (
        <div className="space-y-10">
          {groups.map((group, index) => (
            <motion.section
              key={group.group}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              className="space-y-4"
            >
              <div
                className={[
                  "grid gap-4 rounded-2xl border bg-zinc-950/[0.02] px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center dark:bg-white/[0.03]",
                  getGroupTone(group.isIncome).border,
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "h-10 w-1 rounded-full",
                      getGroupTone(group.isIncome).bar,
                    ].join(" ")}
                  />
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
                      {formatCurrency(
                        group.rows.reduce(
                          (sum, row) => sum + row.budgetItem.targetAmount,
                          0,
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Actual
                    </div>
                    <div className="font-semibold tabular-nums text-zinc-950 dark:text-white">
                      {formatCurrency(
                        group.rows.reduce(
                          (sum, row) => sum + row.budgetItem.actualAmount,
                          0,
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Pace
                    </div>
                    <div className="pt-0.5">
                      <Badge color={getGroupTone(group.isIncome).chip}>
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
                  {group.rows.map((row) => {
                    const isEditing =
                      editingState?.budgetItemId === row.budgetItem.id;
                    const status = getStatusBadge(row);

                    return (
                      <TableRow key={row.budgetItem.id}>
                        <TableCell className="align-middle">
                          <span className="font-medium text-zinc-950 dark:text-white">
                            {row.category.name}
                          </span>
                        </TableCell>
                        <TableCell className="align-middle">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={editingState.targetAmount}
                                onChange={(event) =>
                                  setEditingState((current) =>
                                    current
                                      ? {
                                          ...current,
                                          targetAmount: event.target.value,
                                        }
                                      : current,
                                  )
                                }
                              />
                              {saveError ? (
                                <Text className="text-rose-600 dark:text-rose-400">
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
                        <TableCell className="align-middle font-medium tabular-nums text-zinc-950 dark:text-white">
                          {formatCurrency(row.budgetItem.actualAmount)}
                        </TableCell>
                        <TableCell className="align-middle font-medium">
                          {getVarianceLabel(row)}
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
                                  onClick={() =>
                                    void saveBudgetItem(row.budgetItem)
                                  }
                                  disabled={isSaving}
                                >
                                  Save
                                </Button>
                                <Button
                                  plain
                                  onClick={stopEditing}
                                  disabled={isSaving}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                plain
                                onClick={() => startEditing(row.budgetItem)}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </motion.section>
          ))}
        </div>
      )}

      <Dialog
        open={isAddBudgetItemOpen}
        onClose={() => {
          if (!isAddingBudgetItem) {
            setIsAddBudgetItemOpen(false);
            setAddBudgetItemError(null);
          }
        }}
      >
        <DialogTitle>Add budget item</DialogTitle>
        <DialogDescription>
          Add an existing category into {monthLabel} and set its target for the
          month.
        </DialogDescription>
        <DialogBody>
          <form onSubmit={submitAddBudgetItem}>
            <Fieldset>
              <FieldGroup>
                <Field>
                  <Label>Category</Label>
                  <Select
                    value={addBudgetItemValues.categoryId}
                    onChange={(event) =>
                      setAddBudgetItemValues((current) => ({
                        ...current,
                        categoryId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.group} - {category.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field>
                  <Label>Target amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={addBudgetItemValues.targetAmount}
                    onChange={(event) =>
                      setAddBudgetItemValues((current) => ({
                        ...current,
                        targetAmount: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </Field>
                {addBudgetItemError ? (
                  <Text className="text-rose-600 dark:text-rose-400">
                    {addBudgetItemError}
                  </Text>
                ) : null}
              </FieldGroup>
            </Fieldset>
            <DialogActions>
              <Button
                plain
                type="button"
                onClick={() => setIsAddBudgetItemOpen(false)}
                disabled={isAddingBudgetItem}
              >
                Cancel
              </Button>
              <Button
                color="dark/zinc"
                type="submit"
                disabled={isAddingBudgetItem}
              >
                Add item
              </Button>
            </DialogActions>
          </form>
        </DialogBody>
      </Dialog>

      <Dialog
        open={isAddCategoryOpen}
        onClose={() => {
          if (!isAddingCategory) {
            setIsAddCategoryOpen(false);
            setAddCategoryError(null);
          }
        }}
      >
        <DialogTitle>Add category</DialogTitle>
        <DialogDescription>
          Create a reusable category and place it into {monthLabel} immediately.
        </DialogDescription>
        <DialogBody>
          <form onSubmit={submitAddCategory}>
            <Fieldset>
              <FieldGroup>
                <Field>
                  <Label>Category name</Label>
                  <Input
                    value={addCategoryValues.name}
                    onChange={(event) =>
                      setAddCategoryValues((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Insurance"
                  />
                </Field>
                <Field>
                  <Label>Group</Label>
                  <Input
                    value={addCategoryValues.group}
                    onChange={(event) =>
                      setAddCategoryValues((current) => ({
                        ...current,
                        group: event.target.value,
                      }))
                    }
                    placeholder={knownGroups[0] ?? "Bills"}
                  />
                </Field>
                <Field>
                  <Label>Initial target</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={addCategoryValues.targetAmount}
                    onChange={(event) =>
                      setAddCategoryValues((current) => ({
                        ...current,
                        targetAmount: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </Field>
                {addCategoryError ? (
                  <Text className="text-rose-600 dark:text-rose-400">
                    {addCategoryError}
                  </Text>
                ) : null}
              </FieldGroup>
            </Fieldset>
            <DialogActions>
              <Button
                plain
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                disabled={isAddingCategory}
              >
                Cancel
              </Button>
              <Button
                color="dark/zinc"
                type="submit"
                disabled={isAddingCategory}
              >
                Create category
              </Button>
            </DialogActions>
          </form>
        </DialogBody>
      </Dialog>
    </div>
  );
}
