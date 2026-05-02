"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LoginFormState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Invalid form submission." };
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
