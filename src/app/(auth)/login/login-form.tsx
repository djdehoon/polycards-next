"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PasswordInput } from "../password-input";
import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = { error: null };

const callbackErrorText = {
  missing_code: "The confirmation link is missing or invalid.",
  could_not_confirm:
    "We could not confirm your email. Try again or use a new link from your inbox.",
} as const;

function getCallbackErrorMessage(
  key: string | null | undefined,
): string | null {
  if (key === "missing_code" || key === "could_not_confirm") {
    return callbackErrorText[key];
  }
  return null;
}

export function LoginForm({ urlErrorKey }: { urlErrorKey?: string | null }) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const callbackError = getCallbackErrorMessage(urlErrorKey);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Password
        </label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          required
        />
      </div>
      {callbackError ? (
        <p className="text-sm text-red-600" role="alert">
          {callbackError}
        </p>
      ) : null}
      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Sign in
      </button>
      <p className="text-center text-sm text-zinc-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-zinc-900 underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
