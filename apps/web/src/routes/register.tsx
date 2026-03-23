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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref = `/login?redirect=${encodeURIComponent(search.redirect)}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: getAbsoluteCallbackURL(search.redirect),
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Unable to create account.");
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
      <form className="space-y-8" onSubmit={handleSubmit}>
        <Fieldset>
          <FieldGroup>
            <Field>
              <Label>Name</Label>
              <Input
                autoComplete="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </Field>

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
                autoComplete="new-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>

            <Field>
              <Label>Confirm password</Label>
              <Input
                autoComplete="new-password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
