"use client";

import { useActionState, useState } from "react";
import { signInAction, signUpAction, type ActionState } from "@/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { ActionMessage, FieldLabel, TextInput } from "@/components/forms/shared";

const demoAccounts = [
  { label: "Student demo", email: "mia@copperglow.demo", password: "demo1234" },
  { label: "Provider demo", email: "provider@copperglow.demo", password: "demo1234" },
];

type Props = {
  mode: "sign-in" | "sign-up";
  redirectTo?: string;
};

export function AuthForm({ mode, redirectTo }: Props) {
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction] = useActionState<ActionState, FormData>(action, { status: "idle" });
  const [credentials, setCredentials] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  const setDemo = (email: string, password: string) => {
    setCredentials((current) => ({
      ...current,
      email,
      password,
      firstName: current.firstName || "Demo",
      lastName: current.lastName || "User",
      phone: current.phone || "(520) 555-0000",
    }));
  };

  return (
    <form action={formAction} className="space-y-4 rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_54px_rgba(42,29,24,0.08)]">
      {mode === "sign-in" ? (
        <div className="space-y-3 rounded-[24px] bg-[color:var(--color-surface-soft)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-ink-muted)]">
            Demo access
          </p>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => setDemo(account.email, account.password)}
                className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2 text-xs font-medium text-[color:var(--color-ink)] transition hover:border-[color:var(--color-accent-strong)]"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {mode === "sign-up" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>First name</FieldLabel>
            <TextInput
              name="firstName"
              value={credentials.firstName}
              onChange={(event) => setCredentials((current) => ({ ...current, firstName: event.target.value }))}
              placeholder="Ari"
            />
          </div>
          <div>
            <FieldLabel>Last name</FieldLabel>
            <TextInput
              name="lastName"
              value={credentials.lastName}
              onChange={(event) => setCredentials((current) => ({ ...current, lastName: event.target.value }))}
              placeholder="James"
            />
          </div>
        </div>
      ) : null}

      <div>
        <FieldLabel>Email</FieldLabel>
        <TextInput
          name="email"
          value={credentials.email}
          onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
          placeholder="you@example.com"
        />
      </div>

      {mode === "sign-up" ? (
        <div>
          <FieldLabel>Phone</FieldLabel>
          <TextInput
            name="phone"
            value={credentials.phone}
            onChange={(event) => setCredentials((current) => ({ ...current, phone: event.target.value }))}
            placeholder="(520) 555-0123"
          />
        </div>
      ) : null}

      <div>
        <FieldLabel>Password</FieldLabel>
        <TextInput
          type="password"
          name="password"
          value={credentials.password}
          onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
          placeholder={mode === "sign-in" ? "demo1234" : "At least 8 characters"}
        />
      </div>

      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <ActionMessage status={state.status} message={state.message} />
      <FormSubmitButton className="w-full" size="lg" pendingLabel={mode === "sign-in" ? "Signing in..." : "Creating account..."}>
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </FormSubmitButton>
    </form>
  );
}
