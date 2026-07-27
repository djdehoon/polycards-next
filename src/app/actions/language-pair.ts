"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  LANGUAGE_PAIR_COOKIE,
  parseLanguagePairCode,
  type LanguagePairCode,
} from "@/lib/language-pairs";

export async function setLanguagePair(code: string): Promise<void> {
  const parsed = parseLanguagePairCode(code);
  if (!parsed) return;

  const cookieStore = await cookies();
  const current = parseLanguagePairCode(
    cookieStore.get(LANGUAGE_PAIR_COOKIE)?.value,
  );
  if (current === parsed) return;

  cookieStore.set(LANGUAGE_PAIR_COOKIE, parsed, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}

export async function getLanguagePairCookieValue(): Promise<LanguagePairCode | null> {
  const cookieStore = await cookies();
  return parseLanguagePairCode(cookieStore.get(LANGUAGE_PAIR_COOKIE)?.value);
}
