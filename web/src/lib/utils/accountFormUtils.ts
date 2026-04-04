import type { Account } from "~/lib/schemas";

export type AccountFormValues = {
  name: string;
  type: Account["type"];
  balance: string;
};

export type AccountFormFieldErrors = Partial<
  Record<keyof AccountFormValues, string>
>;

export type ParsedAccountFormValues = Pick<Account, "name" | "type" | "balance">;

export const accountFormMessages = {
  createFailure: "Unable to create the account right now.",
  deleteFailure: "Unable to delete this account.",
  invalidBalance: "Balance must be a valid number.",
  nameRequired: "Account name is required.",
  updateFailure: "Unable to save this account.",
} as const;

export const getDefaultAccountFormValues = (): AccountFormValues => ({
  name: "",
  type: "checking",
  balance: "0.00",
});

export const toAccountFormValues = (
  account: Pick<Account, "name" | "type" | "balance">,
): AccountFormValues => ({
  name: account.name,
  type: account.type,
  balance: account.balance.toFixed(2),
});

export const validateAccountFormValues = (values: AccountFormValues) => {
  const fieldErrors: AccountFormFieldErrors = {};
  const trimmedName = values.name.trim();
  const trimmedBalance = values.balance.trim();

  if (!trimmedName) {
    fieldErrors.name = accountFormMessages.nameRequired;
  }

  if (!trimmedBalance || !Number.isFinite(Number(trimmedBalance))) {
    fieldErrors.balance = accountFormMessages.invalidBalance;
  }

  return Object.keys(fieldErrors).length > 0
    ? { fields: fieldErrors }
    : undefined;
};

export const parseAccountFormValues = (
  values: AccountFormValues,
):
  | { data: ParsedAccountFormValues; success: true }
  | { errors: AccountFormFieldErrors; success: false } => {
  const validationError = validateAccountFormValues(values);

  if (validationError) {
    return {
      errors: validationError.fields,
      success: false,
    };
  }

  return {
    data: {
      name: values.name.trim(),
      type: values.type,
      balance: Number(values.balance.trim()),
    },
    success: true,
  };
};
