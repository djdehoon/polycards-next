import { logoutAction } from "@/app/(main)/actions";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 sm:text-sm"
      >
        Log uit
      </button>
    </form>
  );
}
