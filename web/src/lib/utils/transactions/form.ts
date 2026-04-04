import type { Transaction } from "~/lib/schemas";
import {
  formatTransactionDateInputValue,
  parseTransactionDateInputValue,
} from "~/lib/utils/transactions/format";

export type TransactionFormValues = {
  merchant: string;
  amount: string;
  notes: string;
  date: string;
  type: Transaction["type"];
  accountId: string;
  budgetItemId: string;
};

export type TransactionFormFieldErrors = Partial<
  Record<keyof TransactionFormValues, string>
>;

export type ParsedTransactionFormValues = Pick<
  Transaction,
  | "accountId"
  | "amount"
  | "budgetItemId"
  | "date"
  | "merchant"
  | "notes"
  | "type"
> & {
  recurringTemplateId: null;
};

export const transactionFormMessages = {
  accountRequired: "Select an account for this transaction.",
  amountInvalid: "Amount must be a positive number.",
  budgetLineRequired: "Select the budget line this transaction belongs to.",
  createFailure: "Unable to create this transaction.",
  dateRequired: "Transaction date is required.",
  merchantRequired: "Merchant is required.",
} as const;

export const getDefaultTransactionFormValues = (): TransactionFormValues => ({
  merchant: "",
  amount: "",
  notes: "",
  date: formatTransactionDateInputValue(new Date()),
  type: "debit",
  accountId: "",
  budgetItemId: "",
});

export const resetTransactionFormValues = ({
  accountId,
  budgetItemId,
  type,
}: Pick<TransactionFormValues, "accountId" | "budgetItemId" | "type">) => ({
  ...getDefaultTransactionFormValues(),
  accountId,
  budgetItemId,
  type,
});

export const validateTransactionFormValues = (values: TransactionFormValues) => {
  const fieldErrors: TransactionFormFieldErrors = {};
  const merchant = values.merchant.trim();
  const amount = Number(values.amount.trim());
  const date = parseTransactionDateInputValue(values.date);

  if (!merchant) {
    fieldErrors.merchant = transactionFormMessages.merchantRequired;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    fieldErrors.amount = transactionFormMessages.amountInvalid;
  }

  if (!date) {
    fieldErrors.date = transactionFormMessages.dateRequired;
  }

  if (!values.accountId) {
    fieldErrors.accountId = transactionFormMessages.accountRequired;
  }

  if (!values.budgetItemId) {
    fieldErrors.budgetItemId = transactionFormMessages.budgetLineRequired;
  }

  return Object.keys(fieldErrors).length > 0
    ? { fields: fieldErrors }
    : undefined;
};

export const parseTransactionFormValues = (
  values: TransactionFormValues,
):
  | { data: ParsedTransactionFormValues; success: true }
  | { errors: TransactionFormFieldErrors; success: false } => {
  const validationError = validateTransactionFormValues(values);

  if (validationError) {
    return {
      errors: validationError.fields,
      success: false,
    };
  }

  return {
    data: {
      merchant: values.merchant.trim(),
      amount: Number(values.amount.trim()),
      notes: values.notes.trim(),
      date: parseTransactionDateInputValue(values.date) as Date,
      type: values.type,
      accountId: values.accountId,
      budgetItemId: values.budgetItemId,
      recurringTemplateId: null,
    },
    success: true,
  };
};
