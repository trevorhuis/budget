import type React from "react";

import { Field, Label } from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";

export function NumberField({
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
}) {
  return (
    <Field>
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.currentTarget.value || 0))}
      />
    </Field>
  );
}

export function DateField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Field>
      <Label>{label}</Label>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </Field>
  );
}

export function SelectField({
  children,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Field>
      <Label>{label}</Label>
      <Select value={value} onChange={(event) => onChange(event.currentTarget.value)}>
        {children}
      </Select>
    </Field>
  );
}
