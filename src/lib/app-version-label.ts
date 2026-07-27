/** True for localhost / loopback / typical private LAN hosts used in mobile testing. */
export function isLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

/** e.g. `v0.4.9 · Lin Edition (local)` or `v0.4.9 (local)`. */
export function formatAppVersionLabel(
  version: string,
  options: { linEdition?: boolean; local?: boolean } = {},
): string {
  let label = version;
  if (options.linEdition) label = `${label} · Lin Edition`;
  if (options.local) label = `${label} (local)`;
  return label;
}
