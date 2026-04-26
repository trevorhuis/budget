import { useStore } from "@tanstack/react-form";
import type React from "react";
import { ErrorMessage, Field, Label } from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import { useFieldContext } from "~/hooks/form-context";
import { fieldErrorToString } from "~/lib/utils/formErrors";

type TextFieldProps = {
  label: string;
} & Pick<
  React.ComponentProps<typeof Input>,
  "autoComplete" | "autoFocus" | "placeholder" | "type"
>;

export function TextField({ label, ...inputProps }: TextFieldProps) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <Label>{label}</Label>
      <Input
        {...inputProps}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {errors.map((error: unknown, index) => {
        const text = fieldErrorToString(error);
        return (
          <ErrorMessage key={`${text}-${index}`}>{text}</ErrorMessage>
        );
      })}
    </Field>
  );
}

export default TextField;
