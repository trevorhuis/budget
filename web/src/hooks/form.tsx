/* eslint-disable react-refresh/only-export-components */

import { createFormHook } from "@tanstack/react-form";
import type React from "react";

import { fieldContext, formContext, useFormContext } from "~/hooks/form-context.ts";
import { TextField } from "~/components/form/TextFields";
import { Button } from "~/components/ui/button";

type SubscribeButtonProps = {
  children?: React.ReactNode;
  color?: React.ComponentProps<typeof Button>["color"];
  className?: string;
  label?: string;
};

function SubscribeButton({
  children,
  color,
  className,
  label = "Submit",
}: SubscribeButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          className={className}
          color={color}
          disabled={isSubmitting}
          type="submit"
        >
          {children ?? label}
        </Button>
      )}
    </form.Subscribe>
  );
}

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
