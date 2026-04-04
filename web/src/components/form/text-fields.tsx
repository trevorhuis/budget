import { useStore } from "@tanstack/react-form";
import type React from "react";
import { useFieldContext } from "~/hooks/form-context.ts";
import { ErrorMessage, Field, Label } from "~/components/ui/fieldset.tsx";
import { Input } from "~/components/ui/input.tsx";

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
      {errors.map((error: string, index) => (
        <ErrorMessage key={`${String(error)}-${index}`}>{error}</ErrorMessage>
      ))}
    </Field>
  );
}

export default TextField;
