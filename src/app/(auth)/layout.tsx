export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            PolyCards
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Flashcards that stick</p>
        </div>
        {children}
      </div>
    </div>
  );
}
