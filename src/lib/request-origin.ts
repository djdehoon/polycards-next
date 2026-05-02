import { headers } from "next/headers";

/** Origin for auth redirects (e.g. email confirmation). Uses forwarded headers when deployed. */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) {
    return "http://localhost:3000";
  }
  const forwardedProto = h.get("x-forwarded-proto");
  const proto =
    forwardedProto ??
    (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
