/* eslint-disable react-refresh/only-export-components */

import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
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

const registerOnChangeSchema = z.object({
  name: z.string(),
  email: z.union([
    z.literal(""),
    z.email("Enter a valid email address."),
  ]),
  password: z.string(),
  confirmPassword: z.string(),
});

const registerOnSubmitSchema = z
  .object({
    name: z.string().check(z.trim(), z.minLength(1, "Name is required.")),
    email: z.email("Enter a valid email address."),
    password: z.string().check(z.minLength(1, "Password is required.")),
    confirmPassword: z
      .string()
      .check(z.minLength(1, "Confirm your password.")),
  })
  .check((payload) => {
    if (payload.value.password !== payload.value.confirmPassword) {
      payload.issues.push({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
        input: payload.value.confirmPassword,
      });
    }
  });

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
      onChange: registerOnChangeSchema,
      onSubmit: registerOnSubmitSchema,
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
      eyebrow="Get started"
      title="Create account"
      description="One quick setup—then your budgets, accounts, imports, and chat stay private to this login."
      footer={
        <Text>
          Already have an account?{" "}
          <TextLink href={loginHref}>Sign in instead</TextLink>
        </Text>
      }
    >
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <Fieldset>
          <FieldGroup>
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  autoComplete="name"
                  autoFocus
                  label="Name"
                  placeholder="Your name"
                  type="text"
                />
              )}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  autoComplete="email"
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                />
              )}
            </form.AppField>

            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  autoComplete="new-password"
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                />
              )}
            </form.AppField>

            <form.AppField name="confirmPassword">
              {(field) => (
                <field.TextField
                  autoComplete="new-password"
                  label="Confirm password"
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
              <form.SubscribeButton color="emerald" label="Create account" />
            </div>
          </form.AppForm>
        </div>
      </form>
    </AuthLayout>
  );
}
