import { useStore } from "@tanstack/react-form";
import { useFieldContext } from "../../hooks/form-context.tsx";
import { ErrorMessage, Field, Label } from "../ui/fieldset.tsx";
import { Input } from "../ui/input.tsx";

export default function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      <Label>{label}</Label>
      <Input
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {errors.map((error: string) => (
        <ErrorMessage>{error}</ErrorMessage>
      ))}
    </Field>
  );
}
