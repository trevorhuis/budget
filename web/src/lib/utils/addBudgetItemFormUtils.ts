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
) => {
  const fieldErrors: AddBudgetItemFormFieldErrors = {};

  if (!values.categoryId) {
    fieldErrors.categoryId = budgetFormMessages.categorySelectionRequired;
  }

  if (parseAmountInput(values.targetAmount) === null) {
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
