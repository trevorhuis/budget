/* eslint-disable react-refresh/only-export-components */

import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthLayout } from "~/components/ui/auth-layout";
import { FieldGroup, Fieldset } from "~/components/ui/fieldset";
import { Text, TextLink } from "~/components/ui/text";
import {
  getAbsoluteCallbackURL,
  resolveAuthSession,
  sanitizeRedirect,
  useAuth,
} from "~/lib/auth";
import { authClient } from "~/lib/auth-client";
import { useAppForm } from "~/hooks/form";
import * as z from "zod/mini";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
  beforeLoad: async ({ context, search }) => {
    const session = await resolveAuthSession(context.auth);

    if (session) {
      throw redirect({
        href: search.redirect,
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();
  const search = Route.useSearch();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerHref = `/register?redirect=${encodeURIComponent(
    search.redirect,
  )}`;

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: z.object({
        email: z.string(),
        password: z.string(),
      }),
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      const result = await authClient.signIn.email({
        email: value.email.trim(),
        password: value.password,
        callbackURL: getAbsoluteCallbackURL(search.redirect),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Unable to sign in.");
        return;
      }

      await auth.refetch();
      window.location.assign(search.redirect);
    },
  });

  return (
    <AuthLayout
      eyebrow="Budget workspace"
      title="Sign in to your month"
      description="Your session unlocks account balances, budget lines, recurring transactions, and the assistant."
      footer={
        <Text>
          New here? <TextLink href={registerHref}>Create an account</TextLink>
        </Text>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        <Fieldset>
          <FieldGroup>
            <form.AppField 
              name="email"
              children={(field) => <field.TextField label="Email" />}
            />

            <form.AppField 
              name="password"
              children={(field) => <field.TextField label="Password" />}
            />
          </FieldGroup>
        </Fieldset>

        {errorMessage ? (
          <p className="text-sm/6 text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        ) : null}

        <form.AppForm>
          <form.SubscribeButton label='Sign in' />
        </form.AppForm>
      </form>
    </AuthLayout>
  );
}
