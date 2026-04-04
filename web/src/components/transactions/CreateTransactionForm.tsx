import { PlusIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useAppForm } from "~/hooks/form";
import { createTransaction } from "~/hooks/transactions";
import type { Transaction } from "~/lib/schemas";
import {
  getDefaultTransactionOptionId,
  type TransactionAccountOption,
  type TransactionBudgetLineOption,
} from "~/lib/utils/transactions/options";
import {
  getDefaultTransactionFormValues,
  parseTransactionFormValues,
  resetTransactionFormValues,
  validateTransactionFormValues,
} from "~/lib/utils/transactions/form";
import { fieldErrorToString } from "~/lib/utils/formErrors.ts";
import {
  ErrorMessage,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";

type CreateTransactionFormProps = {
  accountOptions: TransactionAccountOption[];
  budgetLineOptions: TransactionBudgetLineOption[];
};

export function CreateTransactionForm({
  accountOptions,
  budgetLineOptions,
}: CreateTransactionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: getDefaultTransactionFormValues(),
    listeners: {
      onChange: () => {
        setSubmitError(null);
      },
    },
    validators: {
      onChange: ({ value }) =>
        validateTransactionFormValues(value, "change"),
      onSubmit: ({ value }) =>
        validateTransactionFormValues(value, "submit"),
    },
    onSubmit: async ({ formApi, value }) => {
      const parsedValues = parseTransactionFormValues(value);

      if (!parsedValues.success) {
        return;
      }

      setSubmitError(null);

      try {
        const optimisticTransaction = createTransaction({
          transaction: parsedValues.data,
        });

        await optimisticTransaction.isPersisted.promise;

        formApi.reset(
          resetTransactionFormValues({
            accountId: value.accountId,
            budgetItemId: value.budgetItemId,
            type: value.type,
          }),
        );
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Unable to create this transaction.",
        );
      }
    },
  });

  useEffect(() => {
    const nextAccountId = getDefaultTransactionOptionId(
      form.state.values.accountId,
      accountOptions,
    );

    if (nextAccountId !== form.state.values.accountId) {
      form.setFieldValue("accountId", nextAccountId);
    }
  }, [accountOptions, form, form.state.values.accountId]);

  useEffect(() => {
    const nextBudgetItemId = getDefaultTransactionOptionId(
      form.state.values.budgetItemId,
      budgetLineOptions,
    );

    if (nextBudgetItemId !== form.state.values.budgetItemId) {
      form.setFieldValue("budgetItemId", nextBudgetItemId);
    }
  }, [budgetLineOptions, form, form.state.values.budgetItemId]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="rounded-xl border border-zinc-950/8 bg-zinc-50/70 p-3 shadow-sm sm:p-4 dark:border-white/10 dark:bg-white/4"
    >
      <Fieldset>
        <Legend className="!text-sm/none !font-semibold">
          Create transaction
        </Legend>
        <Text className="mt-0.5 text-xs/4 text-zinc-500 dark:text-zinc-400">
          One budget line per post; actuals refresh optimistically.
        </Text>

        <FieldGroup className="!mt-3 !space-y-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_6.5rem] sm:items-start">
            <form.AppField name="merchant">
              {(field) => (
                <field.TextField
                  label="Merchant"
                  placeholder="H-E-B, rent, payroll"
                />
              )}
            </form.AppField>

            <form.AppField name="amount">
              {(field) => (
                <Field>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="0.00"
                    className="text-sm"
                  />
                  {field.state.meta.errors.map((error, index) => (
                    <ErrorMessage key={`${fieldErrorToString(error)}-${index}`}>
                      {fieldErrorToString(error)}
                    </ErrorMessage>
                  ))}
                </Field>
              )}
            </form.AppField>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <form.AppField name="date">
              {(field) => (
                <Field>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    className="text-sm"
                  />
                  {field.state.meta.errors.map((error, index) => (
                    <ErrorMessage key={`${fieldErrorToString(error)}-${index}`}>
                      {fieldErrorToString(error)}
                    </ErrorMessage>
                  ))}
                </Field>
              )}
            </form.AppField>

            <form.AppField name="type">
              {(field) => (
                <Field>
                  <Label>Type</Label>
                  <Select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value as Transaction["type"])
                    }
                    className="text-sm"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </Select>
                </Field>
              )}
            </form.AppField>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <form.AppField name="accountId">
              {(field) => (
                <Field>
                  <Label>Account</Label>
                  <Select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={accountOptions.length === 0}
                    className="text-sm"
                  >
                    {accountOptions.length === 0 ? (
                      <option value="">No accounts available</option>
                    ) : null}
                    {accountOptions.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.label}
                      </option>
                    ))}
                  </Select>
                  {field.state.meta.errors.map((error, index) => (
                    <ErrorMessage key={`${fieldErrorToString(error)}-${index}`}>
                      {fieldErrorToString(error)}
                    </ErrorMessage>
                  ))}
                </Field>
              )}
            </form.AppField>

            <form.AppField name="budgetItemId">
              {(field) => (
                <Field>
                  <Label>Budget line</Label>
                  <Select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={budgetLineOptions.length === 0}
                    className="text-sm"
                  >
                    {budgetLineOptions.length === 0 ? (
                      <option value="">No budget lines available</option>
                    ) : null}
                    {budgetLineOptions.map((budgetLine) => (
                      <option key={budgetLine.id} value={budgetLine.id}>
                        {budgetLine.label}
                      </option>
                    ))}
                  </Select>
                  {field.state.meta.errors.map((error, index) => (
                    <ErrorMessage key={`${fieldErrorToString(error)}-${index}`}>
                      {fieldErrorToString(error)}
                    </ErrorMessage>
                  ))}
                </Field>
              )}
            </form.AppField>
          </div>

          <form.AppField name="notes">
            {(field) => (
              <Field>
                <Label>Notes</Label>
                <Textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Optional memo"
                  rows={2}
                  className="[&_textarea]:min-h-[2.75rem] [&_textarea]:py-2 [&_textarea]:text-sm/5"
                />
              </Field>
            )}
          </form.AppField>

          {submitError ? (
            <Text className="text-xs text-red-600 dark:text-red-400">
              {submitError}
            </Text>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-zinc-950/6 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/8">
            <Text className="text-[0.7rem] leading-snug text-zinc-500 dark:text-zinc-400">
              Shows in your transactions as soon as you submit.
            </Text>
            <form.AppForm>
              <form.SubscribeButton color="dark/zinc">
                <PlusIcon data-slot="icon" />
                Add transaction
              </form.SubscribeButton>
            </form.AppForm>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  );
}
