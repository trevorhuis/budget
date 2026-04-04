import { PlusIcon, WalletIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { useAppForm } from "~/hooks/form";
import {
  accountFormMessages,
  getDefaultAccountFormValues,
  parseAccountFormValues,
  validateAccountFormValues,
} from "~/lib/utils/accountFormUtils";
import { accountTypeLabels, accountTypes } from "~/lib/utils/accountUtils";
import { createAccount } from "~/lib/collections/accountCollection";
import {
  ErrorMessage,
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

export function AddAccountForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: getDefaultAccountFormValues(),
    listeners: {
      onChange: () => {
        setSubmitError(null);
      },
    },
    validators: {
      onChange: ({ value }) => validateAccountFormValues(value),
      onSubmit: ({ value }) => validateAccountFormValues(value),
    },
    onSubmit: async ({ formApi, value }) => {
      const parsedValues = parseAccountFormValues(value);

      if (!parsedValues.success) {
        return;
      }

      setSubmitError(null);

      try {
        await createAccount(parsedValues.data);
        formApi.reset(getDefaultAccountFormValues());
      } catch {
        setSubmitError(accountFormMessages.createFailure);
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="rounded-2xl border border-zinc-950/8 bg-zinc-50/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/4"
    >
      <Fieldset>
        <LegendBlock />
        <FieldGroup className="mt-8">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Account name"
                placeholder="Everyday checking"
              />
            )}
          </form.AppField>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="type">
              {(field) => (
                <Field>
                  <Label>Type</Label>
                  <Select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value as typeof field.state.value)
                    }
                  >
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {accountTypeLabels[type]}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </form.AppField>

            <form.AppField name="balance">
              {(field) => (
                <Field>
                  <Label>Balance</Label>
                  <Input
                    type="number"
                    step="0.01"
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Text>
              Signed balances are allowed for debt and offset accounts.
            </Text>
            <form.AppForm>
              <form.SubscribeButton color="dark/zinc">
                <PlusIcon data-slot="icon" />
                Add account
              </form.SubscribeButton>
            </form.AppForm>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  );
}

function LegendBlock() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <WalletIcon className="size-5" />
        </span>
        <div>
          <Subheading>Add account</Subheading>
          <Text>Create a new balance source without leaving the workspace.</Text>
        </div>
      </div>
    </div>
  );
}
