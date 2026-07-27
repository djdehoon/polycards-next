"use client";

import { formatAppVersionLabel, isLocalHostname } from "@/lib/app-version-label";
import {
  LANGUAGE_PAIR_COOKIE,
  LANGUAGE_PAIR_STORAGE_KEY,
  parseLanguagePairCode,
  type LanguagePairCode,
} from "@/lib/language-pairs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const LANGUAGE_PAIR_CHANGE_EVENT = "polycards:languagePair";

export function notifyLanguagePairChange(code: LanguagePairCode) {
  window.dispatchEvent(
    new CustomEvent(LANGUAGE_PAIR_CHANGE_EVENT, { detail: code }),
  );
}

function readPairFromCookie(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LANGUAGE_PAIR_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function readActivePair(): LanguagePairCode | null {
  const fromStorage = parseLanguagePairCode(
    localStorage.getItem(LANGUAGE_PAIR_STORAGE_KEY),
  );
  if (fromStorage) return fromStorage;
  return parseLanguagePairCode(readPairFromCookie());
}

function isAppShellPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/browse") ||
    pathname.startsWith("/study") ||
    pathname.startsWith("/stats") ||
    pathname.startsWith("/instructions")
  );
}

export function AppVersionBadge({ version }: { version: string }) {
  const pathname = usePathname();
  const [pair, setPair] = useState<LanguagePairCode | null>(null);
  const [local, setLocal] = useState(false);

  useEffect(() => {
    setPair(readActivePair());
    setLocal(isLocalHostname(window.location.hostname));

    function onPairChange(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      setPair(parseLanguagePairCode(detail) ?? readActivePair());
    }

    function onFocus() {
      setPair(readActivePair());
      setLocal(isLocalHostname(window.location.hostname));
    }

    window.addEventListener(LANGUAGE_PAIR_CHANGE_EVENT, onPairChange);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(LANGUAGE_PAIR_CHANGE_EVENT, onPairChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  // Lin Edition only while using the app on en-es — not on landing/marketing.
  const showLin = pair === "en-es" && isAppShellPath(pathname);
  const label = formatAppVersionLabel(version, {
    linEdition: showLin,
    local,
  });

  return (
    <footer
      className="pointer-events-none fixed bottom-3 right-4 z-50 rounded-md border border-zinc-700/60 bg-zinc-950/85 px-2 py-1 text-xs text-zinc-400 backdrop-blur-sm"
      aria-label={`App version ${label}`}
    >
      {label}
    </footer>
  );
}
