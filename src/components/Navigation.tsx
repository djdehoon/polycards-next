"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/browse", label: "Browse" },
  { href: "/stats", label: "Stats" },
  { href: "/study", label: "Study" },
] as const;

function navClass(active: boolean): string {
  const base =
    "rounded-md px-3 py-2 text-sm transition hover:bg-zinc-800 hover:text-zinc-50";
  if (active) {
    return `${base} font-semibold text-zinc-50 underline decoration-zinc-500 underline-offset-4`;
  }
  return `${base} font-medium text-zinc-300`;
}

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900 text-zinc-100">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/dashboard"
          className="shrink-0 text-lg font-semibold tracking-tight text-white"
          onClick={() => setOpen(false)}
        >
          🇺🇦 PolyCards
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-zinc-700 p-2 text-zinc-200 md:hidden"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden className="text-lg">
            {open ? "✕" : "☰"}
          </span>
        </button>

        <nav
          id="primary-nav"
          className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full flex-col gap-1 border-b border-zinc-800 bg-zinc-900 px-4 py-3 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:py-0`}
        >
          {links.map(({ href, label }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={navClass(active)}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
