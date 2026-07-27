import Navigation from "@/components/Navigation";
import { LogoutForm } from "@/components/LogoutForm";
import { MainFooter } from "@/components/MainFooter";
import { getLanguagePairFromCookie } from "@/lib/language-pairs";
import { fetchLanguagePairs } from "@/lib/queries/language-pairs";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const [pairs, activePair] = await Promise.all([
    fetchLanguagePairs(supabase),
    getLanguagePairFromCookie(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Navigation
        logoutSlot={<LogoutForm />}
        pairs={pairs}
        activePair={activePair}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <MainFooter />
    </div>
  );
}
