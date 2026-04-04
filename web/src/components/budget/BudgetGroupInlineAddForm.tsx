import { useState } from "react";
import { useAppForm } from "~/hooks/form";
import { createBudgetItem } from "~/lib/collections/budgetItemCollection";
import { createCategory } from "~/lib/collections/categoryCollection";
import {
  getDefaultAddCategoryFormValues,
  parseAddCategoryFormValues,
  validateAddCategoryFormValues,
  type AddCategoryFormValues,
} from "~/lib/utils/addCategoryFormUtils";
import { budgetFormMessages } from "~/lib/utils/budgetFormShared";
import { Button } from "~/components/ui/button";
import {
  ErrorMessage,
  Field,
  FieldGroup,
  Label,
} from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

function getInlineFormDefaults(groupName: string): AddCategoryFormValues {
  return {
    ...getDefaultAddCategoryFormValues(),
    groupSelection: groupName,
  };
}

type BudgetGroupInlineAddFormProps = {
  budgetId: string;
  groupName: string;
  onClose: () => void;
};

export function BudgetGroupInlineAddForm({
  budgetId,
  groupName,
  onClose,
}: BudgetGroupInlineAddFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: getInlineFormDefaults(groupName),
    listeners: {
      onChange: () => {
        setSubmitError(null);
      },
    },
    validators: {
      onChange: ({ value }) =>
        validateAddCategoryFormValues(value, {
          hasKnownGroups: true,
          mode: "change",
        }),
      onSubmit: ({ value }) =>
        validateAddCategoryFormValues(value, {
          hasKnownGroups: true,
          mode: "submit",
        }),
    },
    onSubmit: async ({ formApi, value }) => {
      const parsed = parseAddCategoryFormValues(value, { hasKnownGroups: true });

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

        formApi.reset(getInlineFormDefaults(groupName));
        onClose();
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
    >
      <FieldGroup className="!space-y-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
          <form.AppField name="name">
            {(field) => (
              <Field className="min-w-0 flex-1">
                <Label className="text-xs">Category name</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Rent or mortgage"
                  autoComplete="off"
                  autoFocus
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
              <Field className="w-full shrink-0 sm:w-28">
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

          <div className="flex shrink-0 flex-wrap gap-2 sm:pb-0.5">
            <form.AppForm>
              <form.SubscribeButton color="dark/zinc">Add line</form.SubscribeButton>
            </form.AppForm>
            <Button plain type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
        {submitError ? (
          <Text className="mt-2 text-xs text-rose-600 dark:text-rose-400">
            {submitError}
          </Text>
        ) : null}
      </FieldGroup>
    </form>
  );
}
