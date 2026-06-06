import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function MainFooter() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">
      <span className="text-zinc-400">{user.email}</span>
    </footer>
  );
}
