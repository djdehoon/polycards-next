import Navigation from "@/components/Navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Navigation />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
