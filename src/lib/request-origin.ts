import { headers } from "next/headers";

/**
 * Public site origin for auth email redirects (e.g. email confirmation).
 *
 * Order matches metadata site URL resolution:
 * NEXT_PUBLIC_SITE_URL → Vercel production (polycards.nl) → request headers →
 * VERCEL_URL (preview) → localhost for local dev.
 */
export async function getRequestOrigin(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_ENV === "production") {
    return "https://polycards.nl";
  }

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const forwardedProto = h.get("x-forwarded-proto");
      const proto =
        forwardedProto ??
        (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // headers() unavailable outside a request context
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}
