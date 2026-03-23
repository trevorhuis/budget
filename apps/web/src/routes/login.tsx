import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthLayout } from "../components/ui/auth-layout";
import { Button } from "../components/ui/button";
import {
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from "../components/ui/fieldset";
import { Input } from "../components/ui/input";
import { Text, TextLink } from "../components/ui/text";
import {
  getAbsoluteCallbackURL,
  resolveAuthSession,
  sanitizeRedirect,
  useAuth,
} from "../lib/auth";
import { authClient } from "../lib/auth-client";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerHref = `/register?redirect=${encodeURIComponent(
    search.redirect,
  )}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: getAbsoluteCallbackURL(search.redirect),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Unable to sign in.");
        return;
      }

      await auth.refetch();
      window.location.assign(search.redirect);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <form className="space-y-8" onSubmit={handleSubmit}>
        <Fieldset>
          <FieldGroup>
            <Field>
              <Label>Email</Label>
              <Input
                autoComplete="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>

            <Field>
              <Label>Password</Label>
              <Input
                autoComplete="current-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>
          </FieldGroup>
        </Fieldset>

        {errorMessage ? (
          <p className="text-sm/6 text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          color="emerald"
          className="w-full justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
