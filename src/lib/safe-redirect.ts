/** Same-origin path + optional query/hash only (no protocol). */
export function safeInternalPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  try {
    const u = new URL(trimmed, "http://local.invalid");
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return null;
  }
}
