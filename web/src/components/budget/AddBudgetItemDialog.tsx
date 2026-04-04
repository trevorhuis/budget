import { useEffect, useState } from "react";
import type { Category } from "~/lib/schemas";
import { useAppForm } from "~/hooks/form";
import { createBudgetItem } from "~/lib/collections/budgetItemCollection";
import {
  getDefaultAddBudgetItemFormValues,
  parseAddBudgetItemFormValues,
  validateAddBudgetItemFormValues,
} from "~/lib/utils/addBudgetItemFormUtils";
import { budgetFormMessages } from "~/lib/utils/budgetFormShared";
import { Field, FieldGroup, Fieldset, Label, ErrorMessage } from "~/components/ui/fieldset";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Text } from "~/components/ui/text";

type AddBudgetItemDialogProps = {
  availableCategories: Category[];
  budgetId: string | null;
  monthLabel: string;
  open: boolean;
  onClose: () => void;
};

export function AddBudgetItemDialog({
  availableCategories,
  budgetId,
  monthLabel,
  open,
  onClose,
}: AddBudgetItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: getDefaultAddBudgetItemFormValues(),
    listeners: {
      onChange: () => {
        setSubmitError(null);
      },
    },
    validators: {
      onChange: ({ value }) =>
        validateAddBudgetItemFormValues(value, "change"),
      onSubmit: ({ value }) =>
        validateAddBudgetItemFormValues(value, "submit"),
    },
    onSubmit: async ({ formApi, value }) => {
      if (!budgetId) {
        return;
      }

      const parsedValues = parseAddBudgetItemFormValues(value);

      if (!parsedValues.success) {
        return;
      }

      setSubmitError(null);
      setIsSubmitting(true);

      try {
        await createBudgetItem({
          budgetId,
          ...parsedValues.data,
        });

        formApi.reset(getDefaultAddBudgetItemFormValues());
        onClose();
      } catch {
        setSubmitError(budgetFormMessages.addBudgetItemFailure);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      return;
    }

    setIsSubmitting(false);
    setSubmitError(null);
    form.reset(getDefaultAddBudgetItemFormValues());
  }, [form, open]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogTitle>Add budget item</DialogTitle>
      <DialogDescription>
        Add an existing category into {monthLabel} and set its target for the
        month.
      </DialogDescription>
      <DialogBody>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <Fieldset>
            <FieldGroup>
              <form.AppField name="categoryId">
                {(field) => (
                  <Field>
                    <Label>Category</Label>
                    <Select
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    >
                      <option value="">Select a category</option>
                      {availableCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.group} - {category.name}
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

              <form.AppField name="targetAmount">
                {(field) => (
                  <Field>
                    <Label>Target amount</Label>
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

              {submitError ? (
                <Text className="text-rose-600 dark:text-rose-400">
                  {submitError}
                </Text>
              ) : null}
            </FieldGroup>
          </Fieldset>

          <DialogActions>
            <Button
              plain
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <form.AppForm>
              <form.SubscribeButton color="dark/zinc">
                Add item
              </form.SubscribeButton>
            </form.AppForm>
          </DialogActions>
        </form>
      </DialogBody>
    </Dialog>
  );
}
