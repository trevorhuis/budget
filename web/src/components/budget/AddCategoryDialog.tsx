import { useEffect, useState } from "react";
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
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  ErrorMessage,
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Text } from "~/components/ui/text";

type AddCategoryDialogProps = {
  budgetId: string | null;
  knownGroups: string[];
  monthLabel: string;
  open: boolean;
  onClose: () => void;
};

export function AddCategoryDialog({
  budgetId,
  knownGroups,
  monthLabel,
  open,
  onClose,
}: AddCategoryDialogProps) {
  const hasKnownGroups = knownGroups.length > 0;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: getDefaultAddCategoryFormValues(),
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
      if (!budgetId) {
        return;
      }

      const parsedValues = parseAddCategoryFormValues(value, { hasKnownGroups });

      if (!parsedValues.success) {
        return;
      }

      setSubmitError(null);
      setIsSubmitting(true);

      try {
        const categoryId = await createCategory({
          group: parsedValues.data.group,
          name: parsedValues.data.name,
        });

        await createBudgetItem({
          budgetId,
          categoryId,
          targetAmount: parsedValues.data.targetAmount,
        });

        formApi.reset(getDefaultAddCategoryFormValues());
        onClose();
      } catch {
        setSubmitError(budgetFormMessages.addCategoryFailure);
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
    form.reset(getDefaultAddCategoryFormValues());
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
      <DialogTitle>Add category</DialogTitle>
      <DialogDescription>
        Create a reusable category and place it into {monthLabel} immediately.
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
              <form.AppField name="name">
                {(field) => (
                  <Field>
                    <Label>Category name</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Insurance"
                    />
                    {field.state.meta.errors.map((error, index) => (
                      <ErrorMessage key={`${String(error)}-${index}`}>
                        {String(error)}
                      </ErrorMessage>
                    ))}
                  </Field>
                )}
              </form.AppField>

              <form.AppField name="groupSelection">
                {(groupSelectionField) => (
                  <form.AppField name="newGroup">
                    {(newGroupField) => {
                      const isCreatingGroup =
                        !hasKnownGroups ||
                        groupSelectionField.state.value === CREATE_GROUP_OPTION;

                      return (
                        <Field>
                          <Label>Group</Label>
                          {hasKnownGroups ? (
                            <div className="space-y-3">
                              <Select
                                value={
                                  isCreatingGroup
                                    ? CREATE_GROUP_OPTION
                                    : groupSelectionField.state.value
                                }
                                onBlur={groupSelectionField.handleBlur}
                                onChange={(event) =>
                                  groupSelectionField.handleChange(
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="">Select a group</option>
                                {knownGroups.map((group) => (
                                  <option key={group} value={group}>
                                    {group}
                                  </option>
                                ))}
                                <option value={CREATE_GROUP_OPTION}>
                                  Create new group
                                </option>
                              </Select>

                              {isCreatingGroup ? (
                                <Input
                                  value={newGroupField.state.value}
                                  onBlur={newGroupField.handleBlur}
                                  onChange={(event) =>
                                    newGroupField.handleChange(
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Bills"
                                />
                              ) : null}
                            </div>
                          ) : (
                            <Input
                              value={newGroupField.state.value}
                              onBlur={newGroupField.handleBlur}
                              onChange={(event) =>
                                newGroupField.handleChange(event.target.value)
                              }
                              placeholder="Bills"
                            />
                          )}
                          {groupSelectionField.state.meta.errors.map(
                            (error, index) => (
                              <ErrorMessage key={`${String(error)}-${index}`}>
                                {String(error)}
                              </ErrorMessage>
                            ),
                          )}
                          {isCreatingGroup
                            ? newGroupField.state.meta.errors.map(
                                (error, index) => (
                                  <ErrorMessage
                                    key={`${String(error)}-${index}`}
                                  >
                                    {String(error)}
                                  </ErrorMessage>
                                ),
                              )
                            : null}
                        </Field>
                      );
                    }}
                  </form.AppField>
                )}
              </form.AppField>

              <form.AppField name="targetAmount">
                {(field) => (
                  <Field>
                    <Label>Initial target</Label>
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
                Create category
              </form.SubscribeButton>
            </form.AppForm>
          </DialogActions>
        </form>
      </DialogBody>
    </Dialog>
  );
}
