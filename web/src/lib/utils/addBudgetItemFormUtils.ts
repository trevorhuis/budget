import type { BudgetItem, Category } from "~/lib/schemas";
import { budgetFormMessages } from "~/lib/utils/budgetFormShared";
import { parseAmountInput } from "~/lib/utils/budgetUtils";

export type AddBudgetItemFormValues = {
  categoryId: Category["id"] | "";
  targetAmount: string;
};

export type AddBudgetItemFormFieldErrors = Partial<
  Record<keyof AddBudgetItemFormValues, string>
>;

export type ParsedAddBudgetItemFormValues = Pick<
  BudgetItem,
  "categoryId" | "targetAmount"
>;

export const getDefaultAddBudgetItemFormValues =
  (): AddBudgetItemFormValues => ({
    categoryId: "",
    targetAmount: "",
  });

export const validateAddBudgetItemFormValues = (
  values: AddBudgetItemFormValues,
  mode: "change" | "submit" = "submit",
) => {
  const fieldErrors: AddBudgetItemFormFieldErrors = {};

  if (!values.categoryId) {
    if (mode === "submit") {
      fieldErrors.categoryId = budgetFormMessages.categorySelectionRequired;
    }
  }

  const amountTrimmed = values.targetAmount.trim();
  if (!amountTrimmed) {
    if (mode === "submit") {
      fieldErrors.targetAmount = budgetFormMessages.targetAmountRequired;
    }
  } else if (parseAmountInput(values.targetAmount) === null) {
    fieldErrors.targetAmount = budgetFormMessages.invalidTargetAmount;
  }

  return Object.keys(fieldErrors).length > 0
    ? { fields: fieldErrors }
    : undefined;
};

export const parseAddBudgetItemFormValues = (
  values: AddBudgetItemFormValues,
):
  | { data: ParsedAddBudgetItemFormValues; success: true }
  | { errors: AddBudgetItemFormFieldErrors; success: false } => {
  const validationError = validateAddBudgetItemFormValues(values);

  if (validationError) {
    return {
      errors: validationError.fields,
      success: false,
    };
  }

  return {
    data: {
      categoryId: values.categoryId,
      targetAmount: parseAmountInput(values.targetAmount) ?? 0,
    },
    success: true,
  };
};
