"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { PasswordInput } from "../password-input";
import { signupAction, type SignupFormState } from "./actions";

const initialState: SignupFormState = {
  error: null,
  message: null,
  redirectTo: null,
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const url = state.redirectTo;
    if (!url) {
      return;
    }

    let cancelled = false;

    // Defer navigation until after React commits useActionState updates (avoids
    // "state update on a component that hasn't mounted yet" with Turbopack).
    const timerId = window.setTimeout(() => {
      if (cancelled || !mountedRef.current) {
        return;
      }
      window.location.assign(url);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [state.redirectTo]);

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
          disabled={isPending}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:opacity-60"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Password
        </label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={isPending}
        />
        <p className="text-xs text-zinc-500">At least 8 characters.</p>
      </div>
      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-green-700" role="status">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
