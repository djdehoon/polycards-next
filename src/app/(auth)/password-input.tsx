"use client";

import { useState } from "react";

type PasswordInputProps = {
  id: string;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
};

export function PasswordInput({
  id,
  autoComplete,
  required,
  minLength,
  disabled,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        disabled={disabled}
        className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-11 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:opacity-60"
      />
      <button
        type="button"
        disabled={disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:pointer-events-none disabled:opacity-40"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
