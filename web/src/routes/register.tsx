/* eslint-disable react-refresh/only-export-components */

import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthLayout } from "~/components/ui/auth-layout";
import { FieldGroup, Fieldset } from "~/components/ui/fieldset";
import { Text, TextLink } from "~/components/ui/text";
import { useAppForm } from "~/hooks/form";
import {
  getAbsoluteCallbackURL,
  resolveAuthSession,
  sanitizeRedirect,
  useAuth,
} from "~/lib/auth";
import { authClient } from "~/lib/auth-client";
import * as z from "zod/mini";

export const Route = createFileRoute("/register")({
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
  component: RegisterPage,
});

function RegisterPage() {
  const auth = useAuth();
  const search = Route.useSearch();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginHref = `/login?redirect=${encodeURIComponent(search.redirect)}`;

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    listeners: {
      onChange: () => {
        setErrorMessage(null);
      },
    },
    validators: {
      onChange: z.object({
        name: z.string().check(z.trim(), z.minLength(1, "Name is required.")),
        email: z.email("Enter a valid email address."),
        password: z
          .string()
          .check(z.minLength(1, "Password is required.")),
        confirmPassword: z
          .string()
          .check(z.minLength(1, "Confirm your password.")),
      }),
      onSubmit: ({ value }) => {
        if (value.password === value.confirmPassword) {
          return;
        }

        return {
          fields: {
            confirmPassword: "Passwords do not match.",
          },
        };
      },
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      const result = await authClient.signUp.email({
        name: value.name.trim(),
        email: value.email.trim(),
        password: value.password,
        callbackURL: getAbsoluteCallbackURL(search.redirect),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Unable to create account.");
        return;
      }

      await auth.refetch();
      window.location.assign(search.redirect);
    },
  });

  return (
    <AuthLayout
      eyebrow="Private by default"
      title="Create your workspace"
      description="Register once, then every budget, account, and import stays tied to your session-backed identity."
      footer={
        <Text>
          Already have an account?{" "}
          <TextLink href={loginHref}>Sign in instead</TextLink>
        </Text>
      }
    >
      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <Fieldset>
          <FieldGroup>
            <form.AppField name="name">
              {(field) => (
                <field.TextField autoComplete="name" label="Name" type="text" />
              )}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  autoComplete="email"
                  label="Email"
                  type="email"
                />
              )}
            </form.AppField>

            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  autoComplete="new-password"
                  label="Password"
                  type="password"
                />
              )}
            </form.AppField>

            <form.AppField name="confirmPassword">
              {(field) => (
                <field.TextField
                  autoComplete="new-password"
                  label="Confirm password"
                  type="password"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </Fieldset>

        {errorMessage ? (
          <p className="text-sm/6 text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        ) : null}

        <form.AppForm>
          <form.SubscribeButton label="Create account" />
        </form.AppForm>
      </form>
    </AuthLayout>
  );
}
