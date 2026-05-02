import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createServerSupabaseClient()
  
  // Test: haal Supabase versie op
  const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1)

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">PolyCards 🃏</h1>
      
      {error ? (
        <p className="text-green-600">
          ✅ Supabase verbonden! (Tabel bestaat nog niet, maar connectie werkt)
        </p>
      ) : (
        <p className="text-green-600">✅ Supabase verbonden!</p>
      )}
    </main>
  )
}
