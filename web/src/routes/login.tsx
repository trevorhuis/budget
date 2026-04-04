/* eslint-disable react-refresh/only-export-components */

import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
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
    listeners: {
      onChange: () => {
        setErrorMessage(null);
      },
    },
    validators: {
      // Form-level onChange runs on every field edit; allow empty email until submit.
      onChange: z.object({
        email: z.union([
          z.literal(""),
          z.email("Enter a valid email address."),
        ]),
        password: z.string(),
      }),
      onSubmit: z.object({
        email: z.email("Enter a valid email address."),
        password: z
          .string()
          .check(z.minLength(1, "Password is required.")),
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
      eyebrow="Welcome back"
      title="Sign in"
      description="Pick up where you left off—accounts, your monthly budget, imports, and chat are all one sign-in away."
      footer={
        <Text>
          New here?{" "}
          <TextLink href={registerHref}>Create an account</TextLink>
        </Text>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <Fieldset>
          <FieldGroup>
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  autoComplete="email"
                  autoFocus
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                />
              )}
            </form.AppField>

            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  autoComplete="current-password"
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </Fieldset>

        {errorMessage ? (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-red-200/90 bg-red-50/95 p-3.5 text-sm text-red-900 shadow-sm dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-100"
          >
            <ExclamationCircleIcon
              className="size-5 shrink-0 text-red-600 dark:text-red-400"
              aria-hidden
            />
            <p className="min-w-0 pt-0.5 leading-snug">{errorMessage}</p>
          </div>
        ) : null}

        <div className="border-t border-zinc-950/8 pt-6 dark:border-white/10">
          <form.AppForm>
            <div className="flex flex-col gap-3 [&_button]:w-full">
              <form.SubscribeButton color="emerald" label="Sign in" />
            </div>
          </form.AppForm>
        </div>
      </form>
    </AuthLayout>
  );
}
