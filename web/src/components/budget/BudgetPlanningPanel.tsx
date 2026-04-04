import { PlusIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { useAppForm } from "~/hooks/form";
import { createBudgetItem } from "~/lib/collections/budgetItemCollection";
import { createCategory } from "~/lib/collections/categoryCollection";
import {
  getDefaultAddCategoryFormValues,
  parseAddCategoryFormValues,
  validateAddCategoryFormValues,
} from "~/lib/utils/addCategoryFormUtils";
import {
  CREATE_GROUP_OPTION,
  budgetFormMessages,
} from "~/lib/utils/budgetFormShared";
import {
  ErrorMessage,
  Field,
  FieldGroup,
  Label,
} from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

type BudgetPlanningPanelProps = {
  budgetId: string | null;
  hasKnownGroups: boolean;
  monthLabel: string;
};

const getNewGroupDefaults = () => ({
  ...getDefaultAddCategoryFormValues(),
  groupSelection: CREATE_GROUP_OPTION as const,
});

function BudgetNewGroupFormSection({
  budgetId,
  hasKnownGroups,
  monthLabel,
}: {
  budgetId: string;
  hasKnownGroups: boolean;
  monthLabel: string;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: getNewGroupDefaults(),
    listeners: {
      onChange: () => {
        setSubmitError(null);
      },
    },
    validators: {
      onChange: ({ value }) =>
        validateAddCategoryFormValues(value, {
          hasKnownGroups,
          mode: "change",
        }),
      onSubmit: ({ value }) =>
        validateAddCategoryFormValues(value, {
          hasKnownGroups,
          mode: "submit",
        }),
    },
    onSubmit: async ({ formApi, value }) => {
      const parsed = parseAddCategoryFormValues(value, { hasKnownGroups });

      if (!parsed.success) {
        return;
      }

      setSubmitError(null);

      try {
        const categoryId = await createCategory({
          group: parsed.data.group,
          name: parsed.data.name,
        });

        await createBudgetItem({
          budgetId,
          categoryId,
          targetAmount: parsed.data.targetAmount,
        });

        formApi.reset(getNewGroupDefaults());
      } catch {
        setSubmitError(budgetFormMessages.addCategoryFailure);
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      className="mt-4 border-t border-zinc-950/10 pt-4 dark:border-white/10"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-md space-y-1">
          <div className="text-sm font-semibold text-zinc-950 dark:text-white">
            Create a new group
          </div>
          <Text>
            Start a fresh section with its first category and a target for{" "}
            {monthLabel}.
          </Text>
        </div>

        <FieldGroup className="!mt-0 !space-y-3 lg:min-w-0 lg:flex-1 lg:max-w-3xl">
          <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6.5rem_auto]">
            <form.AppField name="newGroup">
              {(field) => (
                <Field>
                  <Label className="text-xs">Group name</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Subscriptions"
                    autoComplete="off"
                  />
                  {field.state.meta.errors.map((error, index) => (
                    <ErrorMessage key={`${String(error)}-${index}`}>
                      {String(error)}
                    </ErrorMessage>
                  ))}
                </Field>
              )}
            </form.AppField>

            <form.AppField name="name">
              {(field) => (
                <Field>
                  <Label className="text-xs">First category</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Streaming"
                    autoComplete="off"
                  />
                  {field.state.meta.errors.map((error, index) => (
                    <ErrorMessage key={`${String(error)}-${index}`}>
                      {String(error)}
                    </ErrorMessage>
                  ))}
                </Field>
              )}
            </form.AppField>

            <form.AppField name="targetAmount">
              {(field) => (
                <Field>
                  <Label className="text-xs">Target</Label>
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

            <div className="self-end">
              <form.AppForm>
                <form.SubscribeButton
                  color="dark/zinc"
                  className="whitespace-nowrap sm:min-w-36"
                >
                  <PlusIcon data-slot="icon" />
                  Add group
                </form.SubscribeButton>
              </form.AppForm>
            </div>
          </div>

          {submitError ? (
            <Text className="text-sm text-rose-600 dark:text-rose-400">
              {submitError}
            </Text>
          ) : null}
        </FieldGroup>
      </div>
    </form>
  );
}

export function BudgetPlanningPanel({
  budgetId,
  hasKnownGroups,
  monthLabel,
}: BudgetPlanningPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-950/10 bg-gradient-to-br from-zinc-950/[0.02] via-white/40 to-emerald-500/[0.04] p-3 shadow-sm dark:border-white/10 dark:from-white/[0.02] dark:via-zinc-950/40 dark:to-emerald-500/[0.06] sm:p-4">
      <div
        className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/5"
        aria-hidden
      />
      <div className="relative space-y-0.5">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-emerald-800 dark:text-emerald-300/90">
          Build this month
        </p>
        <Text className="max-w-xl text-xs/5 text-zinc-600 dark:text-zinc-400">
          Categories label spending; budget items set each line&apos;s target for{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            this month only
          </span>
          .
          {budgetId ? (
            <>
              {" "}
              Use the fields below to spin up a new group inline, or{" "}
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                Add line
              </strong>{" "}
              on a group header for a quick category and target.
            </>
          ) : (
            <>
              {" "}
              Use{" "}
              <strong className="font-medium text-zinc-800 dark:text-zinc-200">
                Create budget
              </strong>{" "}
              below, then add groups and lines here.
            </>
          )}
        </Text>
      </div>

      {budgetId ? (
        <BudgetNewGroupFormSection
          budgetId={budgetId}
          hasKnownGroups={hasKnownGroups}
          monthLabel={monthLabel}
        />
      ) : null}
    </div>
  );
}
