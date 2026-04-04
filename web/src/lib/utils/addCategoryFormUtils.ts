import type { BudgetItem, Category } from "~/lib/schemas";
import { CREATE_GROUP_OPTION, budgetFormMessages } from "~/lib/utils/budgetFormShared";
import { parseAmountInput } from "~/lib/utils/budgetUtils";

export type AddCategoryFormValues = {
  name: string;
  groupSelection: Category["group"] | typeof CREATE_GROUP_OPTION | "";
  newGroup: string;
  targetAmount: string;
};

export type AddCategoryFormFieldErrors = Partial<
  Record<keyof AddCategoryFormValues, string>
>;

export type ParsedAddCategoryFormValues = Pick<Category, "group" | "name"> &
  Pick<BudgetItem, "targetAmount">;

export const getDefaultAddCategoryFormValues = (): AddCategoryFormValues => ({
  name: "",
  groupSelection: "",
  newGroup: "",
  targetAmount: "",
});

export const resolveAddCategoryGroup = (values: AddCategoryFormValues) => {
  if (values.groupSelection === CREATE_GROUP_OPTION) {
    return values.newGroup.trim();
  }

  return values.groupSelection.trim();
};

export const validateAddCategoryFormValues = (
  values: AddCategoryFormValues,
  options: { hasKnownGroups: boolean },
) => {
  const fieldErrors: AddCategoryFormFieldErrors = {};
  const trimmedName = values.name.trim();
  const resolvedGroup = resolveAddCategoryGroup(values);

  if (!trimmedName) {
    fieldErrors.name = budgetFormMessages.categoryNameRequired;
  }

  if (!resolvedGroup) {
    if (
      !options.hasKnownGroups ||
      values.groupSelection === CREATE_GROUP_OPTION
    ) {
      fieldErrors.newGroup = budgetFormMessages.groupRequired;
    } else {
      fieldErrors.groupSelection = budgetFormMessages.groupRequired;
    }
  }

  if (parseAmountInput(values.targetAmount) === null) {
    fieldErrors.targetAmount = budgetFormMessages.invalidInitialTarget;
  }

  return Object.keys(fieldErrors).length > 0
    ? { fields: fieldErrors }
    : undefined;
};

export const parseAddCategoryFormValues = (
  values: AddCategoryFormValues,
  options: { hasKnownGroups: boolean },
):
  | { data: ParsedAddCategoryFormValues; success: true }
  | { errors: AddCategoryFormFieldErrors; success: false } => {
  const validationError = validateAddCategoryFormValues(values, options);

  if (validationError) {
    return {
      errors: validationError.fields,
      success: false,
    };
  }

  return {
    data: {
      name: values.name.trim(),
      group: resolveAddCategoryGroup(values),
      targetAmount: parseAmountInput(values.targetAmount) ?? 0,
    },
    success: true,
  };
};
