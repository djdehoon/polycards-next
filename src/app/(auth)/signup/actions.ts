"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRequestOrigin } from "@/lib/request-origin";

export type SignupFormState = {
  error: string | null;
  message: string | null;
  /** When set, client should navigate (avoid `redirect()` here for useActionState + Turbopack). */
  redirectTo: string | null;
};

function state(
  partial: Partial<SignupFormState> = {},
): SignupFormState {
  return {
    error: null,
    message: null,
    redirectTo: null,
    ...partial,
  };
}

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      return state({ error: "Invalid form submission." });
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return state({ error: "Email and password are required." });
    }

    if (password.length < 8) {
      return state({ error: "Password must be at least 8 characters." });
    }

    const origin = await getRequestOrigin();
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return state({ error: error.message });
    }

    if (data.session) {
      return state({ redirectTo: "/dashboard" });
    }

    return state({
      message:
        "Check your email to confirm your account before signing in.",
    });
  } catch (err) {
    console.error("signupAction:", err);
    return state({
      error: "Something went wrong. Please try again.",
    });
  }
}
