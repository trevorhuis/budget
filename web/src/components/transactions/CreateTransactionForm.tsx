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
      onChange: ({ value }) => validateTransactionFormValues(value),
      onSubmit: ({ value }) => validateTransactionFormValues(value),
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
      className="rounded-2xl border border-zinc-950/8 bg-zinc-50/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/4"
    >
      <Fieldset>
        <Legend>Create transaction</Legend>
        <Text className="mt-1">
          Every new transaction posts to one budget line and updates that
          line&apos;s actual amount optimistically.
        </Text>

        <FieldGroup className="mt-6">
          <form.AppField name="merchant">
            {(field) => (
              <field.TextField
                label="Merchant"
                placeholder="H-E-B, rent, payroll"
              />
            )}
          </form.AppField>

          <div className="grid gap-3 sm:grid-cols-2">
            <form.AppField name="date">
              {(field) => (
                <Field>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {field.state.meta.errors.map((error, index) => (
                    <ErrorMessage key={`${String(error)}-${index}`}>
                      {String(error)}
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
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </Select>
                </Field>
              )}
            </form.AppField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <form.AppField name="accountId">
              {(field) => (
                <Field>
                  <Label>Account</Label>
                  <Select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={accountOptions.length === 0}
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
                    <ErrorMessage key={`${String(error)}-${index}`}>
                      {String(error)}
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
                    <ErrorMessage key={`${String(error)}-${index}`}>
                      {String(error)}
                    </ErrorMessage>
                  ))}
                </Field>
              )}
            </form.AppField>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <form.AppField name="notes">
              {(field) => (
                <Field>
                  <Label>Notes</Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Optional memo for context or reconciliation"
                    rows={4}
                  />
                </Field>
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
                  />
                  {field.state.meta.errors.map((error, index) => (
                    <ErrorMessage key={`${String(error)}-${index}`}>
                      {String(error)}
                    </ErrorMessage>
                  ))}
                </Field>
              )}
            </form.AppField>
          </div>

          {submitError ? (
            <Text className="text-red-600 dark:text-red-400">{submitError}</Text>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-zinc-950/6 pt-4 dark:border-white/8">
            <Text>Transactions land in the ledger immediately after submit.</Text>
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
